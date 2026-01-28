# Mandate: Operational Coordination for the Agent Era

**Version 5.1 Technical Complete | January 2026**

---

# PART A: DESIGN PHILOSOPHY

## Chapter 1: What We Believe

### 1.1 Core Belief

**The question is not "can the system prevent mistakes" — it's "can humans intervene in time."**

We reject the fantasy that a sufficiently complex, sufficiently smart system can prevent most errors before they happen. This is the biggest illusion in agent governance.

**What actually matters in production**:
- Immediately knowing what happened
- Accurately knowing who/which action caused it
- Being able to stop the bleeding immediately
- Recovering via the fastest possible path
- Learning so the same mistake doesn't happen twice

### 1.2 Why Pre-Execution Approval is Wrong

Centralized pre-execution interception is fundamentally a decelerator:

1. **Authorization becomes a bottleneck**: If every agent action requires human approval, you've already lost.
2. **Blocking ≠ safety**: Real control should be an accelerator, not a defense system.
3. **No execution = no data = no improvement**: You can't learn from what never happened.
4. **The most dangerous errors cannot be identified beforehand**: Pre-execution approval can only block obviously wrong things.
5. **Approval is just one form of intervention**: Provide intervention capabilities tiered by action type.

**Conclusion**: Build a system that lets human judgment keep up with agent speed.

### 1.3 Redefining Governance

- Governance should be embedded at every intervention point, not centralized
- Governance is about *how I can intervene after it's done*, not *whether* to do something
- Control = system providing intervention capabilities at every point

**This isn't a control plane — it's a real-time coordination network.**

### 1.4 On Recovery and Rollback

**Fast recovery as an outcome is correct. Building fast recovery as a feature is wrong.**

- Rollback is always temporary
- Many actions are irreversible (due to costs, permissions, time windows)
- Recovery speed depends on action type
- Reversibility is one possibility within recovery paths, not the main narrative

> **Rollback is not a technical capability — it's a social capability.**
> The core resource is *who knows how to fix it* + *who is willing to*.

---

# PART B: PRODUCT DEFINITION

## Chapter 2: What We Are

### 2.1 What We Are NOT

- ❌ Not an approval system
- ❌ Not an AI safety firewall
- ❌ Not a rollback engine
- ❌ Not a centralized agent controller

### 2.2 What We ARE

**A definition of how organizations operate in the agent era.**

We're not selling capability — we're selling whether humans can intervene in time.

**Target users**: Companies deploying 10+ autonomous agents who need velocity but can't accept chaos.

### 2.3 External Messaging

✅ "We help humans coordinate at agent speed"
✅ "Datadog tells you what happened. Rubrik lets you undo it. We help you prevent it, recover faster, and make sure it never happens again."

❌ "We do LLM observability" (collides with Datadog)
❌ "We rewind agent mistakes" (collides with Rubrik)

---

## Chapter 3: The Real Pain Points

### 3.1 Three Major Pain Points

1. **Don't know who did it**
2. **Don't know why the same mistake happened again**
3. **Don't know what state the system is currently in**

### 3.2 The Real Risk

Not too much destruction, but **invisible destruction**. Destruction happened, but no one saw it.

---

## Chapter 4: Minimum Viable Product

### 4.1 First 10 Minutes Experience

| Minute | What happens |
|--------|--------------|
| 0-2 | Connect agent source (MCP endpoint or SDK install) |
| 2-3 | See first actions appear in live activity stream |
| 3-4 | Auto-detected ownership displayed (from CODEOWNERS, PagerDuty) |
| 4-5 | Receive first Slack notification when action touches your system |
| 5-10 | Try intervention buttons: pause, flag, ask questions |

### 4.2 MVP Pages/Outputs

| Page | Purpose | Priority |
|------|---------|----------|
| **Activity Stream** | Real-time feed of all actions | P0 |
| **System Status** | Current state, what's running/paused, active incidents | P0 |
| **Ownership Map** | Who owns what, coverage gaps highlighted | P0 |
| **Routing Rules** | Configure notification triggers | P1 |
| **Incident Timeline** | What happened, in what order | P1 |

**MVP is event-stream first, UI second.** Core value = notifications in Slack. UI = configuration and investigation.

### 4.3 The Flow

```
Execute → Broadcast → Visible → Intervene → Recover → Learn
```

**Default policy**: `monitored_execute` (bias toward execution, not blocking)

---

# PART C: CORE OBJECT MODEL

## Chapter 5: The Six Core Objects

```
┌─────────────────────────────────────────────────────────────────┐
│  Actor ──executes──▶ Action ──affects──▶ Resource               │
│                         │                    │                  │
│                         ▼                    ▼                  │
│                   Notification ◀────── Ownership                │
│                         │                                       │
│                         ▼                                       │
│                     Incident ──produces──▶ Learning             │
└─────────────────────────────────────────────────────────────────┘
```

### 5.1 Object Definitions

**Actor**: Who/what is doing the action
- Types: `agent` | `human` | `system`
- Has identity, belongs to team, has on-call schedule

