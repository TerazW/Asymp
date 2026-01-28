# Mandate: Operational Coordination for the Agent Era

**Version 5.2 Complete Technical Specification | January 2026**

---

# PART A: DESIGN PHILOSOPHY

## Chapter 1: What We Believe

### 1.1 Core Belief

**The question is not "can the system prevent mistakes" — it's "can humans intervene in time."**

We reject the fantasy that a sufficiently complex system can prevent most errors before they happen.

**What actually matters in production**:
- Immediately knowing what happened
- Accurately knowing who/which action caused it
- Being able to stop the bleeding immediately
- Recovering via the fastest possible path
- Learning so the same mistake doesn't happen twice

### 1.2 Why Pre-Execution Approval is Wrong

1. **Authorization becomes a bottleneck**
2. **Blocking ≠ safety**
3. **No execution = no data = no improvement**
4. **The most dangerous errors cannot be identified beforehand**
5. **Approval is just one form of intervention**

### 1.3 On Recovery and Rollback

> **Rollback is not a technical capability — it's a social capability.**
> The core resource is *who knows how to fix it* + *who is willing to*.

---

# PART B: PRODUCT DEFINITION

## Chapter 2: What We Are

**A definition of how organizations operate in the agent era.**

We're not selling capability — we're selling whether humans can intervene in time.

**Target users**: Companies deploying 10+ autonomous agents who need velocity but can't accept chaos.

### 2.1 Advisory vs Executor: Our Boundary

**We are advisory, not executor.**

| We do | We don't do |
|-------|-------------|
| Recommend "rollback to v2.3.0" | Execute the rollback |
| Suggest "pause agent X" | Pause without human trigger |
| Show "disable this permission" | Modify permissions |
| Surface "call @alice" | Make the call |

**The boundary**: We provide the fastest path to intervention. Humans pull the trigger.

**Exception**: Pre-configured automations (opt-in only):
- Auto-pause after N failures (user sets N)
- Auto-escalate after timeout (user sets timeout)
- Auto-create incident channel (user enables)

**Why this boundary**:
- Automated recovery that goes wrong is worse than no automation
- Humans own outcomes, not our system
- Reduces our liability surface
- Builds trust before expanding scope

### 2.2 What If Users Ignore Our Suggestions?

**Question**: If users ignore suggestions, are we still valuable?

**Answer**: Yes, because:

1. **Visibility alone is valuable**: Even without acting on suggestions, knowing what happened is worth paying for
2. **Postmortem value**: After the fact, our data is essential for investigation
3. **Pattern detection**: We show "you ignored this suggestion 3 times and had 3 incidents"
4. **Compliance**: Audit trail of what was suggested, whether acted on
5. **Learning**: Ignored suggestions that led to incidents inform future routing

**We track**:
- Suggestion → action rate
- Suggestion → ignore → incident rate
- Time-to-action after suggestion

**This data makes us more valuable over time**, not less.

### 2.3 How to Make Users Depend on Us

**Goal**: Every incident, users check Mandate first.

**How**:
1. **Fastest to answer "what happened"**: We show timeline before they can grep logs
2. **Fastest to answer "who should I call"**: Owners surfaced immediately
3. **Fastest to answer "has this happened before"**: Pattern matching in real-time
4. **Single pane of glass**: Don't make them switch between 5 tools
5. **Slack-native**: They're already in Slack; we're there too

**Habit formation**:
- Week 1: "Let me check Mandate"
- Month 1: "Mandate showed me this before"
- Month 3: "I can't debug without Mandate"

---

# PART C: ATTRIBUTION MODEL

## Chapter 3: Attribution Philosophy

### 3.1 Attribution Granularity

**Question**: What's the minimum unit of attribution?

**Answer**: **Tool call** is the atomic unit.

| Granularity | When to use |
|-------------|-------------|
| **Tool call** | Default. Most actions are single tool calls |
| **Workflow step** | When tool calls are grouped logically |
| **Agent run** | For summary/rollup views |
| **Commit** | For code changes (maps to git) |
| **Session** | For grouping related actions |

**Why tool call**:
- It's the smallest observable unit
- Maps to MCP/SDK interception point
- Can always aggregate up, can't disaggregate down

### 3.2 Attribution vs Responsibility

**Critical distinction**:

| Concept | Definition | Example |
|---------|------------|---------|
| **Attribution** | "This action was involved" | "Agent X wrote to DB at T1" |
| **Causation** | "This action caused the outcome" | "The DB write caused the outage" |
| **Responsibility** | "This actor should fix/answer for it" | "Team Y owns the DB" |

**We do attribution. We suggest causation. We don't assign responsibility.**

**Why**:
- Attribution is objective (did it happen? yes/no)
- Causation is inferential (requires investigation)
- Responsibility is organizational (not our call)

### 3.3 Non-Repudiation Requirements

**Question**: Must attribution be non-repudiable?

**Answer**: Depends on context.

| Context | Non-repudiation level | Implementation |
|---------|----------------------|----------------|
| Standard ops | Low | Event logging sufficient |
| Compliance-required | Medium | Hash chain, audit log |
| High-stakes (finance, healthcare) | High | Signed events, tamper-evident |
| Legal/forensic | Maximum | Third-party attestation |

**Default**: Medium (hash chain). Upgrade on customer request.

**When to weaken**:
- High-volume, low-risk actions (reads, internal APIs)
- Performance-critical paths where signing adds latency
- Development/staging environments

### 3.4 Multi-Actor Attribution

**Scenario**: One action caused by multiple agents and humans.

**Example**: Human approves → Agent A calls API → Agent B processes result → Incident

**How we handle**:

```
Incident #123
├── Contributing actions:
│   ├── action_001: Human "alice" approved deploy (T-10min)
│   ├── action_002: Agent "deployer" called deploy API (T-9min)
│   ├── action_003: Agent "config-gen" updated config (T-5min)
│   └── action_004: System processed config, caused error (T-0)
│
├── Attribution:
│   ├── action_004: confirmed (direct cause)
│   ├── action_003: likely (generated bad config)
│   ├── action_002: suspected (triggered chain)
│   └── action_001: context (enabled the action)
│
└── Responsibility: (not assigned by system)
    └── Suggested: @config-team (owns config-gen)
```

