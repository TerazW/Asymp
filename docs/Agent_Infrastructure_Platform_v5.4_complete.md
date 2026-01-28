# Mandate: Operational Coordination for the Agent Era

**Version 5.4 Complete Specification | January 2026**

---

# PART A: POSITIONING AND STRATEGY

## Chapter 1: One-Sentence Definition

### 1.1 The Sentence

**Mandate routes agent actions to the right humans in real-time so they can intervene before damage compounds.**

- **Object**: Agent actions
- **Action**: Routes to right humans in real-time
- **Result**: Intervention before damage compounds

### 1.2 What "Intervene at Agent Speed" Means

**Concrete numbers**:

| Metric | Without Mandate | With Mandate | Improvement |
|--------|-----------------|--------------|-------------|
| Time to awareness | 5-30 min (discover in logs) | <30 sec (pushed notification) | 10-60x |
| Time to right person | 10-60 min (war room, escalation) | <2 min (pre-routed) | 5-30x |
| Time to intervention | 30-120 min (investigate, decide, act) | <5 min (suggested actions) | 6-24x |

**Target TTI (Time-to-Intervention)**:
- P50: 60 seconds
- P95: 5 minutes
- For critical incidents

**"Agent speed" means**: Agents act in seconds. Humans need to intervene in seconds-to-minutes, not hours.

---

## Chapter 2: Category and Positioning

### 2.1 What Problem We Solve

**We solve on-call coordination for agent-driven systems.**

| Category | Primary? | How we relate |
|----------|----------|---------------|
| **On-call coordination** | **PRIMARY** | This is what we do |
| Incident response | Secondary | We help respond faster |
| Governance | Tertiary | We enable governance without blocking |
| Observability | No | We use observability, don't provide it |

**The hierarchy**:
```
On-call coordination (PRIMARY)
    ├── Who should know about this action?
    ├── How do I reach them fast?
    └── What should they do?
    
Incident response (SECONDARY)
    ├── What went wrong?
    ├── How do we fix it?
    └── How do we prevent it?
    
Governance (TERTIARY)
    ├── What are the rules?
    └── Are we following them?
```

### 2.2 Platform vs Tool

**We are a tool, aspiring to become infrastructure.**

| Stage | Classification |
|-------|----------------|
| Year 1 | Tool (point solution for coordination) |
| Year 2-3 | Platform (ecosystem of integrations) |
| Year 4+ | Infrastructure (invisible, assumed) |

**We want users to think of us as**:
- "The thing that tells me who to call"
- "The thing that shows me what agents did"
- NOT "another dashboard to check"

### 2.3 Replace or Complement?

**We complement PagerDuty/Slack, not replace.**

| Tool | Our relationship |
|------|------------------|
| **PagerDuty/Opsgenie** | We trigger them, they alert |
| **Slack** | We post to it, humans respond there |
| **Datadog** | We use their data, they don't do routing |
| **JIRA/ServiceNow** | We create tickets, they track |

**We are the glue layer** between "something happened" and "the right person is acting on it."

### 2.4 Most Like / Least Like

**Most like**: PagerDuty (routing to humans) + incident.io (coordination)