**Action**: A discrete operation that changes state
- Has: type, scope, timestamp, reversibility
- Every action gets a routing decision

**Resource**: What gets affected by actions
- Types: service, file, database table, API endpoint, config
- Every resource has ownership

**Ownership**: Link between resources and people/teams
- Sources: CODEOWNERS, service catalog, PagerDuty, manual config

**Notification**: Signal sent to owners when resources are affected
- Has: urgency level, channel, TTI measurement

**Incident**: Something bad that happened
- Links to causing actions, produces learning artifacts

### 5.2 Minimum Event Schema

Every event in our system conforms to this schema:

```
Event {
  // Identity (required)
  id: string                    // UUID v7 (time-sortable)
  timestamp: int64              // Unix milliseconds, server-assigned
  received_at: int64            // When we received it (for clock skew)
  
  // Source (required)
  tenant_id: string             // Customer isolation
  actor: {
    type: "agent" | "human" | "system"
    id: string                  // Unique within tenant
    name: string                // Display name
    framework: string?          // "mcp" | "langchain" | "custom"
  }
  
  // Action (required)
  action: {
    type: string                // "code_change" | "db_write" | "api_call" | ...
    description: string         // Human-readable, max 500 chars
    idempotency_key: string?    // For deduplication
  }
  
  // Scope (required)
  scope: {
    resources: [{
      type: "service" | "file" | "table" | "api" | "config"
      id: string                // e.g., "auth-service", "src/auth/login.ts"
    }]
  }
  
  // Metadata (optional)
  metadata: {
    reversible: boolean?
    estimated_impact: "none" | "low" | "medium" | "high"?
    parent_action_id: string?   // For action chains
    session_id: string?         // Group related actions
  }
  
  // Routing result (system-assigned)
  routing: {
    decision: "auto" | "monitored" | "flagged" | "gated"
    rule_matched: string?
    notifications_sent: int
  }
  
  // Integrity (system-assigned)
  integrity: {
    hash: string                // SHA-256 of canonical event
    prev_hash: string?          // Previous event hash (chain)
    signature: string?          // If signed by source
  }
}
```

**Required fields**: id, timestamp, received_at, tenant_id, actor, action, scope
**Everything else**: Optional or system-assigned

### 5.3 Data Model Relationships

```sql
-- Core tables (simplified)
tenants (id, name, created_at)
actors (id, tenant_id, type, name, framework, trust_level)
resources (id, tenant_id, type, identifier, sensitivity)
ownership (resource_id, owner_type, owner_id, priority, source)
events (id, tenant_id, actor_id, timestamp, action_type, scope, hash, prev_hash)
notifications (id, event_id, owner_id, channel, sent_at, responded_at, response)
incidents (id, tenant_id, severity, status, created_at, resolved_at)
incident_events (incident_id, event_id, attribution_confidence)
patterns (id, tenant_id, signature, description, action_items)
```

**Key indexes for "1 second to find who should handle"**:
```sql
-- Find owners for affected resources
CREATE INDEX idx_ownership_resource ON ownership(resource_id, priority);

-- Find recent events by resource
CREATE INDEX idx_events_scope ON events USING GIN(scope);

-- Find active incidents by tenant
CREATE INDEX idx_incidents_active ON incidents(tenant_id, status) WHERE status != 'resolved';

-- Find notifications awaiting response
CREATE INDEX idx_notifications_pending ON notifications(owner_id, responded_at) WHERE responded_at IS NULL;
```

---

# PART D: OWNERSHIP MODEL

## Chapter 6: Determining "Who Should Know"

### 6.1 Ownership Resolution Chain

```
1. Explicit config      → "payment-service: @alice"
       ↓ (if none)
2. CODEOWNERS           → "src/payments/*: @payments-team"
       ↓ (if none)
3. Service catalog      → "payment-service: payments-team"
       ↓ (if none)
4. PagerDuty/Opsgenie   → "payments-team on-call: @bob"
       ↓ (if none)
5. Recent contributors  → "last 30d commits: @carol"
       ↓ (if none)
6. Flag as "no owner"   → route to fallback/admin
```

### 6.2 Edge Cases

| Scenario | Handling |
|----------|----------|
| **No owner found** | Flag as "unowned", route to fallback, show in coverage gaps |
| **Owner doesn't respond** | Escalation chain after timeout (default 5min for critical) |
| **Multiple owners conflict** | All notified (AND not OR), first responder wins, conflicts logged |
| **Cross-team incident** | All affected owners notified, shared channel created |

### 6.3 Organizational Changes

| Change | Handling |
|--------|----------|
| **Person changes team** | Ownership transfers, 7-day grace period, handoff prompt |
| **Service changes owner** | Sync from service catalog, history preserved |
| **Services merge/split** | Explicit migration flow, ownership assignment prompt |

---

# PART E: ROUTING SYSTEM

## Chapter 7: Intervention Paths

### 7.1 Routing Decisions