**Multi-actor attribution rules**:
1. All actors in causal chain are listed
2. Each has attribution confidence level
3. Direct cause ≠ sole responsibility
4. Human approvals are "context", not "cause"

### 3.5 Nested Tool Calls

**Scenario**: Agent calls tool A, which internally calls API B.

**Example**: Agent calls `deploy()` → `deploy()` calls Kubernetes API → K8s calls container registry

**How we handle**:

```
Action: deploy()
├── Direct actor: Agent "deployer"
├── Tool: deploy (our SDK wrapped)
├── Nested calls (if visible):
│   ├── kubernetes.apply() [captured via k8s audit log]
│   └── registry.pull() [captured via cloud audit]
└── Attribution: Agent "deployer" for full chain
```

**Nested call visibility**:
| Source | Visibility |
|--------|------------|
| Our SDK wraps it | Full visibility |
| Cloud audit log integration | Partial (API level) |
| No integration | Blind spot (document in postmortem) |

**Principle**: Attribute to the initiating actor. Nested calls are "how", not "who".

### 3.6 Indirect Causation

**Scenario**: Agent generates config that later causes outage.

**Timeline**:
- T-1h: Agent generates config file
- T-0: System reads config, crashes

**How we handle**:

1. **Trace the chain**: Config change → config read → crash
2. **Attribute with lag**: "Action at T-1h likely caused incident at T-0"
3. **Surface the gap**: "1 hour between action and impact"
4. **Pattern learning**: "Config changes to X have delayed impact"

**Time-lagged attribution**:
- Default correlation window: 24 hours
- Configurable per resource type
- "Delayed effect" flag on attribution

### 3.7 Correlation vs Causation

**The trap**: "Event A happened before incident B" ≠ "A caused B"

**How we avoid false attribution**:

| Method | Implementation |
|--------|----------------|
| **Require evidence** | Time alone is "suspected", not "confirmed" |
| **Show confidence** | "70% likely" not "definitely" |
| **Multiple signals** | Time + trace ID + error message |
| **Human confirmation** | Upgrade "suspected" to "confirmed" |
| **False positive tracking** | If confirmed wrong, learn from it |

**Attribution confidence display**:
```
This incident may be related to:
├── action_042: [LIKELY - 85%] Modified auth config 5min before
│   Evidence: Error message mentions "auth_config"
├── action_039: [SUSPECTED - 40%] Deployed user-service 2h before
│   Evidence: Time correlation only
└── [Mark as unrelated] [Confirm cause] [Investigate more]
```

### 3.8 Causal DAG Construction

**Question**: Do we build a dependency DAG?

**Answer**: Yes, but incrementally.

**DAG structure**:
- **Nodes**: Actions, Resources, Effects
- **Edges**: "affected", "triggered", "depends_on"

```
Agent "deployer"
    │
    ▼ (executes)
Action: deploy v2.3.1
    │
    ├──▶ (affects) Resource: payments-service
    │        │
    │        ▼ (depends_on)
    │    Resource: user-db
    │
    └──▶ (triggers) Effect: pod_restart
             │
             ▼ (causes)
         Incident: timeout errors
```

**Edge types**:
| Edge | Meaning | Source |
|------|---------|--------|
| `executes` | Actor performed action | Event log |
| `affects` | Action touched resource | Declared scope |
| `depends_on` | Resource dependency | Service catalog |
| `triggers` | Action caused effect | Trace/correlation |
| `causes` | Effect led to incident | Investigation |

**DAG construction is incremental**:
- MVP: Actions → Resources (from declared scope)
- Phase 2: + Resource dependencies (from service catalog)
- Phase 3: + Runtime traces (from distributed tracing)

### 3.9 Concurrency and Race Conditions

**Scenario**: Two agents write to same resource simultaneously.

**How we handle**:

1. **Detect**: Multiple actions on same resource within window
2. **Flag**: "Concurrent modification detected"
3. **Attribute both**: Both actions are "suspected"
4. **Surface conflict**: "Actions 042 and 043 both modified user-db at T"
5. **Don't guess**: Human determines which (if either) caused issue

**Race condition detection**:
```
IF two_actions.same_resource AND time_diff < 5s:
  flag: "concurrent_modification"
  notify: both owners
  attribution: both "suspected"
```

**Cyclic dependencies**:
- Detect cycles in DAG
- Flag as "complex dependency"
- Don't attempt automated causal inference
- Surface for human investigation

---

# PART D: INTERVENTION MODEL

## Chapter 4: Intervention Actions

### 4.1 Enumerated Intervention Set

All possible interventions are pre-defined:

| Intervention | Reversible? | Auto-allowed? | Description |
|--------------|-------------|---------------|-------------|
| `acknowledge` | Yes | Yes | "I saw this" |
| `flag_for_review` | Yes | Yes | Queue for later |
| `pause_agent` | Yes | Opt-in | Stop agent temporarily |
| `resume_agent` | Yes | Opt-in | Restart paused agent |
| `escalate` | Yes | Opt-in | Notify next tier |
| `create_incident` | No | Opt-in | Formal incident record |
| `trigger_rollback` | No | Never | Start recovery (human executes) |
| `disable_tool` | No | Never | Remove agent capability |
| `update_rule` | No | Never | Change routing config |

**Reversible interventions**: Can be undone without lasting impact.

**Irreversible interventions**: Create permanent records or changes.

### 4.2 Handling Irreversible Actions

**Risk of irreversible actions**:
- Can't undo `create_incident` (record exists)
- Can't undo `trigger_rollback` if it breaks things
- Can't undo `disable_tool` effects already occurred

**Mitigations**:

| Mitigation | Implementation |
|------------|----------------|
| Confirmation | "Are you sure?" for irreversible |
| Preview | "This will do X, Y, Z" |
| Staged rollout | Rollback 10% traffic first |
| Undo path | Even "irreversible" has best-effort undo |
| Audit | Full log of who did what |