**Least like**: 
- Datadog (we're not observability)
- Rubrik (we're not backup/restore)
- Approval systems (we don't block)

### 2.5 Avoiding Misunderstanding

**How we avoid being seen as "another control plane"**:

1. **Language**: "Coordination" not "control"
2. **Default**: Execute, don't block
3. **Framing**: "We help humans intervene" not "we govern agents"
4. **Comparison**: "Like PagerDuty for agents" not "like IAM for agents"

**Words we use**: route, notify, coordinate, surface, suggest

**Words we avoid**: approve, block, prevent, enforce, govern

---

## Chapter 3: Core Mechanics

### 3.1 Routing Destination

**"Routing" routes to**:

| Destination | When | Example |
|-------------|------|---------|
| **Person** | Primary owner available | @alice in Slack |
| **Team channel** | Team-owned resource | #payments-team |
| **On-call rotation** | Via PagerDuty/Opsgenie | Whoever's on call |
| **Escalation chain** | No response | @alice → @bob → @lead |
| **Playbook** | Automated first response | "Run health check" |

**Not routing to**:
- Approval system (we're not asking for permission)
- Rollback system (we suggest, humans trigger)
- AI for decision (humans decide)

### 3.2 "Pre-Action Routing, Not Pre-Action Approval"

**Meaning**: We decide *who should know* before action executes, not *whether action should execute*.

**Concrete example**:

```
APPROVAL SYSTEM (what we don't do):
Agent wants to deploy
    → System asks: "Should this be allowed?"
    → Human reviews
    → Human clicks "Approve" or "Deny"
    → Agent waits, then maybe executes
    
ROUTING SYSTEM (what we do):
Agent deploys
    → System decides: "Who should know about this?"
    → @alice notified immediately
    → Deploy executes (not blocked)
    → @alice can pause/rollback if needed
```

**The difference**: 
- Approval = gatekeeper (blocks by default)
- Routing = dispatcher (notifies, doesn't block)

### 3.3 Output Unit

**The minimum unit we output is: Notification**

| Concept | Definition |
|---------|------------|
| **Event** | Something that happened (input) |
| **Action** | An agent operation (input) |
| **Notification** | Our output: "This person should know this thing" |
| **Incident** | A grouping of notifications about a problem |

**Why notification**:
- It's atomic (one recipient, one message)
- It's actionable (has response options)
- It's measurable (TTI starts when notification sent)

---

## Chapter 4: Behavior Change

### 4.1 Current User Behavior

**Today, when an agent causes an issue**:
1. Someone notices (maybe in logs, maybe customer complaint)
2. They ask: "What changed?" (grep, dashboard hunting)
3. They ask: "Who owns this?" (Slack search, asking around)
4. They escalate (war room, random paging)
5. They investigate (more dashboard hunting)
6. They fix (maybe, eventually)

**Time**: 30 minutes to hours

### 4.2 Behavior We Want

**With Mandate**:
1. Agent acts
2. Right person notified immediately
3. Context in notification (what happened, blast radius)
4. Suggested actions in notification
5. One-click response

**Time**: 1-5 minutes

### 4.3 The Habit We Build

| Old habit | New habit |
|-----------|-----------|
| "Check Datadog" | "Check Mandate notification" |
| "Who owns this?" | "Notification tells me" |
| "What changed?" | "Timeline shows me" |
| "Start a war room" | "War room pre-created" |

---

## Chapter 5: Market Thesis

### 5.1 Future Agent Incidents

**Main incident types we predict**:

| Type | Description | Priority |
|------|-------------|----------|
| **Unintended cascades** | Agent A triggers B triggers C | P0 - First focus |
| **Configuration drift** | Agent slowly misconfigures | P1 |
| **Permission creep** | Agent accumulates access | P2 |
| **Resource exhaustion** | Agent consumes too much | P2 |
| **Data quality** | Agent corrupts data silently | P3 |

**We start with**: Unintended cascades (most visible, most acute pain)

### 5.2 Why Now, Not Later

**The window**:

1. **Problem is real now**: Companies deploying agents, incidents happening
2. **Giants aren't focused**: Datadog doing observability, Rubrik doing backup
3. **Habits forming**: Teams establishing agent workflows now
4. **Wedge available**: Coordination layer is unclaimed

**Risk of waiting**:
- Giants add features (likely in 12-24 months)
- Another startup captures wedge
- Habits solidify without us

### 5.3 Defensibility vs Giants

**If Datadog adds "agent on-call routing" tomorrow**:

We still have:
1. **Learning loop**: They don't do postmortem → pattern → rule
2. **Attribution**: They do traces, not causal attribution
3. **Focus**: We're 100% on this; it's their side feature
4. **Integration depth**: We work with Datadog, not against

**If Rubrik adds "real-time owner notification" tomorrow**:

We still have:
1. **Routing sophistication**: They do blast radius → backup; we do blast radius → right person → right action
2. **Non-rollback recovery**: They only know backup/restore
3. **Learning loop**: Same as above
4. **Dev team focus**: They target enterprise backup buyers

**Our moat**: Depth of coordination + learning loop + routing sophistication

---

## Chapter 6: Strategic Definitions

### 6.1 Key Terms

**Agent deployment**:
- 10+ agents operating in production
- Touching production data/systems
- Running without continuous human oversight

**Autonomous agent**:
- Can initiate actions without human trigger
- Can make decisions about what to do
- Can affect external state (not just generate text)
- Has access to tools/APIs

**Intervention**:
- Any human action in response to agent action
- Types: pause, rollback, escalate, investigate, acknowledge, ignore

**Attribution**:
- Linking an outcome to an actor
- Actor can be: agent, human, system, policy
- Confidence levels: suspected, likely, confirmed

**State** (what we track):
- Execution state (what's running, what's paused)
- System state (what changed)
- NOT data state (we don't store your data)
- NOT organization state (we use your org chart, don't manage it)

### 6.2 Our "Truth"

**What we guarantee**:
1. If an event was sent to us, it was recorded (durability)
2. If we notified someone, it's logged (auditability)
3. Ownership mapping reflects your config (consistency)
4. Timeline order is correct (ordering)

**What we don't guarantee**:
1. We caught all agent actions (depends on integration)
2. Attribution is correct (we estimate, humans confirm)
3. Suggested actions will work (advisory)

### 6.3 Success Metrics

**Primary metrics**:

| Metric | Definition | Target |
|--------|------------|--------|
| **TTI** | Notification → human action | P50 <60s |
| **TTC** | Incident created → contained | P50 <15min |
| **Repeat incident rate** | Same pattern twice | Decreasing |

**Secondary metrics**:

| Metric | Definition | Target |
|--------|------------|--------|
| Notification relevance | % marked helpful | >70% |
| Ownership coverage | % actions with owner | >90% |
| Attribution accuracy | % correct attributions | >80% |

### 6.4 Fewer Incidents vs More Controllable

**We bet on: More controllable.**

**Why**:
- "Fewer incidents" requires predicting/preventing (hard)
- "More controllable" requires fast detection/response (achievable)
- Agents will cause incidents; the question is recovery speed

**Our promise**: "When agents break things, you'll know faster and fix faster."

**Not our promise**: "Agents won't break things."

---

## Chapter 7: Product Decisions

### 7.1 Wedge Scenario

**Narrowest wedge**: 

> "Your agent deployed to production. We told the right person in 30 seconds. They rolled back in 2 minutes."

**Why this wedge**:
- Deploy is high-stakes, frequent
- "Right person notified" is immediate value
- "30 seconds" is measurable improvement
- No workflow change required

### 7.2 Usage Frequency

**Expected daily usage**:

| Scenario | Frequency | Usage |
|----------|-----------|-------|
| Calm day | 10-50 notifications | Glance, acknowledge |
| Busy day | 100-500 notifications | Triage, some interventions |
| Incident day | 500+ notifications | War room mode |

**Per user**: 5-20 interactions/day (notifications, responses, lookups)

**We should be**: Quiet but always there. Not "another dashboard to check."

### 7.3 Integration Surface

**Where we embed**:

| Surface | Priority | Rationale |
|---------|----------|-----------|
| **Slack/Teams** | P0 | Where humans already are |
| **PagerDuty** | P0 | Existing alerting workflow |
| **Agent runtime** | P0 | Capture events at source |
| **CI/CD** | P1 | Deploy is key action |
| **IDE** | P3 | Not where incidents happen |
| **Orchestrator** | P2 | For workflow-level visibility |

**Primary home**: Slack (that's where action happens)

### 7.4 Core Currency

**The market's core currency is: Time.**

Not:
- Risk (too abstract to measure)
- Money (too indirect)
- Reputation (too intangible)

**Time** because:
- "How long until we knew?" (measurable)
- "How long until we fixed it?" (measurable)
- "How much time did we waste?" (felt)

**We sell time**: "We save you 30 minutes per incident."

### 7.5 If We Keep Only One Feature

**Keep**: Real-time notification to the right owner.

**Why**: 
- This is the atomic unit of value
- Everything else (timeline, attribution, learning) builds on this
- Without "right person, right time," nothing else matters

### 7.6 If We Delete One Feature

**Delete**: ML-based pattern detection (Phase 3 feature).

**Why**:
- Rule-based works for MVP
- ML requires data we don't have yet
- Can add later without architectural change
- Users don't buy us for ML

---

## Chapter 8: Competitive Response

### 8.1 If Datadog Adds Agent Routing

**Their likely approach**:
- Add "Agent Console" with routing
- Integrate with their existing alerting
- Focus on enterprise

**Our response**:
1. **Go deeper on learning loop**: They won't do postmortem → pattern → rule
2. **Go deeper on coordination**: Multi-team incidents, war rooms
3. **Go faster on dev teams**: While they sell to enterprise
4. **Stay agent-native**: We don't have legacy observability baggage

**What we lose**: "Unified platform" story
**What we keep**: Depth, speed, focus

### 8.2 If Rubrik Adds Real-Time Notification

**Their likely approach**:
- Add Slack notification when "rewind needed"
- Focus on data recovery scenario
- Enterprise sales motion

**Our response**:
1. **Routing sophistication**: They notify "someone"; we notify "the right person"
2. **Beyond rollback**: We suggest multiple recovery paths
3. **Learning loop**: They don't do prevention
4. **Dev team focus**: They don't speak our language

**What we lose**: "Complete solution" story for backup-minded buyers
**What we keep**: Coordination depth, non-backup scenarios

---

## Chapter 9: Control vs Coordination

### 9.1 We Are Coordination, Not Control

**Control** implies:
- Permission granting/denying
- Blocking execution
- Central authority
- Top-down governance

**Coordination** implies:
- Getting the right people together
- Enabling fast response
- Distributed decision-making
- Bottom-up information flow

**We reject "control" because**:
- Control becomes bottleneck
- Control implies we know better than humans
- Control is what approval systems do
- Control is the old paradigm

### 9.2 Why "Control" Is Wrong Word

**When people hear "agent control"**:
- They think: approval system
- They think: slow down agents
- They think: yet another gate

**When people hear "agent coordination"**:
- They think: helping humans
- They think: faster response
- They think: working together

**We actively correct**: "We're not controlling agents; we're coordinating humans."

---

# PART B-Q: [Previous technical content remains]

*[All technical chapters from v5.3 remain unchanged]*

---

# APPENDIX: Strategic Summary

## One-Pager

**What**: Mandate routes agent actions to the right humans in real-time so they can intervene before damage compounds.

**For whom**: Companies with 10+ autonomous agents in production.

**Problem**: Agents act in seconds, humans discover issues in minutes-to-hours. This gap causes compounding damage.

**Solution**: Pre-action routing (not approval) that notifies the right person immediately, with context and suggested actions.

**Category**: On-call coordination for agent-driven systems.

**Wedge**: "Your agent deployed. We told the right person in 30 seconds."

**Metric**: TTI (Time-to-Intervention) P50 <60 seconds.

**Differentiation**: 
- vs Datadog: We route to people, not just show traces
- vs Rubrik: We coordinate response, not just restore data
- vs approval systems: We don't block, we notify

**Why now**: Agents deploying to production now; coordination layer unclaimed; habits forming.

**Ask**: Design partners deploying 10+ agents who need faster incident response.

---

**Document Version**: 5.4 Complete
**Last Updated**: January 2026
**Status**: Ready for Pitch and Implementation