| Path | Meaning | When |
|------|---------|------|
| `auto_execute` | Execute, minimal logging | Read-only, zero-impact |
| `monitored_execute` | Execute with visibility, notify owners | **Default** |
| `flagged_execute` | Execute, flag for review within N hours | Higher-risk, time-tolerant |
| `gated_execute` | Queue for human confirmation | Irreversible high-stakes |

### 7.2 Routing Signals

| Signal | Source | Weight |
|--------|--------|--------|
| Action type | Declared by agent/SDK | Primary |
| Resource sensitivity | From ownership config | Primary |
| Historical patterns | Past incidents | Secondary |
| Time of day | Business hours? | Modifier |
| Actor track record | Past issues? | Modifier |

### 7.3 Rule System Design

**Rule format** (YAML, not a custom DSL):
```yaml
rules:
  - name: "Monitor all production deploys"
    match:
      action_type: "deploy"
      resource.tags: ["production"]
    decision: monitored_execute
    notify:
      - resource.owners
      - "@platform-oncall"
    
  - name: "Gate payment mutations"
    match:
      action_type: ["charge", "refund", "transfer"]
      resource.type: "api"
      resource.id: "stripe.*"
    decision: gated_execute
    timeout: 300  # 5 min to respond
    
  - name: "Auto-approve reads"
    match:
      action_type: "read"
    decision: auto_execute
```

**Why YAML, not a custom DSL**:
- Familiar to engineers
- Easy to version control
- Lintable, testable
- No interpreter maintenance burden

**Who maintains rules**:
- Default rules shipped with product (read-only)
- Customer rules in their config repo
- UI for simple rule creation (generates YAML)
- Rules versioned, changes audited

### 7.4 Avoiding Rule Hell

**Principles**:
1. **Few rules, smart defaults**: Ship with <20 default rules that cover 80% of cases
2. **Inheritance**: Rules can extend/override defaults
3. **Testing**: Every rule has test cases, CI validates on change
4. **Metrics**: Track which rules fire, FP/FN rates per rule
5. **Pruning**: Auto-flag rules that never match or always FP

**Rule testing**:
```yaml
# test_rules.yaml
tests:
  - name: "Production deploy triggers monitoring"
    event:
      action_type: "deploy"
      scope:
        resources: [{type: "service", id: "auth-service", tags: ["production"]}]
    expect:
      decision: monitored_execute
      notifications: ["@alice", "@platform-oncall"]
```

**Replay for validation**:
- Store last 7 days of events
- Re-run rules against historical events
- Compare: "if this rule existed, what would have changed?"

### 7.5 Non-Blocking Early Routing

**Problem**: How to route early without blocking execution?

**Solution**: Async routing with optimistic execution

```
Agent calls tool
       │
       ▼
SDK intercepts ──────────────────────────┐
       │                                 │
       ▼                                 ▼
Send event to Mandate (async)     Execute tool (proceed)
       │                                 │
       ▼                                 ▼
Routing decision made             Tool completes
       │                                 │
       ▼                                 ▼
Notification sent                 Result returned to agent
```

**Timeline**:
- T+0ms: Agent initiates action
- T+1ms: SDK sends event (non-blocking)
- T+5ms: Tool executes
- T+50ms: Mandate routes, notification sent
- T+100ms: Owner sees notification in Slack

**"Coming in time" guarantee**:
- For `monitored_execute`: Owner notified within 2 seconds of action
- For `flagged_execute`: Review queue populated before action completes
- For `gated_execute`: Action blocks until approval (only path that blocks)

**What if routing is slow?**
- Default to `monitored_execute` if routing takes >100ms
- Catch up with correct routing async
- Never block agent for routing decision (except `gated`)

---

# PART F: NOTIFICATION SYSTEM

## Chapter 8: Notifications and Intervention

### 8.1 Channels and Latency Targets

| Channel | Use case | Latency target |
|---------|----------|----------------|
| Slack/Teams | Primary real-time | P50 <500ms, P95 <2s |
| PagerDuty/Opsgenie | Critical escalation | P50 <1s, P95 <5s |
| Email | Digest, non-urgent | P95 <30s |
| In-app | Dashboard alerts | Real-time (WebSocket) |
| Webhook | Custom integrations | P95 <1s |

### 8.2 Slack Message Structure

**Standard notification**:
```
🔵 [monitored] Agent "code-reviewer" modified auth-service

Action: Modified src/auth/login.ts (+15, -3 lines)
Affected: auth-service (owner: @alice)
Time: 2 min ago

[View Details] [Pause Agent] [Flag for Review] [👍 Looks OK]
```

**Critical notification**:
```
🔴 [critical] Agent "deployer" triggered production deploy

Action: Deployed payments-service v2.3.1 to production
Affected: payments-service, user-service, billing-db
Owners notified: @alice, @bob, @payments-oncall

[View Details] [Rollback] [Pause All Deploys] [Acknowledge]
```

### 8.3 Preventing Notification Storm