### 4.3 Intervention Without Blocking

**Principle**: Route early, don't block execution.

**How to be "intervenable" without blocking**:

```
Timeline:
T+0ms    Agent initiates action
T+1ms    SDK sends event (async)
T+5ms    Tool executes (not blocked)
T+50ms   Routing complete, notification sent
T+100ms  Owner sees notification
T+500ms  Owner can STILL intervene (pause next actions)
```

**Key insight**: Intervention doesn't mean "prevent this action". It means "prevent the next action" or "trigger recovery for this action".

**For truly critical actions** (`gated_execute`):
- These DO block
- But they're rare (<5% of actions)
- User explicitly configures what's gated

### 4.4 Defining "Critical Points"

**Question**: What makes something a critical point?

**Definition**: An action is critical if:
1. **Irreversible** AND **high impact** (e.g., delete production DB)
2. **Explicitly marked** by user in routing rules
3. **Pattern-matched** to past incidents
4. **Anomalous** (unusual for this actor/resource/time)

**Critical point detection**:
```yaml
critical_points:
  - match:
      action_type: ["delete", "drop", "truncate"]
      resource.tags: ["production"]
    reason: "Irreversible production data operation"
    
  - match:
      action_type: "deploy"
      resource.sensitivity: "critical"
      time.outside_business_hours: true
    reason: "Off-hours deploy to critical service"
    
  - match:
      actor.trust_level: "new"
      resource.sensitivity: ["high", "critical"]
    reason: "New actor on sensitive resource"
```

---

# PART E: ROUTING SYSTEM

## Chapter 5: Routing Design

### 5.1 Routing Inputs

| Input | Source | Weight | Example |
|-------|--------|--------|---------|
| `action_type` | Event | Primary | "deploy", "db_write" |
| `resource` | Event scope | Primary | "payments-service" |
| `resource.sensitivity` | Config | Primary | "critical" |
| `resource.tags` | Config | Secondary | ["production", "pci"] |
| `actor.type` | Event | Secondary | "agent" vs "human" |
| `actor.trust_level` | Computed | Secondary | "new", "established" |
| `time.business_hours` | Clock | Modifier | true/false |
| `time.change_freeze` | Calendar | Modifier | true/false |
| `history.incidents` | DB | Secondary | Past incidents on resource |
| `history.actor_failures` | DB | Secondary | Actor's failure rate |
| `owner.available` | Schedule | Modifier | Is owner on-call? |

### 5.2 Avoiding Rule Explosion

**Problem**: Complex rules become unmaintainable.

**Solutions**:

| Strategy | Implementation |
|----------|----------------|
| **Inheritance** | Rules extend base rules |
| **Defaults** | 80% covered by <20 default rules |
| **Tags over specifics** | Match `production` tag, not service names |
| **Computed attributes** | `sensitivity` computed from tags |
| **Rule scoring** | Unused rules flagged for removal |

**Rule limit**: Soft cap at 100 rules per tenant. Above that, we nudge toward consolidation.

**Rule hygiene**:
- Monthly report: "These rules never matched"
- Suggest merges: "Rules A and B overlap 90%"
- Deprecation flow: "Mark unused, delete after 30 days"

### 5.3 Multi-Level Escalation

**Escalation chain design**:

```yaml
escalation:
  levels:
    - name: "primary"
      targets: ["resource.owner"]
      timeout: 5m
      
    - name: "secondary"
      targets: ["resource.team.oncall"]
      timeout: 10m
      
    - name: "management"
      targets: ["resource.team.lead"]
      timeout: 30m
      
    - name: "executive"
      targets: ["@vp-engineering"]
      timeout: null  # Terminal
      
  rules:
    - match:
        severity: "critical"
      start_level: "primary"
      skip_to: "management" # If no response in 15min total
      
    - match:
        severity: "low"
      start_level: "primary"
      max_level: "secondary"  # Don't escalate beyond
```

**Escalation rules location**:
- Global defaults: Shipped with product
- Tenant overrides: In tenant config
- Team overrides: Per-team settings
- Resource overrides: Per-resource settings

**Who maintains**:
- Platform team owns global rules
- Team leads own team rules
- Service owners own resource rules
- Changes audited, require approval for critical

### 5.4 Routing Output Structure

**Routing produces**:

```
RoutingDecision {
  decision: "monitored" | "flagged" | "gated" | "auto"
  
  notifications: [
    {
      target: "@alice",
      channel: "slack",
      urgency: "high",
      reason: "Primary owner of payments-service"
    },
    {
      target: "@payments-oncall",
      channel: "pagerduty",
      urgency: "critical",
      reason: "Escalation target",
      delay: 300  // After 5min if no response
    }
  ]
  
  suggested_actions: [
    {
      action: "pause_agent",
      reason: "High-risk action, consider pausing"
    }
  ]
  
  escalation_path: ["@alice", "@payments-oncall", "@engineering-lead"]
  
  rule_matched: "production-deploy-monitoring"
  confidence: 0.95
}
```

---

# PART F: OWNERSHIP EDGE CASES

## Chapter 6: Ownership Problems

### 6.1 Owner Not Available

| Scenario | Detection | Response |
|----------|-----------|----------|
| Not on-call | PagerDuty schedule | Route to on-call |
| On vacation | Calendar integration | Route to backup |
| In meeting | Presence (optional) | Escalate faster |
| Timezone mismatch | Clock | Find awake owner |

**Availability sources** (in priority order):
1. PagerDuty/Opsgenie on-call
2. Calendar (OOO)
3. Slack presence (opt-in)
4. Manual override

### 6.2 Owner Is Former Employee

**Detection**:
- HR/directory integration shows inactive
- Email bounces
- Slack user deactivated

**Response**:
1. Immediately route to backup/team
2. Flag resource as "orphaned owner"
3. Alert admin: "Former employee still listed as owner"
4. Weekly digest: "These resources have departed owners"

