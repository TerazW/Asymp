# Mandate: Operational Coordination for the Agent Era

**Version 5.3 Complete Technical Specification | January 2026**

---

# PART A: DESIGN PHILOSOPHY

## Chapter 1: Core Beliefs

### 1.1 The Question

**The question is not "can the system prevent mistakes" — it's "can humans intervene in time."**

### 1.2 Key Principles

1. Pre-execution approval is a decelerator
2. Rollback is a social capability, not technical
3. Governance should be decentralized
4. We're advisory, not executor
5. Fast to try, hard to repeat mistakes

---

# PART B: SYSTEM ARCHITECTURE FUNDAMENTALS

## Chapter 2: Push vs Pull Architecture

### 2.1 Our Choice: Push-Based with Pull Fallback

**Primary**: Push-based (events pushed to us, notifications pushed to users)

**Why push**:
- Lower latency (no polling delay)
- Real-time coordination requires real-time data
- More efficient at scale (no wasted poll requests)

**Pull fallback for**:
- Reconnection (pull missed events)
- Historical queries (pull from archive)
- Batch analytics (pull for reports)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agent ──push──▶ Mandate ──push──▶ Slack/PagerDuty             │
│                     │                                           │
│                     ▼                                           │
│                  Storage                                        │
│                     │                                           │
│                     ◀──pull── Dashboard (queries)               │
│                     ◀──pull── Reconnect (catch-up)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Event Sourcing Decision

**We use event sourcing for the event log.**

**Why**:
- Complete audit trail (append-only)
- Replay capability (for debugging, testing rules)
- Natural fit for "what happened" queries

**What's event-sourced**:
- Action events
- Notification events
- Response events

**What's NOT event-sourced** (state-based):
- Ownership mappings (current state matters most)
- Routing rules (current version matters)
- User preferences (simple CRUD)

**Tradeoff**: Event sourcing adds complexity. We limit it to where it provides clear value.

---

## Chapter 3: Event Schema and Versioning

### 3.1 Idempotency Key Design

**Idempotency key composition**:
```
idempotency_key = hash(
  actor_id +
  action_type +
  resource_id +
  timestamp_rounded_to_1s +
  content_hash  // Hash of action parameters
)
```

**Why these fields**:
- `actor_id`: Same actor
- `action_type`: Same action
- `resource_id`: Same target
- `timestamp_rounded`: Within same second (clock tolerance)
- `content_hash`: Same content (prevents different actions at same time)

**Deduplication window**: 5 minutes

**Storage**: Redis SET with TTL
```
SADD dedup:{tenant_id}:{idempotency_key} EX 300
```

### 3.2 Schema Versioning

**Schema version in every event**:
```json
{
  "schema_version": "1.2",
  "event_type": "action",
  ...
}
```

**Backward compatibility strategy**:
- **Minor versions (1.1 → 1.2)**: Additive only, old clients still work
- **Major versions (1.x → 2.x)**: Breaking changes, migration path provided

**Compatibility matrix**:
```
Event v1.x readable by: Backend v1.x, v2.x
Event v2.x readable by: Backend v2.x, v3.x
Backend v2.x writes: Event v2.x (with v1 compat fields)
```

**Schema evolution rules**:
1. New fields are optional with defaults
2. Removed fields kept for 2 versions (deprecated)
3. Type changes require new field name
4. Enum additions are minor, removals are major

### 3.3 Large Payload Handling

**Problem**: Tool inputs/outputs can be huge (MB+)

**Solution**: Tiered storage

```
Payload size:
├── < 10KB: Inline in event (Postgres JSONB)
├── 10KB - 1MB: Compressed, inline
├── 1MB - 100MB: External storage (S3), reference in event
└── > 100MB: Rejected (configurable limit)

Event structure:
{
  "action": {
    "type": "api_call",
    "payload_ref": {
      "type": "inline" | "s3",
      "size": 52400,
      "hash": "sha256:...",
      "location": "s3://bucket/path"  // If external
    }
  }
}
```

**Payload retrieval**: On-demand, with caching

### 3.4 Payload Redaction

**Redaction rules** (configurable per tenant):
```yaml
redaction:
  patterns:
    - name: "api_keys"
      regex: "(api[_-]?key|apikey)[\"'\\s:=]+[a-zA-Z0-9]{20,}"
      replacement: "[REDACTED:api_key]"
      
    - name: "passwords"
      regex: "(password|passwd|pwd)[\"'\\s:=]+[^\\s\"']{8,}"
      replacement: "[REDACTED:password]"
      
    - name: "credit_cards"
      regex: "\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b"
      replacement: "[REDACTED:card]"
      
    - name: "ssn"
      regex: "\\b\\d{3}-\\d{2}-\\d{4}\\b"
      replacement: "[REDACTED:ssn]"
      
  allowlist:
    - field: "action.type"  # Never redact action type
    - field: "actor.id"     # Never redact actor
    
  custom_dlp:
    enabled: false  # Enterprise: integrate with customer DLP
```

**Redaction is irreversible**: Original not stored (unless compliance mode)

### 3.5 Secret Detection

**Detection methods** (layered):

| Method | Speed | Accuracy | Use |
|--------|-------|----------|-----|
| Regex patterns | Fast | Medium | First pass |
| Entropy analysis | Medium | Medium | High-entropy strings |
| Known formats | Fast | High | AWS keys, GitHub tokens |
| Custom DLP | Slow | High | Enterprise integration |

**False positive handling**:
- Mark as "possibly_redacted" not "definitely_secret"
- User can request review
- Original retrievable for 24h (with audit)
- After 24h, permanently redacted

### 3.6 "Original Must Be Traceable" Requirement

**Compliance mode** (opt-in, enterprise):
```yaml
compliance:
  retain_originals: true
  original_storage: "separate_encrypted_bucket"
  access: "legal_hold_only"
  retention: "7_years"
  access_audit: true
```

**How it works**:
- Redacted version in main system
- Original in separate encrypted storage
- Access requires legal/compliance approval
- All access audited