| Mechanism | How it works |
|-----------|--------------|
| **Aggregation** | Batch related notifications within 5s window |
| **Deduplication** | Same actor + same resource + same action type = merge |
| **Rate limiting** | Max 10 notifications/minute to same person |
| **Smart suppression** | If owner already looking at dashboard, reduce Slack |
| **Quiet hours** | Respect user preferences, escalate if critical |
| **Relevance scoring** | Below threshold → digest instead of real-time |

**Notification storm detection**:
```
IF notifications_per_minute > 50 for same tenant:
  - Switch to digest mode
  - Alert admin: "Unusual activity detected"
  - Show summary: "47 actions in last minute from agent X"
```

### 8.4 Automatic Actions

**What we auto-execute** (explicit opt-in):
- Auto-pause agent after N consecutive failures
- Auto-escalate after timeout with no response
- Auto-create incident channel for multi-team issues
- Auto-generate postmortem draft

**What we NEVER auto-execute**:
- Rollback production changes
- Delete anything
- Modify agent code/config
- Override explicit human decisions

---

# PART G: LEARNING LOOP

## Chapter 9: Postmortem and Pattern Detection

### 9.1 Learning Artifacts

Every incident produces:
1. **Postmortem document** (per incident)
2. **Pattern record** (extracted signature)
3. **Rule suggestions** (routing/ownership improvements)

### 9.2 Postmortem Automation

| Section | Automation | Source |
|---------|------------|--------|
| Timeline | 100% auto | Activity stream |
| Affected systems | 100% auto | Blast radius |
| Who was involved | 100% auto | Notification logs |
| Root cause | 80% auto | Action attribution (human verifies) |
| Impact | 70% auto | Metrics + user reports |
| Action items | Suggested | Pattern analysis (human approves) |

**What we don't automate**: "Why" and "what should change" require human judgment.

### 9.3 Pattern Definition

A pattern is a tuple: `(action_type, resource_pattern, failure_mode)`

Examples:
- `(deploy, payments-*, timeout)` → "Payment deploys that timeout"
- `(db_write, users.*, constraint_violation)` → "User DB constraint failures"

**Pattern matching methods**:
| Method | When | Accuracy |
|--------|------|----------|
| Exact match | Same action + resource | High |
| Resource pattern | Same action + similar resource | Medium |
| Failure mode | Same error signature | Medium |
| Embedding similarity | Phase 3, experimental | Low |

### 9.4 Making Postmortems Used

1. **Action items required**: Every postmortem must have ≥1 action item with owner + due date
2. **Tracking**: We track completion, nag if overdue
3. **Pattern linking**: If same pattern triggers, surface "you said you'd fix this"
4. **Metrics**: Show "incidents from unaddressed items"

### 9.5 False Positive / False Negative Handling

| Type | Detection | Response |
|------|-----------|----------|
| **False positive** | User marks "not relevant" | Track FP rate per rule, flag rules >30% FP |
| **False negative** | User marks "should have notified" | Analyze gap, suggest new rule |

**Feedback loop**: Every notification has 👍/👎, weekly digest shows rates.

---

# PART H: INTEGRATIONS

## Chapter 10: Integration Architecture

### 10.1 Agent Integration: MCP Interception

**Where we intercept**:
```
┌─────────────────────────────────────────────────────────────────┐
│                     MCP ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agent ──▶ MCP Client ──▶ [MANDATE PROXY] ──▶ MCP Server ──▶ Tool│
│                              │                                  │
│                              ▼                                  │
│                     Event captured here                         │
│                     (before tool execution)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**MCP proxy mode**:
- Sits between MCP client and server
- Captures tool call + parameters
- Forwards to server (non-blocking for monitored)
- Captures result
- Sends complete event to Mandate

**For non-MCP agents**:

| Framework | Integration method |
|-----------|-------------------|
| LangChain | Callback handler |
| AutoGPT | Plugin wrapper |
| Custom | SDK decorator |

**SDK example (Python)**:
```python
from mandate import track, mandate_client

@track(resource="auth-service")
def call_api(endpoint, payload):
    return requests.post(endpoint, json=payload)

# Or explicit:
with mandate_client.action("api_call", resource="auth-service"):
    result = requests.post(endpoint, json=payload)