**Prevention**:
- Offboarding webhook triggers ownership review
- 30-day warning before ownership transfer deadline

### 6.3 Owner Is External (Vendor/Contractor)

**Challenges**:
- May not have Slack access
- May not be in PagerDuty
- May have different SLAs

**Handling**:
```yaml
owners:
  - type: external
    name: "Acme Consulting"
    contact: "oncall@acme.com"
    channel: email  # Not Slack
    sla: 4h  # Different from internal 5min
    escalation: "@internal-sponsor"  # Internal fallback
```

**External owner rules**:
- Always have internal escalation backup
- Longer timeouts before escalation
- Email as primary channel
- Explicit SLA in config

### 6.4 No One Wants to Own It

**The "hot potato" problem**: Legacy system, no team wants it.

**Detection**:
- Ownership changed >3 times in 6 months
- Ownership assigned to "platform" (dumping ground)
- Incidents have slow response despite notifications

**Response**:
1. Flag as "ownership disputed"
2. Route to admin/platform team
3. Escalate to management faster
4. Report: "These resources have unstable ownership"

**Forcing function**:
- Can't deploy to unowned resources (opt-in)
- Incidents on unowned resources CC leadership
- Ownership required for new resources

### 6.5 Org Structure vs Service Graph Mismatch

**Problem**: Team A owns service X, but service X depends on service Y owned by Team B, and org chart says they shouldn't talk directly.

**How we handle**:
- Service graph is source of truth for technical routing
- Org chart is source of truth for escalation
- Both are used, not either/or

**Example**:
```
Technical notification: @team-a (owns affected service)
Escalation: @team-a-lead, @team-b-lead (org hierarchy)
Cross-team coordination: Auto-create shared channel
```

### 6.6 Ambiguous Ownership

**Scenario**: Resource claimed by multiple teams, or no team.

**Detection**:
- Multiple ownership entries for same resource
- Ownership entry is a distribution list (not a person/team)
- Ownership is "TBD" or "unknown"

**Response**:
1. Notify ALL claimants (AND not OR)
2. Flag: "Ownership ambiguous, multiple parties notified"
3. Track: Who responds? That's the de facto owner
4. Suggest: "Resolve ownership for resource X"

### 6.7 Multi-Team Impact Without Global View

**Scenario**: Incident affects 5 teams but no one sees the full picture.

**Solution**: Incident coordinator role

```
Incident #234 (multi-team)
├── Affected teams: payments, users, billing, notifications, api-gateway
├── Coordinator: (auto-assigned or first responder claims)
├── Shared channel: #incident-234
└── Global view: Mandate dashboard shows all affected
```

**Auto-coordination**:
1. If incident affects >2 teams: create shared channel
2. First responder can "claim coordinator" role
3. If no coordinator in 10min: escalate to management
4. Dashboard shows cross-team view

---

# PART G: INCIDENT DETECTION

## Chapter 7: Incident Aggregation

### 7.1 Event to Incident Aggregation

**Question**: How do we group events into incidents?

**Aggregation rules**:

| Signal | Grouping |
|--------|----------|
| Same resource + same error + within window | Same incident |
| Same actor + sequential failures | Same incident |
| Correlated by trace ID | Same incident |
| User reports same symptom | Same incident |

**Aggregation window**: 
- Default: 15 minutes
- Configurable per resource/error type
- Extends if events keep coming

**Example**:
```
T+0: Error on payments-service (create incident #123)
T+1min: Error on payments-service (add to #123)
T+5min: Error on payments-service (add to #123)
T+20min: Error on payments-service (new incident #124, outside window)
```

### 7.2 Normal vs Incident

**Question**: How to distinguish noise from signal?

**We do NOT use statistical anomaly detection by default.**

**Why not**:
- Requires baseline (cold start problem)
- False positives erode trust
- "Anomaly" ≠ "incident"

**What we use instead**:

| Method | Implementation |
|--------|----------------|
| **Explicit signals** | Error logs, failed health checks |
| **User reports** | "Report incident" button |
| **External alerts** | PagerDuty, Datadog integration |
| **Pattern match** | "This looks like past incident X" |
| **Threshold (opt-in)** | "If error rate > X, create incident" |

**Statistical detection (Phase 2, opt-in)**:
- Must be explicitly enabled
- Requires 30-day baseline
- User configures sensitivity
- Always "suggested incident", not auto-created

### 7.3 Slow-Burn Incidents

**Scenario**: Performance degrades 1%/day for 2 weeks.

**Challenge**: No single event triggers incident.

**Detection**:
```yaml
slow_burn_detection:
  enabled: true
  metrics:
    - name: "p99_latency"
      source: "datadog"  # External metrics integration
      baseline: "30d_rolling_avg"
      threshold: "+20%"
      window: "7d"
```

**Response**:
1. Create "degradation alert" (not full incident)
2. Notify owner: "Gradual degradation detected"
3. Link to metrics trend
4. Suggest: "Investigate before it becomes incident"

### 7.4 Flash Incidents

**Scenario**: Error spike for 30 seconds, then recovers.

**Challenge**: May not need human intervention.

**Handling**:
```yaml
flash_incident_rules:
  - match:
      duration: "<2min"
      auto_recovered: true
    action: "log_only"
    notification: "digest"  # Include in daily summary
    
  - match:
      duration: "<2min"
      auto_recovered: false
    action: "create_incident"
    notification: "immediate"
```

**Flash incident report**:
- Included in daily digest
- "5 flash incidents yesterday, all auto-recovered"
- Pattern detection: "Flash incidents increasing → investigate"

### 7.5 User Experience Incidents

**Scenario**: Metrics look fine but customers are complaining.

**Challenge**: No technical signal, only human reports.

**Sources**:
- Support tickets (integration with Zendesk, etc.)
- Social media mentions (opt-in)
- Direct user reports in our UI
- Sales/CS team reports