---

## Chapter 4: Time and Ordering

### 4.1 Event Time vs Processing Time

| Time type | Definition | Use |
|-----------|------------|-----|
| **Event time** | When action occurred (agent's clock) | Causal ordering |
| **Ingestion time** | When we received it (our clock) | SLA measurement |
| **Processing time** | When we processed it | Debugging |

**All three stored**:
```json
{
  "timestamp": 1706123456789,        // Event time (from agent)
  "received_at": 1706123456850,      // Ingestion time (our server)
  "processed_at": 1706123456900      // Processing time
}
```

### 4.2 Clock Sources and Drift

**Our clock**: NTP-synced servers (AWS time sync service)

**Expected drift**: <100ms from true time

**Handling agent clock drift**:
```
IF event_time > received_at + 5_minutes:
  flag: "future_timestamp"
  use: received_at for ordering
  
IF event_time < received_at - 1_hour:
  flag: "stale_timestamp"
  use: received_at for ordering
  alert: "Agent X has significant clock drift"
```

### 4.3 Out-of-Order Events

**Scenario**: Event B arrives before event A, but A happened first.

**Detection**: Sequence numbers per actor
```json
{
  "actor_id": "agent-123",
  "sequence": 42,  // Monotonic per actor
  "timestamp": ...
}
```

**Handling**:
```
IF event.sequence < last_seen_sequence[actor]:
  flag: "out_of_order"
  insert_in_correct_position()  // By sequence, not arrival
  
IF gap_in_sequence:
  flag: "possible_missing_events"
  wait: 30s for gap to fill
  then: alert if still missing
```

### 4.4 Logical Order Reconstruction

**For causal ordering** (what caused what):
1. Use `parent_action_id` if present
2. Else use `session_id` + `sequence`
3. Else use `timestamp` + `received_at`

**Display**: Timeline shows event time, with "received late" indicator if out of order

---

## Chapter 5: Storage Architecture

### 5.1 Hot/Warm/Cold Tiering

| Tier | Storage | Retention | Access pattern |
|------|---------|-----------|----------------|
| **Hot** | Postgres | 7 days | Real-time queries |
| **Warm** | Postgres (partitioned) | 90 days | Recent history |
| **Cold** | S3 + Parquet | 1-7 years | Archive, compliance |

**Automatic tiering**:
```
Daily job:
- Events > 7 days old: Move to warm partition
- Events > 90 days old: Export to S3, drop from Postgres
- Parquet files: Partitioned by tenant/date
```

### 5.2 High-Throughput Postgres Writes

**Techniques**:

| Technique | Implementation |
|-----------|----------------|
| **Batch inserts** | Collect 100 events or 100ms, batch insert |
| **COPY instead of INSERT** | For bulk loads |
| **Partitioning** | By timestamp (daily/weekly) |
| **Minimal indexes** | Only essential indexes on write path |
| **Async index updates** | Non-critical indexes updated async |
| **Connection pooling** | PgBouncer, 100 connections |

**Write path**:
```
Event received
    │
    ▼
Validation (sync, <5ms)
    │
    ▼
Batch buffer (collect up to 100 or 100ms)
    │
    ▼
Batch COPY to Postgres
    │
    ▼
Publish to Redis (for real-time)
```

### 5.3 Partition Key Design

**Primary partition**: `tenant_id + date`

**Why**:
- Tenant isolation (no cross-tenant queries)
- Time-based queries are common
- Easy retention (drop old partitions)

**Avoiding hot spots**:
```sql
-- Partition by tenant + date
CREATE TABLE events (
    id UUID,
    tenant_id UUID,
    timestamp TIMESTAMPTZ,
    ...
) PARTITION BY LIST (tenant_id);

-- Each tenant partition further partitioned by date
CREATE TABLE events_tenant_abc PARTITION OF events
    FOR VALUES IN ('tenant-abc')
    PARTITION BY RANGE (timestamp);
```

**For very large tenants**: Further partition by `actor_id` hash

### 5.4 Lock Contention Handling

**Problem**: High concurrent writes to same table

**Solutions**:

| Solution | Implementation |
|----------|----------------|
| **No UPDATE on events** | Append-only, no lock contention |
| **Separate sequences** | Per-actor sequence, not global |
| **Optimistic locking** | For state tables (ownership) |
| **Queue writes** | Kafka/Redis as write buffer |

**When to add Kafka**:
```
IF sustained_writes > 5000/sec:
  Add Kafka as write buffer
  
IF write latency P99 > 100ms:
  Add Kafka to absorb spikes
```

---

## Chapter 6: Real-Time Infrastructure

### 6.1 When to Add Message Queue

**Trigger points**:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Write throughput | >5K/sec sustained | Add Kafka |
| Write latency P99 | >100ms | Add Kafka |
| Consumer lag | >30s | Add more consumers |
| Fanout ratio | >100 subscribers | Add Redis pub/sub |

**Queue choice**:
- **Kafka**: Durable, ordered, high-throughput writes
- **Redis Streams**: Simpler, lower latency, less durable
- **NATS**: Lightweight, good for pub/sub

**Our default**: Redis Streams for MVP, Kafka when needed

### 6.2 Backpressure Handling

**Producer side** (agents sending events):
```
Response codes:
- 200: Accepted
- 429: Slow down (rate limit)
- 503: System overloaded, retry later

Retry policy:
- Exponential backoff: 100ms, 200ms, 400ms, ...
- Max retries: 5
- Circuit breaker: If 10 failures, stop for 30s
```

**Consumer side** (processing events):
```
IF queue_depth > 10000:
  - Stop accepting new events (429)
  - Alert: "Processing backlog"
  
IF consumer_lag > 60s:
  - Scale up consumers
  - Alert: "Consumer falling behind"
```

### 6.3 Fanout Architecture

**Problem**: One event → notify 1000 subscribers

**Solution**: Two-level fanout

```
Event received
    │
    ▼
Level 1: Topic fanout (Redis pub/sub)
├── tenant:abc:events (all events for tenant)
├── service:payments:events (all events for service)
└── user:alice:notifications (user's notifications)
    │
    ▼
Level 2: Connection fanout (per WebSocket server)
├── WS Server 1: 200 connections subscribed
├── WS Server 2: 150 connections subscribed
└── WS Server 3: 180 connections subscribed
```

**Avoiding N² notifications**:
- Deduplicate by notification ID
- Aggregate same-target notifications
- Rate limit per recipient

### 6.4 Subscription Model

**Subscription types**:
```yaml
subscriptions:
  - type: "service"
    filter: { service_id: "payments-service" }
    
  - type: "owner"
    filter: { owner_id: "alice@company.com" }
    
  - type: "incident"
    filter: { incident_id: "INC-234" }
    
  - type: "tag"
    filter: { tags: ["production", "critical"] }
    
  - type: "custom"
    filter: { "action.type": "deploy", "resource.env": "prod" }
```

**Subscription storage**: Redis sorted sets
```
ZADD subscriptions:tenant:abc {score=priority} {subscription_json}
```

---

## Chapter 7: WebSocket Layer

### 7.1 Multi-Tenant WebSocket Isolation

**Connection structure**:
```
Connection {
  conn_id: "ws-123",
  tenant_id: "tenant-abc",    // From auth token
  user_id: "alice@company.com",
  subscriptions: ["service:payments", "owner:alice"],
  connected_at: timestamp,
  last_ping: timestamp
}
```

**Isolation enforced at**:
1. Authentication (token contains tenant_id)
2. Subscription (can only subscribe to own tenant)
3. Message delivery (checked before send)

### 7.2 WebSocket Authentication

**Initial auth**:
```
Client connects → Send auth message with JWT
                 │
Server validates JWT
                 │
                 ├── Valid: Connection established
                 └── Invalid: Close connection (4001)
```

**Token structure**:
```json
{
  "sub": "alice@company.com",
  "tenant_id": "tenant-abc",
  "roles": ["responder"],
  "exp": 1706209856,  // 1 hour
  "jti": "token-id-for-revocation"
}
```

**Token refresh**:
- Token expires in 1 hour
- Client sends refresh request before expiry
- Server issues new token, seamless to connection

**Token revocation**:
```
Revocation event:
1. Add token_id to revocation list (Redis, TTL = token lifetime)
2. Publish to all WS servers: "revoke token X"
3. WS servers check active connections, close matching
```

### 7.3 Reconnection and Missed Events

**Client-side**:
```javascript
let lastEventId = null;

ws.onmessage = (event) => {
  lastEventId = event.id;
  // Process event
};

ws.onclose = () => {
  // Reconnect with exponential backoff
  reconnect(lastEventId);
};

function reconnect(lastId) {
  ws = new WebSocket(url);
  ws.onopen = () => {
    ws.send({ type: "subscribe", lastEventId: lastId });
  };
}
```

**Server-side catchup**:
```
On subscribe with lastEventId:
1. Check Redis (last 5 min of events)
2. If lastEventId found: Send events after it
3. If not found: Query Postgres, send from there
4. Mark client as "caught up"
5. Start real-time streaming
```

**Cursor/offset design**:
```json
{
  "cursor": "tenant-abc:1706123456789:evt-123",
  "type": "composite"  // tenant:timestamp:eventId
}
```

### 7.4 Notification Deduplication

**Problem**: Reconnect might cause duplicate notifications

**Solution**: Idempotent notifications

```
Notification {
  notification_id: "notif-456",  // Stable ID
  event_id: "evt-123",           // Source event
  recipient: "alice",
  sent_count: 1,                 // Track retries
  first_sent_at: timestamp
}
```

**Client-side dedup**:
```javascript
const seen = new Set();  // LRU cache, last 1000

function onNotification(notif) {
  if (seen.has(notif.notification_id)) return;
  seen.add(notif.notification_id);
  display(notif);
}
```

---

## Chapter 8: Rate Limiting and Protection

### 8.1 Rate Limit Layers

| Layer | Limit | Scope | Action |
|-------|-------|-------|--------|
| **Global** | 100K req/min | Entire system | 503, alert |
| **Per-tenant** | 10K req/min | Tenant | 429, notify admin |
| **Per-user** | 1K req/min | User | 429 |
| **Per-IP** | 500 req/min | IP | 429, possible block |
| **Per-endpoint** | Varies | Specific API | 429 |

**Implementation**: Redis sliding window
```
MULTI
ZADD ratelimit:{key} {now} {request_id}
ZREMRANGEBYSCORE ratelimit:{key} 0 {now - window}
ZCARD ratelimit:{key}
EXPIRE ratelimit:{key} {window}
EXEC
```

### 8.2 Malicious Event Flood Protection

**Detection**:
```
IF events_per_second[actor] > 100:
  flag: "suspicious_volume"
  
IF events_per_second[tenant] > 1000:
  flag: "possible_attack"
  
IF unique_actors_per_minute[tenant] > 100 AND all_new:
  flag: "possible_credential_stuffing"
```

**Response**:
1. Rate limit the actor/tenant
2. Queue events for review (don't drop)
3. Alert security team
4. Temporary block if continues

### 8.3 WAF Considerations

**Do we need WAF?**

**Yes, for**:
- Public-facing API endpoints
- SQL injection protection
- XSS protection

**Our approach**:
- Cloud provider WAF (AWS WAF, Cloudflare)
- Not custom-built
- Standard OWASP rules

---

## Chapter 9: Access Control

### 9.1 RBAC Design

**Roles**:

| Role | Capabilities |
|------|--------------|
| `viewer` | Read events, incidents for assigned resources |
| `responder` | + Acknowledge, respond to notifications |
| `operator` | + Pause agents, trigger escalation |
| `admin` | + Manage rules, ownership, users |
| `super_admin` | + Billing, audit logs, tenant settings |

**Permission structure**:
```json
{
  "role": "responder",
  "scope": {
    "type": "service",
    "ids": ["payments-service", "billing-service"]
  },
  "grants": [
    "events:read",
    "incidents:read",
    "incidents:respond",
    "notifications:acknowledge"
  ]
}
```

### 9.2 Temporary Permissions

**Scenario**: During incident, analyst needs temporary access.

**Implementation**:
```json
{
  "grant": {
    "user": "analyst@company.com",
    "permissions": ["events:read:*", "incidents:read:*"],
    "reason": "Investigating INC-234",
    "approved_by": "admin@company.com",
    "expires_at": "2026-01-15T18:00:00Z",  // 4 hours
    "incident_id": "INC-234"
  }
}
```

**Auto-expiration**: Job runs every minute, revokes expired grants.

**Audit**: All temp grants logged with approver, reason, duration.

### 9.3 Break Glass Mechanism

**When**: Emergency access needed, normal approval too slow.

**Process**:
```
1. User requests break glass
2. System grants immediately
3. Notifies ALL admins: "Break glass by X for reason Y"
4. Logs everything user does
5. Auto-expires in 1 hour
6. Requires post-incident review
```

**Abuse prevention**:
- All actions during break glass logged verbosely
- Weekly report: "Break glass usage"
- >2 uses/month by same user → review required
- Fake reasons → policy violation

**Break glass audit entry**:
```json
{
  "type": "break_glass",
  "user": "alice@company.com",
  "reason": "Production down, need to check agent logs",
  "granted_at": "2026-01-15T14:32:00Z",
  "expires_at": "2026-01-15T15:32:00Z",
  "actions_taken": ["viewed INC-234", "viewed 45 events"],
  "reviewed": false,
  "reviewer": null
}
```

---

## Chapter 10: External Integrations

### 10.1 Fitting Into Existing Incident Management

**Problem**: Customers already have ITIL, ServiceNow, etc.

**Our approach**: Complement, don't replace.

```
Their flow:                    Our addition:
Incident detected       →      We provide: faster detection
     │                         We provide: attribution
     ▼                         We provide: blast radius
Ticket created          →      We can: create ticket via API
     │                         We can: link to our data
     ▼
Investigation           →      We provide: timeline, causal analysis
     │
     ▼
Resolution              →      We track: what fixed it
     │
     ▼
Postmortem              →      We generate: draft from our data
```

**Integration modes**:
1. **Standalone**: Use us instead of existing tools
2. **Overlay**: Use us for detection/attribution, their tool for ticketing
3. **Embedded**: Our widget in their dashboard

### 10.2 Lightweight Onboarding

**"Don't push over my process"**:

1. **No required workflow changes**: We observe, don't mandate
2. **Opt-in features**: Start with visibility, add routing later
3. **Gradual rollout**: One team, then more
4. **Familiar integrations**: Slack, PagerDuty work as expected
5. **Export everything**: Data is yours, export anytime

### 10.3 OpenTelemetry Alignment

**Do we depend on OTel?**

**No, but we integrate.**

**Why not depend**:
- Not all customers have OTel
- OTel is observability, we're coordination
- Our value exists without OTel

**How we integrate**:
```
OTel trace_id in our event:
{
  "metadata": {
    "trace_id": "abc123...",  // From OTel
    "span_id": "def456..."
  }
}

Correlation:
- Our event + OTel span = full picture
- Link to Jaeger/Datadog trace from our UI
```

**Mapping**:
| Our concept | OTel concept |
|-------------|--------------|
| Action | Span |
| Actor | service.name + attribute |
| Session | trace_id |
| Resource | resource attributes |

### 10.4 Agent Run to Trace Mapping

```
Agent run:
├── trace_id: "trace-123" (if OTel enabled)
├── Our session_id: "session-456"
└── Actions:
    ├── action_001: span_id "span-a"
    ├── action_002: span_id "span-b"
    └── action_003: span_id "span-c"
```

**If no OTel**: We create our own trace-like session.

### 10.5 Tool Call to Resource Access Mapping

**One tool call → multiple API requests**:

```
Tool: deploy()
├── Our record: action "deploy"
└── Nested (from cloud audit):
    ├── k8s.apply (resource: deployment/payments)
    ├── k8s.apply (resource: service/payments)
    └── ecr.pull (resource: image:v2.3.1)
```

**Mapping strategy**:
- Primary attribution: Tool call (what agent did)
- Detail attribution: Nested calls (how it happened)
- Displayed: Both, collapsible

---

## Chapter 11: Incident Lifecycle

### 11.1 Event to Incident Upgrade Decision

**When does an event become an incident?**

| Trigger | Automatic? | Confidence |
|---------|------------|------------|
| Explicit error in event | Yes | High |
| External alert (PagerDuty) | Yes | High |
| User reports "incident" | Yes | High |
| Threshold breach (opt-in) | Yes | Medium |
| Pattern match to past incident | Suggest | Medium |
| Anomaly detection (opt-in) | Suggest | Low |

**Decision flow**:
```
Event arrives
    │
    ├── Has error flag? → Create incident
    │
    ├── Matches alert rule? → Create incident
    │
    ├── Matches past incident pattern? → Suggest incident
    │
    └── Normal event → Log, monitor
```

### 11.2 Incident State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCIDENT STATES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  detected ──▶ investigating ──▶ contained ──▶ resolved         │
│      │            │    │           │            │               │
│      │            │    │           │            ▼               │
│      │            │    │           │       postmortem           │
│      │            │    │           │            │               │
│      │            │    │           │            ▼               │
│      │            │    │           │         closed             │
│      │            │    │           │                            │
│      ▼            │    ▼           ▼                            │
│  false_alarm      │  escalated   reopened                       │
│                   │                                             │
│                   ▼                                             │
│              merged (into another incident)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**State transitions**:
| From | To | Trigger |
|------|-----|---------|
| detected | investigating | Responder assigned |
| detected | false_alarm | Marked as not real |
| investigating | contained | Bleeding stopped |
| investigating | escalated | No response / severity increased |
| contained | resolved | Root cause fixed |
| resolved | postmortem | Auto after 24h |
| resolved | reopened | Same symptoms return |
| * | merged | Linked to another incident |

### 11.3 Avoiding Mis-Aggregation

**Problem**: Unrelated events grouped into same incident.

**Safeguards**:
1. **Same resource required**: Events must share resource
2. **Time window**: Default 15 min, configurable
3. **Error type matching**: Similar error signatures
4. **Manual override**: Always allow split/merge

**Split flow**:
```
Incident INC-234 (5 events)
User: "Events 4-5 are different issue"
Action: Split into INC-234 (events 1-3) + INC-235 (events 4-5)
Audit: Split recorded with reason
```

**Merge flow**:
```
Incident INC-234 + INC-235
User: "Same root cause"
Action: Merge into INC-234, INC-235 becomes alias
Audit: Merge recorded with reason
```

### 11.4 Interleaved Incidents

**Scenario**: Two incidents happening simultaneously on related systems.

**Handling**:
1. Each incident tracked separately
2. "Related incidents" link shown
3. Shared channel if same responders
4. Timeline view can show both

**Display**:
```
Active incidents (related):
├── INC-234: payments-service down
│   └── May be related to INC-235
└── INC-235: user-service errors
    └── May be related to INC-234
    
[View combined timeline] [Merge if same cause]
```

---

## Chapter 12: Network and Transient Failures

### 12.1 Network Jitter Handling

**Problem**: Network blip causes false "failure" signal.

**Handling**:
```yaml
transient_failure_detection:
  # Don't alert on single failure if retry succeeds
  retry_window: 5s
  retry_count: 3
  
  # If all retries fail, then alert
  alert_after: "all_retries_exhausted"
  
  # If intermittent (some succeed, some fail)
  intermittent_threshold: 0.5  # >50% fail = alert
```

### 12.2 External Dependency SLA Noise

**Problem**: Third-party API has 99% SLA, so 1% failures are "normal".

**Handling**:
```yaml
external_dependencies:
  - name: "stripe"
    expected_error_rate: 0.01  # 1%
    alert_threshold: 0.05       # Alert if >5%
    baseline_window: 1h
```

**Display**:
```
Stripe errors: 0.8% (within normal range)
             vs
Stripe errors: 5.2% (elevated, may need attention)
```

### 12.3 External Failure Attribution

**Can we attribute internal incident to external cause?**

**Limited**:
```
Correlation evidence:
├── AWS us-east-1 degraded (from status page)
├── Our incident affects us-east-1 services
├── Timeline matches
└── Confidence: POSSIBLE (not confirmed)

Display:
"This incident may be related to AWS us-east-1 degradation.
Check AWS status before deep internal investigation."
```

---

## Chapter 13: UI Design

### 13.1 30-Second Comprehension Design

**Goal**: Understand "who did what" in 30 seconds.

**Incident summary view**:
```
┌────────────────────────────────────────────────────────────────┐
│ 🔴 INC-234: payments-service degraded          [INVESTIGATING] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ WHAT: Payment API returning 500s                              │
│ WHEN: Started 15 min ago                                      │
│ WHO CAUSED: Agent "deployer" deployed v2.3.1 (likely cause)   │
│ WHO'S ON IT: @alice (investigating)                           │
│ IMPACT: 3 services affected, ~500 requests failed             │
│                                                                │
│ [Timeline] [Blast Radius] [Suggested Actions]                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 13.2 Timeline View

```
Timeline for INC-234:
────────────────────────────────────────────────────────
14:30:00  🤖 Agent "deployer" deployed payments-service v2.3.1
14:30:15  ⚠️  First error detected in payments-service
14:30:20  🔔 @alice notified (primary owner)
14:30:45  👤 @alice acknowledged
14:31:00  ⚠️  Error rate >10%, incident created
14:32:00  🔔 @payments-oncall paged (escalation)
14:35:00  👤 @bob joined from on-call
14:40:00  ▶️  Rollback initiated by @alice
14:42:00  ✅ Rollback complete, errors decreasing
────────────────────────────────────────────────────────
[Filter: All | Actions | Notifications | Human responses]
```

### 13.3 Diff View (Before/After)

```
Config change by Agent "config-gen" at 14:29:55:

payments-service/config.yaml:
─────────────────────────────
  database:
    pool_size: 10        →  pool_size: 5    ← CHANGED
    timeout: 30s
  
  cache:
-   enabled: true                           ← REMOVED
+   enabled: false                          ← ADDED
    ttl: 300
─────────────────────────────
[View full file] [Revert this change]
```

### 13.4 Owner Graph Visualization

```
Ownership for payments-service:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌──────────────┐                            │
│                    │ payments-    │                            │
│                    │ service      │                            │
│                    └──────┬───────┘                            │
│                           │                                     │
│            ┌──────────────┼──────────────┐                     │
│            ▼              ▼              ▼                     │
│     ┌──────────┐   ┌──────────┐   ┌──────────┐                │
│     │ @alice   │   │ @bob     │   │ payments │                │
│     │ (owner)  │   │ (oncall) │   │ -team    │                │
│     └──────────┘   └──────────┘   └──────────┘                │
│            │                             │                     │
│            ▼                             ▼                     │
│     ┌──────────┐                  ┌──────────┐                │
│     │ @carol   │                  │ @dave    │                │
│     │ (backup) │                  │ (lead)   │                │
│     └──────────┘                  └──────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
Escalation path: @alice → @bob → @dave
```

### 13.5 Blast Radius Visualization

```
Blast radius for deploy v2.3.1:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────┐                                               │
│  │ payments-   │ ◀── DIRECT (deployed)                        │
│  │ service     │                                               │
│  └──────┬──────┘                                               │
│         │ depends_on                                            │
│         ▼                                                       │
│  ┌─────────────┐     ┌─────────────┐                          │
│  │ payments-db │     │ user-service│ ◀── DOWNSTREAM           │
│  └─────────────┘     └─────────────┘     (calls payments)     │
│         │                   │                                   │
│         ▼                   ▼                                   │
│  ┌─────────────┐     ┌─────────────┐                          │
│  │ billing-    │     │ notification│ ◀── POSSIBLY AFFECTED    │
│  │ service     │     │ -service    │                          │
│  └─────────────┘     └─────────────┘                          │
│                                                                 │
│  Owners notified: @alice, @bob, @user-team, @billing-team     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
[Expand all] [Show owner details]
```

### 13.6 Showing Uncertainty in UI

**Principle**: Show uncertainty without annoying users.

**Techniques**:
1. **Visual indicators**: Dashed lines for "possible", solid for "confirmed"
2. **Confidence badges**: `[LIKELY 85%]` vs `[SUSPECTED 40%]`
3. **Hover for details**: "Why we think this" on hover
4. **Collapsible low-confidence**: Hide <50% by default

**Example**:
```
Root cause analysis:
──────────────────────────────────────────
[LIKELY - 85%] Deploy of payments-service v2.3.1
━━━━━━━━━━━━━━ Evidence: Error message, timing
               
[SUSPECTED - 40%] Config change to cache.ttl
┄┄┄┄┄┄┄┄┄┄┄┄┄┄ Evidence: Timing only
               ℹ️ Hover: "This is correlated but not confirmed"

[Show low-confidence items]
```

---

## Chapter 14: Performance

### 14.1 Incident-Time Performance

**Goal**: UI stays fast when everything is on fire.

**Techniques**:
| Technique | Implementation |
|-----------|----------------|
| **Pre-computed summaries** | Incident stats computed on write |
| **Aggressive caching** | Redis for hot data |
| **Pagination** | Timeline loads in chunks |
| **Lazy loading** | Details loaded on expand |
| **CDN for static** | UI assets on CDN |

**Performance targets during incident**:
| Operation | Target |
|-----------|--------|
| Incident summary load | <500ms |
| Timeline first chunk | <1s |
| Blast radius compute | <2s |
| Search results | <1s |

### 14.2 Large Tenant Handling

**Problem**: Tenant with 10x average data.

**Solutions**:
| Solution | Implementation |
|----------|----------------|
| **Dedicated partition** | Separate Postgres partition |
| **Read replicas** | Route queries to replica |
| **Query limits** | Max 10K results, pagination required |
| **Caching** | Longer cache TTL for stable data |
| **Rate limits** | Higher but still limited |

### 14.3 Slow Query Prevention

**Guardrails**:
```sql
-- Statement timeout
SET statement_timeout = '5s';

-- Query cost limit
SET plan_cost_limit = 100000;
```

**Query analysis**:
- All queries logged with timing
- >1s queries flagged for review
- Index suggestions automated

### 14.4 Query Isolation

**Per-tenant query limits**:
```
Tenant A: 100 concurrent queries max
Tenant B: 100 concurrent queries max
System reserved: 50 connections for critical ops
```

**Query queueing**: If at limit, queue with timeout (5s), then reject.

---

## Chapter 15: Multi-Region and DR

### 15.1 When Multi-Region?

**Triggers for multi-region**:
- Customer requires data residency (EU, China)
- Latency requirements (<100ms from user to system)
- Compliance requirements

**MVP**: Single region (us-east-1 or eu-west-1)

**Phase 2**: Add regions on demand

### 15.2 Multi-Region Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-REGION                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  US Region                        EU Region                    │
│  ┌─────────────┐                  ┌─────────────┐              │
│  │ Mandate US  │                  │ Mandate EU  │              │
│  │ + Postgres  │                  │ + Postgres  │              │
│  │ + Redis     │                  │ + Redis     │              │
│  └──────┬──────┘                  └──────┬──────┘              │
│         │                                │                      │
│         └────────────┬───────────────────┘                      │
│                      │                                          │
│              Control Plane                                      │
│         (config sync, no customer data)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Data stays in region**: Events, PII, audit logs never cross.

**Cross-region synced**: Config, rules (no PII).

### 15.3 Cross-Region Latency Impact

**Problem**: Real-time coordination needs low latency.

**Solution**: Users connect to nearest region.

**Cross-region scenarios**:
- Multi-region company: Users in each region connect locally
- Cross-region incident: Both regions have local copy, reference each other

### 15.4 Disaster Recovery

**RPO/RTO targets**:
| Tier | RPO | RTO |
|------|-----|-----|
| Standard | 1 hour | 4 hours |
| Premium | 15 min | 1 hour |
| Enterprise | 5 min | 15 min |

**Backup strategy**:
- Postgres: Continuous WAL archival to S3
- Redis: Snapshot every 15 min
- S3: Cross-region replication (enterprise)

**Failover**:
- Automated DNS failover (Route53 health checks)
- Manual database promotion
- Runbook for each scenario

### 15.5 Consistency Choices

**Strong consistency required for**:
- Incident state (who's responding)
- Ownership lookups (routing)
- Authentication/authorization

**Eventual consistency OK for**:
- Event ingestion (async processing)
- Analytics/reporting
- Historical queries

**Implementation**:
- Postgres for strong consistency
- Redis for eventual (cache, pub/sub)
- Explicit consistency annotations in code

---

## Chapter 16: Slack Integration Deep Dive

### 16.1 Slack API Rate Limits

**Limits**:
- Web API: ~1 request/second per method per workspace
- Events API: 30K events/hour per app

**Our handling**:
```python
class SlackRateLimiter:
    def send(self, message):
        while True:
            response = slack.post(message)
            if response.status == 429:
                wait = response.headers['Retry-After']
                log.warn(f"Rate limited, waiting {wait}s")
                sleep(wait)
                continue
            return response
```

### 16.2 Message Send Failure

**Retry strategy**:
```
Attempt 1: Send
Attempt 2: Wait 1s, retry
Attempt 3: Wait 5s, retry
Attempt 4: Wait 30s, retry
Attempt 5: Wait 5min, retry
After 5 attempts: Mark as failed, alert, try alternate channel
```

**Preventing spam on retry**:
- Check if message already delivered (by ID)
- Update existing message instead of new one
- Aggregate if multiple retries for same event

### 16.3 Notification Aggregation

**During incident flood**:
```
Instead of:
  14:30:01 - Error in payments-service
  14:30:02 - Error in payments-service
  14:30:03 - Error in payments-service
  ... (100 more)

Aggregate to:
  14:30:01 - Error in payments-service
  14:31:00 - ⚠️ 103 errors in payments-service (last 1 min)
             [View all] [Mute for 10min]
```

### 16.4 Actionable Messages

**Button structure**:
```json
{
  "blocks": [
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": "🔴 *INC-234*: payments down" }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "🔍 View" },
          "action_id": "view_incident",
          "value": "INC-234"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "✅ Acknowledge" },
          "action_id": "ack_incident",
          "value": "INC-234",
          "style": "primary"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "⏸️ Pause Agent" },
          "action_id": "pause_agent",
          "value": "agent:deployer"
        }
      ]
    }
  ]
}
```

### 16.5 Acknowledgment Semantics

**What "acknowledge" means**:
1. "I saw this" (stops escalation timer)
2. "I'm looking at it" (updates status)
3. "Don't notify me again for this" (until status change)

**Recording acknowledgment**:
```json
{
  "type": "acknowledgment",
  "incident_id": "INC-234",
  "user": "alice@company.com",
  "timestamp": "2026-01-15T14:30:45Z",
  "channel": "slack",
  "message_ts": "1706123445.000123"
}
```

### 16.6 "Someone's On It" Display

**Slack message update**:
```
Before ack:
  🔴 INC-234: payments down
  Status: Waiting for response
  [Acknowledge] [View]