```

### 10.2 Source Integrations

| Source | Signal | Method |
|--------|--------|--------|
| GitHub/GitLab | CODEOWNERS, push, PR, commits | Webhook + API |
| PagerDuty/Opsgenie | On-call schedules | API sync |
| Service catalog | Service ownership | Webhook + API |
| CI/CD | Deploy events | Webhook |
| Cloud audit logs | AWS/GCP/Azure changes | Log ingestion |

### 10.3 Handling Bypasses

**Human bypasses agent**:
- We see it via GitHub webhook / cloud audit log
- Marked as "direct human action"
- Same routing rules apply

**Agent bypasses SDK**:
- Cloud audit log catches the actual change
- Correlate: "change happened but no agent event"
- Flag as "unattributed change"

---

# PART I: SYSTEM ARCHITECTURE

## Chapter 11: Data Infrastructure

### 11.1 Storage Strategy

| Data type | Storage | Retention | Why |
|-----------|---------|-----------|-----|
| Events | Postgres (append-only) | 90 days hot, 1 year cold | Relational queries, ACID |
| Event archive | S3 + Parquet | 7 years | Compliance, cheap |
| Real-time state | Redis | TTL-based | Speed, pub/sub |
| Metrics/analytics | ClickHouse | 1 year | High-cardinality, fast aggregation |
| Search | Postgres full-text (start) | 90 days | Simplicity; migrate to ES if needed |

**Why Postgres first**:
- Simple to operate
- ACID guarantees for ownership/routing
- Good enough for <10M events/day
- Upgrade path clear (Kafka, ClickHouse) when needed

**When to add**:
- **Kafka**: When event ingestion >10K/sec sustained
- **ClickHouse**: When analytics queries slow (>5s for dashboards)
- **Redis**: Day 1 for pub/sub and caching

### 11.2 Event Storage Design

**Append-only with partitioning**:
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL,
    actor JSONB NOT NULL,
    action JSONB NOT NULL,
    scope JSONB NOT NULL,
    routing JSONB,
    integrity JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

-- Monthly partitions
CREATE TABLE events_2026_01 PARTITION OF events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

**Retention policy**:
- Hot (Postgres): 90 days
- Warm (S3): 1 year
- Cold (Glacier): 7 years (compliance)
- Nightly job moves partitions

### 11.3 Multi-Tenancy

**Row-level isolation** (not schema-per-tenant):

```sql
-- Every table has tenant_id
-- Every query includes tenant_id filter
-- RLS policies enforce isolation

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON events
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

**Why row-level**:
- Simpler operations
- Easier cross-tenant analytics (for us, with proper auth)
- Schema-per-tenant = operational nightmare at 100+ tenants

### 11.4 Extreme Scale: 10^8 Actions/Day

**When we hit this** (not MVP):

| Challenge | Solution |
|-----------|----------|
| Ingestion | Kafka → multiple consumers → batch insert |
| Storage | Time-series partitioning + S3 archival |
| Queries | ClickHouse for analytics, Postgres for OLTP |
| Notifications | Fan-out via Redis pub/sub |
| High-cardinality labels | Pre-aggregate, don't store raw |

**Sampling strategy**:
- Never sample events that match routing rules
- Never sample events that become incidents
- Sample only `auto_execute` events at high volume
- Store sample metadata: "1 of 100 sampled"
- Attribution preserved: sampled events still link to incidents

---

## Chapter 12: Real-Time Infrastructure

### 12.1 WebSocket Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBSOCKET LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Client ◀──▶ Load Balancer ◀──▶ WS Server Pool                 │
│                                      │                          │
│                                      ▼                          │
│                               Redis Pub/Sub                     │
│                                      │                          │
│                                      ▼                          │
│                              Event Processor                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Scaling WebSockets**:
- Stateless WS servers behind load balancer
- Redis pub/sub for cross-server messaging
- Client subscribes to channels: `tenant:{id}:events`, `user:{id}:notifications`

**Reconnection**:
- Client stores last event ID
- On reconnect: request events since last ID
- Server replays from Redis (last 5 min) or Postgres (older)
- Exponential backoff: 1s, 2s, 4s, 8s, max 30s

### 12.2 Backpressure

**Ingestion backpressure**:
```
IF event_queue_depth > 10000:
  - Return 429 to new events
  - Alert: "Ingestion backpressure"
  - Clients retry with exponential backoff
```

**Notification backpressure**:
```
IF notification_queue_depth > 5000:
  - Switch to digest mode
  - Aggregate pending notifications
  - Alert: "Notification backpressure"
```

**Consumer lag monitoring**:
- Track lag per consumer
- Alert if lag > 30s
- Auto-scale consumers if lag persists

### 12.3 Latency Targets

| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| Event ingestion | 10ms | 50ms | 200ms |
| Routing decision | 5ms | 20ms | 100ms |
| Notification dispatch | 100ms | 500ms | 2s |
| UI event stream | 50ms | 200ms | 1s |
| Ownership lookup | 1ms | 5ms | 20ms |

---

## Chapter 13: Time and Causality

### 13.1 Timestamp Handling

**Problem**: Distributed systems have clock skew.

**Solution**: Dual timestamps

```
Event {
  timestamp: int64      // From source (agent's clock)
  received_at: int64    // From our server (our clock)
}
```

**Clock skew handling**:
- Accept events with timestamp up to 5 minutes in future
- Accept events with timestamp up to 1 hour in past
- Outside this window: flag as "clock_skew_warning"
- Use `received_at` for ordering when skew detected

### 13.2 Causality vs Correlation

**Principle**: Time correlation ≠ causation. This is false attribution.

**How we handle**:
- Events within time window = "correlated"
- Explicit `parent_action_id` = "caused by"
- Same `session_id` = "related"
- Human confirmation = "confirmed cause"

**Attribution confidence levels**:
| Level | Meaning | Evidence |
|-------|---------|----------|
| `suspected` | Time correlation only | Within 24h, same resource |
| `likely` | Strong correlation | Trace ID match, error mentions action |
| `confirmed` | Human verified | Engineer investigated |