**Handling**:
1. Manual incident creation with "user_reported" tag
2. No auto-attribution (we don't know cause yet)
3. Investigation flow: Link actions in time window
4. Postmortem: "Metrics didn't catch this because..."

---

# PART H: IMPACT QUANTIFICATION

## Chapter 8: Blast Radius

### 8.1 Defining Blast Radius Bounds

**Blast radius** = set of affected resources and owners

**Lower bound** (definitely affected):
- Resources explicitly in action scope
- Resources that failed immediately after

**Upper bound** (possibly affected):
- All downstream dependencies
- All services in same failure domain
- All users of affected resources

**What we show**:
```
Blast radius for action #042:
├── Definitely affected (lower bound):
│   ├── payments-service
│   └── payments-db
├── Likely affected:
│   ├── user-service (depends on payments-service)
│   └── billing-service (shares payments-db)
├── Possibly affected (upper bound):
│   └── 12 other services in dependency chain
└── Owners to notify: 4 (from definitely + likely)
```

### 8.2 Impact to Notification Mapping

**Rule**: Notify based on confidence level

| Confidence | Notification |
|------------|--------------|
| Definitely affected | Immediate, all channels |
| Likely affected | Immediate, primary channel |
| Possibly affected | Digest, or on-demand |

**Notification content includes**:
- Why they're being notified
- Confidence level
- What they should check
- Link to full blast radius

### 8.3 Impact Quantification Display

**Quantified impact**:
```
Incident #234 Impact:
├── Duration: 23 minutes
├── Services affected: 4
├── Estimated requests failed: 12,340
├── Estimated users impacted: 890
├── Revenue impact: $X (if configured)
└── SLA impact: 2 nines consumed
```

**Data sources**:
- Duration: Our incident timeline
- Services: Blast radius
- Requests: External metrics (Datadog integration)
- Users: Customer data (optional integration)
- Revenue: Customer-provided formula

---

# PART I: RECOVERY SUGGESTIONS

## Chapter 9: Actionable Recovery

### 9.1 Recovery as Suggestions

**We suggest, we don't execute.**

**Suggestion format**:
```
Suggested recovery for incident #234:

1. [RECOMMENDED] Rollback payments-service to v2.3.0
   Reason: Last known good version, deployed 2 days ago
   Risk: Low (no DB migrations since)
   Command: kubectl rollout undo deployment/payments-service
   
2. [ALTERNATIVE] Disable feature flag "new-checkout"
   Reason: Incident correlates with flag enablement
   Risk: Medium (affects 20% of users)
   Command: launchdarkly disable new-checkout
   
3. [INVESTIGATE] Check payments-db connection pool
   Reason: Error messages mention connection timeout
   Link: [Datadog dashboard]
```

### 9.2 Basis for "Rollback to Version X"

**When we suggest rollback**:
1. Incident correlates with recent deploy
2. Previous version had no incidents for N days
3. No irreversible changes between versions (checked against migration log)

**What we check before suggesting**:
- DB migrations: If migrations ran, warn "rollback may not revert schema"
- Config changes: If config changed, include config rollback
- Dependencies: If dependencies updated, flag compatibility risk

### 9.3 Basis for "Disable Tool/Permission"

**When we suggest disabling**:
1. Specific tool caused multiple incidents
2. Tool is non-essential (based on usage patterns)
3. Disabling won't break critical flows

**Safeguards**:
- Never suggest disabling critical tools (marked in config)
- Always show impact: "Disabling X will prevent agent from doing Y"
- Require confirmation before action

### 9.4 Handling Bad Suggestions

**Question**: What if our suggestion makes things worse?

**Mitigations**:

1. **We don't auto-execute**: Human reviews and decides
2. **We show confidence**: "70% confident this will help"
3. **We show risks**: "Risk: May cause Y"
4. **We track outcomes**: "Last time this was suggested, it helped 80% of cases"
5. **We learn from mistakes**: If suggestion led to worse outcome, update models

**Liability position**:
- We provide information, not commands
- Human makes final decision
- Our suggestions are "best effort based on available data"
- ToS clarifies advisory nature

---

# PART J: LEARNING SYSTEM

## Chapter 10: Pattern Recognition

### 10.1 Pattern Definition

**Pattern** = recurring incident signature

**Pattern structure**:
```
Pattern {
  id: "PAT-042"
  signature: {
    action_type: "deploy"
    resource_pattern: "payments-*"
    failure_mode: "timeout"
    time_pattern: "after_hours"  // Optional
  }
  
  instances: [incident_001, incident_015, incident_023]
  
  frequency: "3 times in 30 days"
  
  suggested_prevention: {
    type: "routing_rule"
    rule: "Gate after-hours deploys to payments-*"
    status: "suggested"  // Not yet applied
  }
}
```

### 10.2 Pattern Features

| Feature | How extracted | Weight |
|---------|---------------|--------|
| `action_type` | Direct from event | High |
| `resource_pattern` | Regex from resource ID | High |
| `failure_mode` | Error classification | High |
| `actor_pattern` | Actor type/name pattern | Medium |
| `time_pattern` | Time-of-day clustering | Low |
| `sequence_pattern` | Preceding actions | Medium |

### 10.3 Same Cause, Different Symptoms

**Challenge**: Root cause X manifests as symptoms A, B, C.

**Detection**:
1. Cluster incidents by timeline (concurrent incidents)
2. Find common ancestor in causal DAG
3. Suggest: "Incidents #1, #2, #3 may share root cause"

**Example**:
```
Symptom 1: payments-service timeout
Symptom 2: user-service errors
Symptom 3: billing-service slow

Common ancestor: payments-db connection exhaustion

Pattern created: "DB connection exhaustion → multi-service impact"
```

### 10.4 Second Occurrence Detection

**Question**: How to detect "same error happened again"?

**Detection levels**:

| Level | Detection | Confidence |
|-------|-----------|------------|
| Exact match | Same signature tuple | High |
| Similar match | 80%+ feature overlap | Medium |
| Possible match | 50%+ feature overlap | Low |

**Notification**:
```
⚠️ This incident matches pattern PAT-042

Previous occurrences:
- Incident #015 (2 weeks ago) - Postmortem: [link]
- Incident #023 (1 week ago) - Postmortem: [link]

Suggested action items from postmortem #023 were:
- [ ] Add connection pool monitoring (NOT DONE)
- [x] Increase pool size (DONE)

This may be a repeat incident.
```

### 10.5 Learning Crystallization

**Question**: How to turn learning into rules/guardrails?

**Process**:
```
Incident → Postmortem → Action item → Suggested rule → Approved rule → Active rule
```

**Example flow**:
1. Incident: After-hours deploy caused outage
2. Postmortem: "We should require approval for after-hours deploys"
3. Action item: "Create routing rule for after-hours deploys"
4. Suggested rule (auto-generated):
   ```yaml
   - name: "Gate after-hours deploys (from incident #234)"
     match:
       action_type: "deploy"
       time.business_hours: false
     decision: gated_execute
     source: "postmortem:234"
   ```
5. Approval: Team lead reviews and approves
6. Active: Rule goes live

**Who approves**: 
- Team lead for team-scoped rules
- Platform team for global rules
- Not auto-approved (to avoid rule explosion)

### 10.6 Learning vs Speed Tradeoff

**Question**: Won't crystallized rules slow things down?

**Balancing mechanisms**:

1. **Sunset dates**: Rules expire after N months unless renewed
2. **Override capability**: Engineers can bypass with reason logged
3. **Friction budget**: Team has X "gated" rules max
4. **Metrics**: Track "time blocked by rules" vs "incidents prevented"

**Principle**: Fast to try, hard to repeat mistakes

**Implementation**:
- First occurrence: Full speed, monitored
- Second occurrence: Warning, tracked
- Third occurrence: Suggest rule
- Rule created: Now gated

### 10.7 Unknown Root Cause

**Scenario**: Incident resolved but cause unclear.

**How we record uncertainty**:
```
Incident #234 Postmortem:
├── What happened: [documented]
├── Impact: [documented]
├── Root cause: UNDETERMINED
│   ├── Hypothesis 1: Connection leak (40% confidence)
│   ├── Hypothesis 2: Traffic spike (30% confidence)
│   └── Unknown factors: (30% probability)
├── Resolution: Restarted service (symptom fix, not root fix)
└── Follow-up: Schedule deep investigation
```

**Handling undetermined causes**:
- Don't create pattern from single uncertain incident
- If 3+ incidents have same "undetermined" fingerprint → escalate
- Mark resource as "needs investigation"

---

# PART K: CONFIDENCE AND UNCERTAINTY

## Chapter 11: Displaying Uncertainty

### 11.1 Confidence Levels

**Every inference has confidence**:

| Level | Display | Meaning |
|-------|---------|---------|
| >90% | "Confirmed" | Human verified or overwhelming evidence |
| 70-90% | "Likely" | Strong correlation, multiple signals |
| 40-70% | "Suspected" | Time correlation, single signal |
| <40% | "Possible" | Weak signal, included for completeness |

**Display**:
```
Root cause analysis:
├── [LIKELY - 82%] Config change to payments-service
│   Evidence: Error message matches config, time correlation
├── [SUSPECTED - 45%] Traffic spike
│   Evidence: Time correlation only
└── [POSSIBLE - 20%] DB connection issue
    Evidence: Similar symptoms in past, no direct evidence
```

### 11.2 Avoiding False Certainty

**Rules**:
1. Never say "definitely" unless human confirmed
2. Always show evidence behind confidence
3. Show "we don't know" when appropriate
4. Track confidence calibration (were our 80% right 80% of the time?)

**Calibration tracking**:
```
Confidence calibration (last 30 days):
- Claims at 80%+ confidence: 45
- Actually correct: 38
- Calibration: 84% (well calibrated)
```

### 11.3 User Over-Reliance Prevention

**Risk**: Users trust confidence scores too much.

**Mitigations**:
1. Education: Onboarding explains what confidence means
2. Variety: Different incidents show different confidence levels
3. Challenges: Occasionally ask "Was this attribution correct?"
4. Transparency: Show when we were wrong

---

# PART L: ORGANIZATIONAL DYNAMICS

## Chapter 12: Cultural Challenges

### 12.1 Teams That Don't Want Recording

**Scenario**: "We don't want our actions logged."

**Response hierarchy**:

1. **Understand why**: Fear of blame? Privacy? Performance?
2. **Address specific concerns**:
   - Blame fear → Emphasize blameless postmortem culture
   - Privacy → Show data retention, access controls
   - Performance → Show latency impact (<5ms)
3. **Offer graduated rollout**: Start with lower environments
4. **Escalate if blocking**: Security/compliance may override

**We position as**: Safety net, not surveillance.

### 12.2 Compliance-Required Recording

**Scenario**: Regulated industry requires full audit trail.

**We provide**:
- Complete event log with tamper evidence
- Configurable retention (up to 7 years)
- Export to SIEM/compliance tools
- Access audit for the audit trail
- Attestation reports (SOC2, ISO27001)

### 12.3 Blame-Fear Avoidance

**Problem**: "If I use this, I'll get blamed for incidents."

**Positioning**:
1. **Blameless language**: "Contributing factors" not "fault"
2. **Team attribution**: Attribute to team, not individual (configurable)
3. **Learning focus**: Postmortems emphasize "what to change" not "who to blame"
4. **Management training**: Help leadership understand blameless culture

**Feature**: Anonymous mode (opt-in)
- Actions attributed to team, not individual
- Individual identity in separate audit log (for compliance)
- Public view shows "Team X" not "@alice"

### 12.4 Information Overload in Incidents

**Problem**: During P0, too much information.

**Solution**: Progressive disclosure

**Incident view levels**:
```
Level 1 (Default): 
├── Status: ACTIVE
├── Impact: payments-service down
├── Who's responding: @alice, @bob
└── [Show more]

Level 2 (Expanded):
├── Timeline: Last 5 events
├── Blast radius: 3 services
├── Suggested actions: Top 2
└── [Show full details]

Level 3 (Full):
├── Complete timeline
├── All related events
├── Full causal analysis
└── All suggested actions
```

### 12.5 "Top 3 Things Right Now"

**During incident, we surface**:
```
🚨 Incident #234 - What to do NOW:

1. CONTAIN: Pause agent "deployer" [Pause button]
   Reason: Still making changes

2. INVESTIGATE: Check payments-db connections
   Link: [Dashboard] [Logs]

3. NOTIFY: @billing-team not yet aware
   Impact: They depend on payments-service
   [Notify them]
```

**Selection logic**:
- Containment actions first (stop bleeding)
- Investigation pointers second (find cause)
- Coordination tasks third (loop in others)

### 12.6 Conflicting Suggestions

**Scenario**: We suggest both "rollback" and "increase capacity."

**Handling**:
```
Suggested actions (may be alternatives):

Option A: Rollback to v2.3.0
├── Confidence: 75%
├── Risk: Low
└── Addresses: Bad deploy hypothesis

Option B: Increase DB connections
├── Confidence: 60%
├── Risk: Medium (may not help)
└── Addresses: Connection exhaustion hypothesis

These may be complementary or alternatives. 
Recommend: Try A first (lower risk), B if A doesn't help.
```

---

# PART M: DATA INTEGRITY

## Chapter 13: Handling Data Problems

### 13.1 Untracked Human Actions

**Scenario**: Human did something but we didn't see it.

**Detection**:
- Cloud audit log shows change, no corresponding event
- Outcome changed but no tracked action

**Response**:
1. Create "unattributed change" event
2. Flag: "Change detected via audit log, not tracked"
3. During incident: "There may be untracked changes"
4. Postmortem: "Coverage gap identified"

### 13.2 Disputed Attribution

**Scenario**: "I didn't do that!"

**Handling**:
1. Show evidence: "Event recorded at T with your credentials"
2. Check for impersonation: Different IP? Suspicious timing?
3. Allow dispute: "Mark as disputed" with reason
4. Investigate: Security team reviews if pattern

**Dispute record**:
```
Event #042 disputed by @alice
├── Claim: "I didn't make this change"
├── Evidence reviewed:
│   ├── IP: 1.2.3.4 (matches alice's usual)
│   ├── Time: 3:42 PM (during working hours)
│   └── Session: Active session on laptop
├── Resolution: CONFIRMED (evidence supports attribution)
└── Notes: May need MFA review
```

### 13.3 Lost Events

**Scenario**: SDK crash, network issue → events lost.

**Detection**:
- Gap in sequence numbers
- Cloud audit log has more events than us
- Agent reports send failure

**Response**:
1. Mark gap: "Events may be missing between T1 and T2"
2. Attempt recovery: Query cloud audit logs
3. Partial reconstruction: Best effort timeline
4. Document: "Attribution may be incomplete for this period"

### 13.4 Routing with Partial Data

**Scenario**: Some event fields missing.

**Graceful degradation**:
```
IF action_type missing:
  → Route based on resource only
  → Flag: "Action type unknown, routing on resource"

IF resource missing:
  → Route to admin/fallback
  → Flag: "Resource unknown, cannot determine owner"

IF actor missing:
  → Log event but cannot attribute
  → Flag: "Actor unknown, event logged without attribution"
```

### 13.5 Degraded Mode

**Full degradation path**:
```
Normal:      Event → Routing → Notification → Track response
Degraded 1:  Event → Routing → Notification (no tracking)
Degraded 2:  Event → Default routing → Email only
Degraded 3:  Event logged → Manual playbook triggered
Degraded 4:  (System down) → External alerting activates
```

**Each level is self-contained**: Don't need higher levels to function.

---

# PART N: SECURITY CONCERNS

## Chapter 14: Threat Scenarios

### 14.1 Malicious Insider

**Scenario**: Engineer wants to hide their actions.

**Mitigations**:
| Attack | Defense |
|--------|---------|
| Delete events | Append-only, no delete permission |
| Modify events | Hash chain detects tampering |
| Forge events as someone else | Signed events (if enabled) |
| Disable logging | Alert on logging gap |
| Access others' data | RBAC, audit log |

### 14.2 Agent Spoofing Identity

**Scenario**: Agent claims to be different agent.

**Mitigations**:
1. **Agent registration**: Agents must be registered with credentials
2. **Mutual TLS**: Agent identity verified via certificate
3. **Anomaly detection**: Agent X suddenly doing Agent Y actions → alert
4. **Credential rotation**: Regular key rotation

### 14.3 Tool Poisoning

**Scenario**: Tool itself is compromised, sends false events.

**This is outside our threat model**, but we can help detect:
1. Correlate with cloud audit logs (independent source)
2. Discrepancy → flag for investigation
3. We can't prevent, but can help detect

### 14.4 Intentional Malfeasance

**Scenario**: Someone deliberately causing harm.

**Detection**:
1. Unusual patterns: Bulk deletes, after-hours access
2. Anomaly alerts: "Agent X doing unusual actions"
3. Escalation: Auto-notify security team for suspicious patterns

**Response**:
1. We detect and surface
2. Security team investigates
3. We provide forensic data

### 14.5 SecOps Relationship

**Question**: Are we competing with security team?

**Answer**: We're complementary, not competing.

| SecOps does | We do |
|-------------|-------|
| Threat detection | Action attribution |
| Incident response (security) | Incident response (operational) |
| Access control policy | Ownership routing |
| Forensics | Causal timeline |

**Integration points**:
- Feed our events to SIEM
- Receive security alerts to correlate
- Shared incident view

**Positioning**: "We help you see what agents and humans did. You decide what's malicious."

---

# PART O: PRIVACY AND COMPLIANCE

## Chapter 15: Privacy Concerns

### 15.1 "Employee Monitoring" Concern

**Question**: Isn't this surveillance?

**Our position**:
1. We track **actions**, not people's behavior
2. Focus on **production systems**, not personal activity
3. **Blameless** culture emphasis
4. **Transparency**: Employees know what's logged
5. **Access controls**: Not everyone can see everything

**What we log**:
- Actions on production systems
- Tool calls by agents
- Changes to code/config/data

**What we don't log**:
- Browsing history
- Communication content
- Personal device activity
- Non-work systems

### 15.2 Right to Deletion vs Audit

**Conflict**: GDPR deletion vs audit retention.

**Resolution**:
1. **Action data** (who did what to systems): Audit exemption, retained
2. **Personal data** (in action payloads): Scrubbed after retention period
3. **Identity data**: Pseudonymized after departure

**Legal basis**: Legitimate interest (security, compliance) for action data.

### 15.3 Cross-Border Data

**Requirements by region**:
| Region | Requirement | Solution |
|--------|-------------|----------|
| EU | GDPR, data residency | EU deployment option |
| China | Data localization | Customer VPC only |
| US | Varies by industry | Standard cloud |

**Multi-region architecture**:
- Data stays in region
- Control plane can be central
- No cross-region data transfer for events

---

# PART P: DEPLOYMENT AND OPERATIONS

## Chapter 16: Self-Hosted Deployment

### 16.1 Air-Gapped Deployment

**Scenario**: Customer allows no external connections.

**Solution**:
```
Customer VPC (air-gapped):
├── Mandate services (our code)
├── Postgres (customer managed)
├── Redis (customer managed)
└── No external calls

Updates:
├── Customer downloads release package
├── Verifies signatures
├── Deploys manually
└── We provide instructions, not access
```

### 16.2 Update Strategy

**SaaS**: Continuous deployment, we manage.

**Customer VPC**: 
1. Release packages quarterly (or monthly)
2. Customer schedules maintenance window
3. Backward compatible API for 2 versions
4. Database migrations tested in staging first

### 16.3 Our Own Rollback

**If our update breaks things**:
1. Feature flags: Disable new code paths
2. Database rollback: Reversible migrations only
3. Version rollback: Previous container version
4. Customer notification: Status page + email

**Rollback tested**: Every release has rollback procedure tested.

### 16.4 Version Compatibility

**SDK ↔ Backend compatibility**:
```
SDK v1.x works with Backend v1.x, v2.x
SDK v2.x works with Backend v2.x, v3.x
Backend v3.x supports SDK v2.x, v3.x

Breaking changes:
- 6 month deprecation notice
- Migration guide provided
- Compatibility shim for 1 version
```

### 16.5 Database Migrations

**Migration safety**:
1. All migrations reversible (or documented if not)
2. Tested on production-like data
3. Staged rollout: 1 tenant → 10% → 100%
4. Monitor for errors during migration
5. Rollback within 1 hour if issues

**Schema migration testing**:
```bash
# CI pipeline
./migrate up --dry-run
./migrate up --on-copy-of-production
./run-tests
./migrate down
./verify-clean-rollback
```

---

# PART Q: EXTERNAL DEPENDENCIES

## Chapter 17: Cross-Organization

### 17.1 Customer's Customer

**Scenario**: Impact flows to customer's end users.

**Handling**:
- We track impact within customer's systems
- Customer defines "external impact" threshold
- If threshold crossed: special notification
- Customer handles external communication

### 17.2 Vendor Dependencies

**Scenario**: Customer's vendor (AWS, Stripe) has issues.

**Integration**:
```yaml
external_dependencies:
  - name: "AWS"
    status_page: "https://status.aws.amazon.com"
    integration: "status_page_monitor"
    
  - name: "Stripe"
    status_page: "https://status.stripe.com"
    integration: "status_page_monitor"
```

**When external dependency has incident**:
1. Show in our dashboard
2. Correlate: "Internal incident may be caused by AWS outage"
3. Suggest: "Check if AWS issue is root cause before investigating internally"

### 17.3 External Attribution

**Can we attribute to external services?**

Limited:
- We can correlate timing
- We can note "AWS had incident at same time"
- We cannot confirm causation (outside our visibility)

**Display**:
```
Possible external factors:
├── AWS us-east-1: Degraded (started 5min before incident)
│   Source: AWS status page
│   Correlation: Our incident affects AWS-hosted services
└── This is correlation, not confirmed causation
```

---

# PART R: TESTING AND QUALITY

## Chapter 18: Testing Strategy

### 18.1 Migration Testing

**Before any production migration**:
1. Run on production data copy
2. Verify data integrity post-migration
3. Run application test suite
4. Performance benchmark
5. Rollback test

**Migration checklist**:
```
[ ] Migration is reversible (or documented why not)
[ ] Tested on prod-like data (>1M rows)
[ ] No locks >10 seconds
[ ] Rollback tested
[ ] Monitoring in place for migration
[ ] Communication sent to affected customers
```

### 18.2 Chaos Testing

**Scenarios we test**:
| Scenario | Expected behavior |
|----------|------------------|
| Database failover | Events queued, no loss |
| Redis crash | Fallback to polling |
| Network partition | Reconnection works |
| Notification service crash | Events logged, notifications delayed |
| Clock skew (5 min) | Events ordered correctly |
| Duplicate events | Deduplicated |

### 18.3 Load Testing

**Targets**:
- 1,000 events/second sustained
- 10,000 concurrent WebSocket connections
- P99 <1s under load

**Regular load tests**: Weekly automated, results tracked.

---

# APPENDIX: DECISION LOG

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Attribution granularity | Tool call | Smallest observable unit |
| Routing default | `monitored_execute` | Bias toward speed |
| Auto-execution | Advisory only (mostly) | Trust + liability |
| Rule format | YAML | Familiar, versionable |
| Primary database | Postgres | Simple, ACID, good enough |
| Multi-tenancy | Row-level | Operational simplicity |
| Confidence display | Always shown | Avoid false certainty |
| Postmortem automation | Draft only | Human judgment needed |
| Pattern learning | Suggest rules | Human approves |

---

**Document Version**: 5.2 Complete
**Last Updated**: January 2026
**Total Questions Addressed**: 180+
**Status**: Ready for Implementation