After ack:
  🟡 INC-234: payments down
  Status: @alice is investigating (ack'd 2 min ago)
  [View] [Join]
```

### 16.7 Preventing Duplicate Response

**Multi-person coordination**:
```
Incident INC-234:
├── @alice acknowledged at 14:30:45
├── @bob wants to help
└── Message shows: "@alice is primary, @bob ask before acting"

Collision prevention:
- Only primary can trigger rollback
- Others can "join" (notified of actions)
- Explicit "hand off" to transfer primary
```

---

## Chapter 17: Special Modes

### 17.1 War Room Mode

**Activation**:
```
User: /mandate warroom INC-234
Bot: War room activated for INC-234
     - Created channel #warroom-inc-234
     - Added: @alice, @bob, @payments-team
     - All updates will post here
     - Auto-close when incident resolved
```

**War room features**:
- Dedicated channel
- All responders auto-added
- Updates from all sources in one place
- Action buttons in channel
- Auto-archive on resolution

### 17.2 Async Mode

**For non-urgent, async teams**:
```yaml
team_settings:
  notifications:
    mode: "async"
    batch_window: 30m
    urgent_override: true  # Critical still immediate
```

**Async digest**:
```
📋 Async digest for payments-team (last 30 min):
├── 3 actions on payments-service (all normal)
├── 1 flagged action (review needed)
└── 0 incidents

[View details] [Adjust settings]
```

### 17.3 Incident Commander Mode

**IC role**:
```
/mandate ic assign @alice INC-234

Bot: @alice is now Incident Commander for INC-234
     IC responsibilities:
     - Coordinates response
     - Approves major actions
     - Communicates to stakeholders
     
Actions requiring IC approval:
- Production rollback
- Stakeholder communication
- Incident severity change
```

### 17.4 Change Freeze / Maintenance Window

**Configuration**:
```yaml
change_freeze:
  - name: "Holiday freeze"
    start: "2026-12-20T00:00:00Z"
    end: "2026-01-02T00:00:00Z"
    scope: ["production"]
    actions:
      - action_type: "deploy"
        decision: "gated"
        message: "Holiday change freeze in effect"
        
maintenance_windows:
  - name: "Weekly maintenance"
    cron: "0 2 * * SUN"  # Sunday 2am
    duration: 4h
    actions:
      - suppress_alerts: true
      - allow_deploys: true
```

---

## Chapter 18: Special Incident Types

### 18.1 Feature Flag Incidents

**Detection**:
```
Event: Feature flag "new-checkout" enabled
Correlated: Errors in checkout-service spike
Attribution: "Feature flag change may have caused errors"
```

**Suggested action**:
```
Disable feature flag "new-checkout"?
- Flag enabled 5 min ago
- Errors started 4 min ago
- Correlation: HIGH

[Disable flag] [Investigate more]
```

### 18.2 Database Migration Incidents

**Detection**: Migration event followed by errors

**Special handling**:
- Check if migration is reversible
- Show migration diff
- Warn: "DB migrations may not be fully reversible"

### 18.3 Permission Change Incidents

**Detection**: Permission change → access errors

**Attribution**:
```
Permission change by @admin at 14:25:00:
- Removed: agent-deployer access to production
- Errors: agent-deployer "permission denied" at 14:26:00
- Likely cause: Permission change
```

### 18.4 Cost Incidents (FinOps)

**Detection** (requires cloud billing integration):
```
Alert: Cloud spend increased 500% in last hour
Source: Agent "data-processor" spawned 1000 instances
Attribution: Agent action caused cost spike
```

**Response**:
```
⚠️ Cost alert: $5,000 burn rate (normal: $1,000)

Cause: Agent "data-processor" (likely)
Action taken: 1000 instances spawned

Suggested:
[Pause agent] [Kill instances] [Set budget limit]
```

### 18.5 Data Quality Incidents (Silent Corruption)

**Challenge**: No error, but data is wrong.

**Detection**:
- User reports: "Data looks wrong"
- Automated checks (if configured): "Row count changed unexpectedly"

**Attribution**:
```
Data quality incident reported:
- Symptom: Customer balances incorrect
- Time window: Last 24 hours
- Agent actions in window:
  ├── action_042: db_write to balances table (14:30)
  ├── action_056: db_write to balances table (18:45)
  └── action_071: bulk_update to balances (22:00)
  
Most likely: action_071 (bulk operation, highest impact)
```

### 18.6 Agent Behavior Anomaly (No Outage)

**Detection**:
```
Anomaly: Agent "code-reviewer" made 500 file changes (normal: 10)
No errors, no outage, but unusual

Alert: "Unusual agent behavior - review recommended"
[View changes] [Pause agent] [Mark as expected]
```

---

## Chapter 19: Emergency Controls

### 19.1 Isolation Mode

**Purpose**: Contain blast radius before investigation.

```
/mandate isolate payments-service

Bot: Isolating payments-service:
     - Traffic drained (0 requests)
     - Agents paused for this service
     - Monitoring continues
     
To restore: /mandate restore payments-service
```

### 19.2 Read-Only Mode

**Purpose**: Prevent writes while investigating.

```
/mandate readonly agent:deployer

Bot: Agent "deployer" set to read-only:
     - Can: read, query, list
     - Cannot: write, deploy, delete
     - Duration: Until manually restored

To restore: /mandate readwrite agent:deployer
```

### 19.3 Kill Switch

**Purpose**: Emergency stop everything.

**Who can press**:
- Any `admin` role
- Requires reason
- Notifies all admins immediately

**Implementation**:
```
/mandate killswitch all --reason "Unknown agent behavior"

Bot: 🚨 KILL SWITCH ACTIVATED by @alice
     Reason: Unknown agent behavior
     
     Actions taken:
     - All agents paused
     - New events queued (not dropped)
     - All admins notified
     
     To restore: /mandate restore all
     (Requires 2 admin approval)
```

**Abuse prevention**:
- All activations logged with reason
- Restoration requires 2nd admin approval
- Weekly report of all kill switch usage
- >1 use/month triggers review

### 19.4 Kill Switch for Learning

**Post-incident**:
```
Kill switch usage for training:

Incident: INC-234
Kill switch: Activated by @alice at 14:35
Reason: "Agent deployer making unexpected changes"
Duration: 45 minutes
Outcome: Contained blast radius, found misconfigured agent

Lessons:
- Kill switch was appropriate response
- Agent had missing guardrails
- Added new routing rule to prevent

[Add to training materials] [Archive]
```

---

## Chapter 20: Configuration Management

### 20.1 Configuration Auditing

**All config changes tracked**:
```json
{
  "type": "config_change",
  "timestamp": "2026-01-15T14:30:00Z",
  "user": "admin@company.com",
  "change": {
    "path": "routing_rules[5]",
    "old_value": { "decision": "monitored" },
    "new_value": { "decision": "gated" }
  },
  "reason": "Adding gate for production deploys"
}
```

### 20.2 Configuration Rollback

**Instant rollback**:
```
/mandate config rollback routing_rules --to 2026-01-14

Bot: Rolling back routing_rules to 2026-01-14 version
     Changes reverted: 3
     [View diff] [Confirm]
```

### 20.3 GitOps for Configuration

**Supported flow**:
```
git repo (source of truth)
    │
    ▼
PR created → CI validates rules
    │
    ▼
PR merged → Webhook to Mandate
    │
    ▼
Mandate applies new config
    │
    ▼
Success/failure reported back to git
```

**Benefits**:
- Version control
- PR review for changes
- Rollback via git revert
- Audit trail in git

### 20.4 Config Drift Detection

**Problem**: Config in Mandate ≠ config in git.

**Detection**:
```
Daily job:
1. Fetch config from git
2. Compare with live config
3. If different: alert admin

Alert: "Config drift detected"
- routing_rules: 2 differences
- ownership: in sync
[View diff] [Sync from git] [Push to git]
```

### 20.5 Meta-Incidents (Config Broke Routing)

**Scenario**: Bad config causes incorrect routing.

**Detection**:
```
IF notification_delivery_failures spike after config change:
  Alert: "Config change may have broken routing"
  Link: config change at T-5min
  
IF FP_rate spike after routing rule change:
  Alert: "New rule may be too broad"
  Link: rule change
```

**Response**:
- Auto-rollback option (if enabled)
- Alert to admin
- Config change flagged in incident timeline

---

## Chapter 21: Service Catalog

### 21.1 Service Catalog Sources

| Source | Data | Sync frequency |
|--------|------|----------------|
| Backstage | Services, owners | Webhook + daily |
| Kubernetes | Deployments, namespaces | Real-time |
| GitHub | Repos, CODEOWNERS | Webhook |
| Manual | Overrides, custom metadata | On-demand |

### 21.2 Building Service Catalog

```yaml
service:
  id: "payments-service"
  name: "Payments Service"
  
  sources:
    - type: "kubernetes"
      namespace: "payments"
      deployment: "payments-api"
      
    - type: "github"
      repo: "company/payments-service"
      
    - type: "backstage"
      component: "payments"
      
  ownership:
    team: "payments-team"
    primary: "@alice"
    oncall: "pagerduty:payments-oncall"
    
  dependencies:
    - "payments-db"
    - "user-service"
    
  metadata:
    tier: "critical"
    pci: true
    sla: "99.9%"
```

---

# APPENDIX A: Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Push vs pull | Push primary | Lower latency |
| Event sourcing | Yes for events | Audit, replay |
| Schema versioning | Additive minor | Compatibility |
| Large payloads | Tiered storage | Balance cost/speed |
| Clock handling | Dual timestamp | Tolerate skew |
| Partition key | tenant + date | Isolation + time queries |
| Message queue | Redis first, Kafka if needed | Simplicity |
| Multi-region | On demand | Cost vs need |
| Consistency | Strong for critical | Correctness |

---

# APPENDIX B: Metrics Summary

| Metric | Target | Measurement |
|--------|--------|-------------|
| Event ingestion latency | P99 <200ms | From agent to stored |
| Notification delivery | P99 <5s | From event to Slack |
| UI incident load | P95 <500ms | Dashboard render |
| Query response | P95 <1s | Search, filter |
| Availability | 99.9% | Uptime |

---

**Document Version**: 5.3 Complete
**Last Updated**: January 2026
**Total Questions Addressed**: 300+
**Status**: Ready for Implementation Review