---

## Chapter 14: Idempotency and Delivery

### 14.1 Event Deduplication

**Idempotency key**:
- If `action.idempotency_key` provided: dedupe on key
- If not: dedupe on `hash(actor + action + scope + timestamp rounded to 1s)`

**Deduplication window**: 5 minutes

**Storage**: Redis set with TTL
```
SADD idempotency:{tenant_id} {key} EX 300
```

### 14.2 Delivery Guarantees

| Component | Guarantee | Why |
|-----------|-----------|-----|
| Event ingestion | At-least-once | Can dedupe, must not lose |
| Notifications | At-least-once | Duplicate notification < missed notification |
| Incident creation | Exactly-once | Use DB transaction |
| Postmortem generation | At-most-once | Idempotent, human reviews anyway |

**At-least-once implementation**:
- Producer retries until ACK
- Consumer processes, then ACKs
- Idempotency key prevents duplicate processing

### 14.3 Replay Capability

**What can be replayed**:
- Events: from any point to any point (append-only log)
- Routing decisions: re-run rules against events
- Notifications: marked as "replay" to avoid confusion

**Replay use cases**:
- Test new routing rules
- Investigate incidents
- Rebuild state after bug fix

**Replay command**:
```
mandate replay \
  --from 2026-01-15T00:00:00Z \
  --to 2026-01-15T12:00:00Z \
  --rules ./new_rules.yaml \
  --dry-run
```

---

# PART J: RELIABILITY AND RECOVERY

## Chapter 15: State Machine

### 15.1 Action State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACTION STATES                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  received ──▶ routing ──▶ executing ──▶ completed              │
│      │           │            │             │                   │
│      ▼           ▼            ▼             ▼                   │
│   invalid     gated       failed      incident                  │
│               (waiting)                                         │
│                  │                                              │
│                  ▼                                              │
│            approved / rejected / timeout                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**States**:
| State | Meaning |
|-------|---------|
| `received` | Event ingested, not yet routed |
| `routing` | Routing decision in progress |
| `gated` | Waiting for human approval |
| `executing` | Tool call in progress |
| `completed` | Finished successfully |
| `failed` | Tool call failed |
| `incident` | Linked to an incident |
| `invalid` | Failed validation |

### 15.2 Incident State Machine

```
created ──▶ investigating ──▶ contained ──▶ resolved ──▶ postmortem
    │            │                │
    ▼            ▼                ▼
  false_alarm  escalated      reopened
```

### 15.3 Recovery Paths

**Not "rollback features" — recovery paths with honest limitations**:

| Action type | Recovery path | Limitations |
|-------------|---------------|-------------|
| Code change | `git revert {commit}` | Conflicts may need manual resolution |
| DB write | `ROLLBACK` or compensating query | Only within transaction window |
| API call (payment) | Refund API | 90-day window, fees may not refund |
| File delete | Restore from backup/versioning | Only if backup exists |
| Deploy | Traffic rollback | DB migrations may be irreversible |

**Recovery path as executable steps**:
```yaml
recovery_paths:
  code_change:
    steps:
      - action: "git revert {commit_sha}"
        timeout: 30s
        on_failure: "manual"
      - action: "notify {owners}"
    limitations:
      - "Conflicts may require manual resolution"
      - "Does not undo deployed code"
      
  stripe_charge:
    steps:
      - action: "POST /v1/refunds {charge_id}"
        timeout: 10s
        on_failure: "escalate"
      - action: "verify refund status"
        timeout: 60s
    limitations:
      - "90-day refund window"
      - "Fees may not be refunded"
```

---

## Chapter 16: Fault Tolerance

### 16.1 Component Criticality

| Component | Can lose data? | Failure impact | Mitigation |
|-----------|---------------|----------------|------------|
| Event ingestion | NO | Events lost | Multi-AZ, retry queue |
| Postgres | NO | State lost | Replicas, backups |
| Redis | Yes (cache) | Slower, no real-time | Fallback to polling |
| Notification service | NO (queue) | Delayed notifications | Persistent queue |
| WebSocket servers | Yes (connections) | Reconnect required | Stateless, auto-reconnect |

### 16.2 Degradation Modes

| Scenario | Behavior |
|----------|----------|
| Postgres slow | Queue writes, serve from cache |
| Redis down | Disable real-time, fallback to polling |
| Slack API down | Fallback to PagerDuty + email |
| Our API down | Agents continue (SDK caches), events queue locally |

### 16.3 SLOs

| SLO | Target | Measurement |
|-----|--------|-------------|
| Event ingestion availability | 99.9% | % of events successfully ingested |
| Notification delivery | 99.5% | % of notifications delivered within target latency |
| Dashboard availability | 99.5% | % of time dashboard loads successfully |
| Incident detection | 99% | % of incidents detected within 5 minutes |

**Error budget**: 0.1% downtime = 43 minutes/month

---

# PART K: SECURITY

## Chapter 17: Threat Model

### 17.1 Attackers and Capabilities

| Attacker | Capabilities | Goal |
|----------|--------------|------|
| External | Network access | Data exfiltration, service disruption |
| Malicious agent | API access with credentials | Forge events, hide actions |
| Malicious insider | Console access | Tamper attribution, cover tracks |
| Compromised dependency | Code execution | Poison logs, exfiltrate data |

### 17.2 Threat Scenarios

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Agent forges events | False attribution | Event signing, anomaly detection |
| Agent spoofs identity | Wrong owner notified | Mutual TLS, identity verification |
| Insider tampers logs | Can't investigate | Append-only log, hash chain |
| Tool poisoning | Logs untrustworthy | Correlate with cloud audit logs |
| Data exfiltration | Customer data leaked | Encryption, access controls, audit |

### 17.3 Event Integrity

**Hash chain for tamper evidence**:
```
Event N:
  hash = SHA-256(canonical(event))
  prev_hash = Event N-1 hash
  
Verification:
  - Recompute hash for each event
  - Verify prev_hash chain
  - Any tampering breaks chain
```

**Event signing** (optional, for high-security):
```
Event {
  ...
  integrity: {
    hash: "sha256:abc123...",
    prev_hash: "sha256:xyz789...",
    signature: "ed25519:signed_by_agent_key",
    signer_id: "agent:code-reviewer"
  }
}
```

### 17.4 Preventing Internal Tampering

| Control | Implementation |
|---------|----------------|
| Append-only logs | No UPDATE/DELETE on events table |
| Hash chain | Each event references previous |
| Separate audit log | All admin actions logged separately |
| Access controls | RBAC for who can view/modify |
| Dual control | Critical changes require 2 approvers |

### 17.5 Sensitive Data Handling

**What we don't log**:
- Full request/response bodies (only metadata)
- Credentials, tokens, secrets
- PII unless explicitly tagged

**Scrubbing**:
```python
SENSITIVE_PATTERNS = [
    r'password["\s:=]+[^\s]+',
    r'api[_-]?key["\s:=]+[^\s]+',
    r'bearer\s+[^\s]+',
]

def scrub(text):
    for pattern in SENSITIVE_PATTERNS:
        text = re.sub(pattern, '[REDACTED]', text, flags=re.I)
    return text
```

---

## Chapter 18: Access Control

### 18.1 Permission Model

**RBAC with resource scoping**:

| Role | Permissions |
|------|-------------|
| `viewer` | Read events, incidents for assigned resources |
| `responder` | Above + respond to notifications, create incidents |
| `admin` | Above + manage rules, ownership, settings |
| `super_admin` | Above + manage users, billing, audit logs |

**Resource scoping**:
- Users assigned to teams
- Teams own resources
- Permissions scoped to team's resources

### 18.2 Audit Logging

**What we log**:
- All authentication events
- All authorization decisions
- All configuration changes
- All data access (read audit for sensitive)

**Audit log retention**: 7 years (compliance)

**Audit log format**:
```json
{
  "timestamp": "2026-01-15T10:30:00Z",
  "actor": "user:alice@company.com",
  "action": "rule.update",
  "resource": "rule:production-deploy-gate",
  "old_value": {"decision": "monitored"},
  "new_value": {"decision": "gated"},
  "ip": "1.2.3.4",
  "user_agent": "Chrome/...",
  "result": "success"
}
```

**Export**: API + scheduled S3 export for SIEM integration

---

## Chapter 19: Encryption and Keys

### 19.1 Encryption

| Data | At rest | In transit |
|------|---------|------------|
| Events | AES-256 (Postgres TDE or application-level) | TLS 1.3 |
| Backups | AES-256 (S3 SSE-KMS) | TLS 1.3 |
| Secrets | AES-256 (separate key) | TLS 1.3 |

### 19.2 Key Management

**MVP**: AWS KMS or GCP Cloud KMS
- Tenant data keys encrypted with master key
- Master key in KMS, never leaves
- Key rotation: annual or on-demand

**Key hierarchy**:
```
KMS Master Key
    └── Tenant Master Key (per tenant)
            └── Data Encryption Key (rotated)
```

### 19.3 Compliance Path

| Certification | Timeline | Requirements |
|---------------|----------|--------------|
| SOC 2 Type I | Month 12 | Policies, controls documented |
| SOC 2 Type II | Month 18 | 6-month audit period |
| ISO 27001 | Month 24 | Full ISMS implementation |

**Not doing now**: HIPAA, FedRAMP (wait for customer demand)

---

# PART L: DEPLOYMENT

## Chapter 20: Deployment Options

### 20.1 SaaS (Default)

- Multi-tenant cloud deployment
- We manage infrastructure
- Data in our cloud (with encryption)

### 20.2 Customer VPC (Enterprise)

**When needed**: Regulated industries, data sovereignty requirements

**Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER VPC                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Mandate    │  │  Postgres   │  │   Redis     │             │
│  │  Services   │  │  (RDS)      │  │ (Elasticache)│            │
│  └──────┬──────┘  └─────────────┘  └─────────────┘             │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              Private Link to Mandate Control        │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

**What stays in customer VPC**:
- All event data
- All PII
- Postgres, Redis

**What connects to us**:
- Control plane (config, updates)
- Anonymized metrics
- License validation

---

# PART M: OPERATIONS

## Chapter 21: Blast Radius Estimation

### 21.1 Defining Blast Radius

**Blast radius** = set of resources and owners affected by an action

**Three layers**:
1. **Direct**: Resources explicitly in action scope
2. **Dependent**: Resources that depend on direct resources
3. **Downstream**: Resources affected by dependent resources

### 21.2 Inference Methods

| Method | Data source | Accuracy | When to use |
|--------|-------------|----------|-------------|
| Declared scope | Agent declares in event | High | Always (required) |
| Static config | Service catalog dependencies | Medium | MVP |
| Runtime trace | Distributed tracing | High | Phase 2 |
| Historical | Past incident correlation | Medium | Phase 2 |

**MVP approach**: Declared scope + static config only

**Why not build service graph from runtime**:
- Complex to implement
- Requires distributed tracing already in place
- Diminishing returns vs. declared scope

### 21.3 Handling Dependency Changes

- Service catalog is source of truth
- Sync daily or on webhook
- Changes logged: "dependency A→B added"
- Historical queries use point-in-time dependencies

---

## Chapter 22: Testing Strategy

### 22.1 E2E Testing

**Test environment**:
- Full stack deployed to staging
- Synthetic agents generating events
- Simulated Slack/PagerDuty endpoints

**E2E test scenarios**:
1. Agent action → notification delivered → response recorded
2. Incident created → escalation triggered → postmortem generated
3. Rule change → routing behavior changes
4. Reconnection after network partition

### 22.2 Chaos Testing

**Chaos scenarios**:
| Scenario | What we verify |
|----------|----------------|
| Postgres failover | Events not lost, queries recover |
| Redis failure | Fallback to polling works |
| Network partition | Reconnection succeeds |
| Notification service crash | Queue persists, delivery resumes |
| Clock skew | Events still ordered correctly |

**Invariants we verify**:
- No events lost during any failure
- Notifications eventually delivered
- Hash chain remains valid
- Ownership always resolvable (with fallback)

### 22.3 Load Testing

**Targets**:
- 1000 events/second sustained
- 10,000 concurrent WebSocket connections
- P99 latency under 1s during load

---

## Chapter 23: Our Own Operations

### 23.1 Our SLOs

| SLO | Target | Alerting |
|-----|--------|----------|
| Availability | 99.9% | Page if <99.5% over 5 min |
| Event ingestion latency | P99 <1s | Page if P99 >5s |
| Notification latency | P99 <5s | Page if P99 >30s |

### 23.2 Our On-Call

**On-call rotation**:
- 24/7 coverage (follow-the-sun when team grows)
- Primary + secondary
- PagerDuty for alerting

**Runbooks for common issues**:
- High event ingestion latency
- Notification delivery failures
- Database connection exhaustion
- WebSocket connection storm

### 23.3 Our Incident Response

**When Mandate itself has an incident**:
1. Status page updated immediately
2. Customer notification via email
3. Postmortem within 48 hours
4. Root cause and remediation shared

---

# PART N: COMPETITIVE POSITIONING

## Chapter 24: Market Landscape

| Company | DNA | What they do | What they don't |
|---------|-----|--------------|-----------------|
| **Rubrik** | Backup | Data snapshot restore | No routing, no learning |
| **Datadog** | Observability | Permission visibility | No execution governance |
| **Us** | Coordination | Routing + intervention + learning | No "perfect rollback" |

**Our differentiators**:
1. **Pre-action routing** (they react post-hoc)
2. **TTI as core metric** (they measure recovery time)
3. **Learning loop** (they don't prevent recurrence)

**Execution logic**:
- Rubrik: action → incident → rewind
- Us: action → routing → monitoring → faster discovery → faster recovery → learn

---

# PART O: GO-TO-MARKET

## Chapter 25: Phases

### Phase 1: Design Partners (Months 1-6)
- 3-5 companies, free
- Validate: integration, TTI, value perception

### Phase 2: Paid Pilots (Months 7-12)
- 10-20 companies, $50-100/agent/month
- Validate: pricing, churn, unit economics

### Phase 3: Scale (Year 2)
- 100+ customers
- Only if Phase 1-2 succeed

---

# PART P: CONCLUSION

## Our Commitment

**We commit to**:
- Every agent action visible
- Right people notified in real-time
- Fastest possible recovery path
- Learning from incidents
- TTI as north star metric

**We don't commit to**:
- Preventing all mistakes
- Perfect rollback
- Specific incident reduction numbers

**Our answer to "how can humans keep up with agent speed"**:
Not by blocking agents. By making human intervention fast enough.

---

**Document Version**: 5.1 Technical Complete
**Last Updated**: January 2026
**Status**: Ready for Technical Review
