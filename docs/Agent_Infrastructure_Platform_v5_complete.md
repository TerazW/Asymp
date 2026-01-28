# Mandate: Operational Coordination for the Agent Era

**Version 5.0 Complete | January 2026**

---

## Part I: Design Philosophy

### 1.1 What We Believe

**Core belief**: The question is not "can the system prevent mistakes" — it's "can humans intervene in time."

We reject the fantasy that a sufficiently complex, sufficiently smart system can prevent most errors before they happen. This is the biggest illusion in agent governance.

**What actually matters in production**:
- Immediately knowing what happened
- Accurately knowing who/which action caused it
- Being able to stop the bleeding immediately
- Recovering via the fastest possible path
- Learning so the same mistake doesn't happen twice

This is closer to real production incidents than any safety model.

### 1.2 Why Pre-Execution Approval is Wrong

Centralized pre-execution interception is fundamentally a decelerator:

1. **Authorization becomes a bottleneck**: If every agent action requires human approval, you've already lost. Even if it claims to accelerate, as long as the core logic is "ask human before execute," it can never be an accelerator.

2. **Blocking ≠ safety**: Real control shouldn't be a defense system — it should be an accelerator.

3. **No execution = no data = no improvement**: You can't learn from what never happened.

4. **The most dangerous errors cannot be identified beforehand**: Pre-execution approval can only block things that obviously shouldn't be done.

5. **Approval is just one form of intervention**: It's not about removing all approvals, but providing intervention capabilities tiered by action type.

**Conclusion**: We should abandon the illusion that systems can replace human judgment, and build a system that lets human judgment keep up with agent speed.

### 1.3 Redefining Governance

Governance should be decentralized:

- Governance shouldn't be a judge that decides approval or rejection — it should be embedded at every intervention point
- Governance is no longer about *whether* to do something, but *how I can intervene after it's done*
- Governance isn't about blocking actions — it's about shortening human intervention response time
- Control shouldn't be centralized. Control should be the system providing intervention capabilities at every intervention point

**This isn't a control plane — it's a real-time coordination network.**

### 1.4 On Recovery and Rollback

**Fast recovery as an outcome is correct. Building fast recovery as a feature is wrong.**

Especially building fast recovery as "perfect rollback."

- **Rollback is always temporary**
- **Many actions are irreversible**: Not because they absolutely cannot be undone, but because of undo costs, permissions, extremely short windows, and unverifiability
- **Recovery speed cannot be guaranteed** — it depends on action type. We can only guarantee providing the fastest possible recovery path for each action type
- **Reversibility and rollback shouldn't be the main narrative** — they're just one possibility within recovery paths

**What "fast" really means**:
- Not fast rollback recovery
- Fast awareness of errors
- Fast intervention
- Not fewer mistakes — intervenable speed

**The essence of rollback**:

> Rollback is not a technical capability — it's a social capability.

- Rollback is not checkpoint
- Rollback's core resource is not storage — it's *who knows how to fix it* + *who is willing to fix it*
- Almost all real major incidents aren't about no one being able to fix it — it's about not knowing who to find, where to start

---

## Part II: What We Are (and Are Not)

### 2.1 What We Are NOT

- ❌ Not an approval system
- ❌ Not an AI safety firewall
- ❌ Not a rollback engine
- ❌ Not a centralized agent controller
- ❌ Not another version of "agent control plane"

### 2.2 What We ARE

**A definition of how organizations operate in the agent era.**

We're not selling capability — we're selling whether humans can intervene in time.

**Target users**: Companies deploying 10+ autonomous agents who need velocity but can't accept chaos.

### 2.3 External Messaging

**Say this**:
- ✅ "We help humans coordinate at agent speed"
- ✅ "Datadog tells you what happened. Rubrik lets you undo it. We help you prevent it, recover faster, and make sure it never happens again."

**Don't say this**:
- ❌ "We do LLM observability" (collides with Datadog/Arize/Traceloop)
- ❌ "We rewind agent mistakes" (collides with Rubrik)
- ❌ "visibility + recovery" (sounds like poor man's Rubrik)

---

## Part III: The Real Pain Points

### 3.1 Three Major Pain Points

1. **Don't know who did it**
2. **Don't know why the same mistake happened again**
3. **Don't know what state the system is currently in**

### 3.2 The Real Risk

Not too much destruction, but **invisible destruction**.

Destruction happened, but no one saw it.

### 3.3 Real Needs

| Need | What it means |
|------|---------------|
| Visibility | Make all changes visible |
| Attribution | Every change can be tracked, every impact attributed to a person or agent |
| Fast localization | Know immediately who to find when something goes wrong |
| Synchronized communication | The right people know at the right time |
| Learning | Prevent the same mistake from happening twice |

---

## Part IV: Core Object Model

### 4.1 The Six Core Objects

Our system is built around six core objects. Everything else derives from these.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORE OBJECTS                             │
├─────────────────────────────────────────────────────────────────┤
│  Actor ──executes──▶ Action ──affects──▶ Resource               │
│                         │                    │                  │
│                         ▼                    ▼                  │
│                   Notification ◀────── Ownership                │
│                         │                                       │
│                         ▼                                       │
│                     Incident ──produces──▶ Learning             │
└─────────────────────────────────────────────────────────────────┘
```

**Object 1: Actor**
- Who/what is doing the action
- Types: `agent` | `human` | `system`
- Has identity, belongs to team, has on-call schedule

**Object 2: Action**
- A discrete operation that changes state
- Has: type, scope, timestamp, reversibility
- Every action gets a routing decision

**Object 3: Resource**
- What gets affected by actions
- Types: service, file, database table, API endpoint, config
- Every resource has ownership

**Object 4: Ownership**
- The link between resources and people/teams
- Sources: CODEOWNERS, service catalog, PagerDuty, manual config
- Can be individual or team-based

**Object 5: Notification**
- A signal sent to owners when their resources are affected
- Has: urgency level, channel, TTI measurement

**Object 6: Incident**
- Something bad that happened
- Links back to causing actions
- Produces learning artifacts (postmortem, pattern)

### 4.2 Object Relationships

**Action → Resource (Blast Radius)**:
- An action affects one or more resources
- "Blast radius" = the set of resources an action touches
- Determined by: action scope declaration + static analysis + runtime inference

**Resource → Ownership (Who Should Know)**:
- Every resource should have at least one owner
- Ownership is layered: primary owner, team, escalation path
- "Who should know" = owners of all affected resources

**Action → Notification (Routing)**:
- Routing rules determine: who gets notified, how urgently, through what channel
- Routing output is always a notification (not an approval request)

**Notification → Incident (When Things Go Wrong)**:
- If an action causes problems, it becomes an incident
- Incident links back to the actions that caused it (attribution)

**Incident → Learning (Closing the Loop)**:
- Every incident produces a postmortem draft
- Patterns are extracted and stored for future detection

---

## Part V: Product Architecture

### 5.1 The Flow We Adopt

```
Execute → Broadcast → Visible → Intervene → Recover → Learn
```

**Default policy**: `monitored_execute` (not "ask human")

This is key: we bias toward execution, not blocking.

### 5.2 Five Closed-Loop Elements

| Element | Question it answers |
|---------|---------------------|
| **Action/Effect** | What happened? |
| **Ownership/Attribution** | Who did it? Who's affected? |
| **Intervention/Routing** | Can I intervene now? |
| **Containment/Recovery** | What to do if something already went wrong? |
| **Postmortem/Governance Evolution** | How to not be blind next time? |

### 5.3 The Core Metric: TTI (Time-to-Intervention)

**TTI = Time from notification to human action**

This is what separates us from "just another dashboard."

| Action Type | TTI Target |
|-------------|------------|
| Pause agent | P95 < 10s |
| Ask question | P95 < 30s |
| Trigger recovery | P95 < 60s |
| Assign owner | P95 < 2min |

**Why TTI matters**:
- Notification without action = spam
- Coordination only works if people can intervene in seconds
- This is the metric for "humans keeping up with agent speed"

### 5.4 Minimum Viable Product (MVP)

**What users see in the first 10 minutes**:

1. **Connect agent source** (2 min): Point us at your agent's MCP endpoint or install our SDK
2. **See first actions appear** (30 sec): Live activity stream shows actions flowing through
3. **Auto-detected ownership** (1 min): We pull from CODEOWNERS, PagerDuty, and show you what we found
4. **First notification** (1 min): You see a Slack message when an action touches your system
5. **Intervention buttons** (instant): In Slack, you can pause, flag, or ask questions right there

**MVP pages/outputs**:

| Page | Purpose |
|------|---------|
| **Activity Stream** | Real-time feed of all actions, filterable by actor/resource/team |
| **System Status** | Current state: what's running, what's paused, any active incidents |
| **Ownership Map** | Visual of who owns what, with coverage gaps highlighted |
| **Routing Rules** | Configure what triggers what notification level |
| **Incident Timeline** | When something breaks: what happened, in what order |

**MVP is event-stream first, UI second.** The core value is notifications arriving in Slack/Teams. The UI is for configuration and investigation.

### 5.5 Routing: Intervention Paths, Not Approval Levels

We don't use "approval" framing. We use **intervention path** framing:

| Path | Meaning | When to use |
|------|---------|-------------|
| `auto_execute` | Execute, minimal logging | Read-only, zero-impact operations |
| `monitored_execute` | Execute with full visibility, notify owners | Default for most actions |
| `flagged_execute` | Execute, but flag for review within N hours | Higher-risk but time-tolerant |
| `gated_execute` | Queue for human confirmation before execute | Irreversible high-stakes only |

**Key insight**: `gated_execute` is the exception, not the default. Most actions should flow through `monitored_execute`.

**Routing is based on**:

| Signal | Source | Weight |
|--------|--------|--------|
| Action type | Declared by agent/SDK | Primary |
| Resource sensitivity | From ownership config | Primary |
| Historical patterns | Past incidents on this resource | Secondary |
| Time of day | Is it during business hours? | Modifier |
| Actor track record | Has this agent caused issues before? | Modifier |

**Routing output**: Always a notification target, not a single person. The notification target can be:
- A specific person (primary owner)
- A team channel (if team-owned resource)
- An escalation chain (if critical)
- A playbook trigger (if automated response exists)

### 5.6 Recovery Paths (Not Rollback Features)

We don't promise "rollback." We provide **fastest possible recovery path** for each action type:

| Action Type | Recovery Path | Limitations |
|-------------|---------------|-------------|
| Code change | git revert | Conflicts may need manual resolution |
| DB write (in transaction) | Transaction rollback | Only within transaction window |
| Payment charge | Refund API | 90-day window, fees may not refund |
| Email sent | Correction email | Cannot unsend original |
| S3 delete | Restore from versioning | Only if versioning was enabled |
| Production deploy | Traffic rollback | DB migrations may be irreversible |

**We are honest about limitations.** Some things are irreversible. We don't pretend otherwise.

---

## Part VI: Ownership Model

### 6.1 How We Determine "Who Should Know"

**The problem**: "Affected owners" is vague. We need to make it deterministic.

**Our approach**: Layered ownership with explicit fallbacks.

```
┌─────────────────────────────────────────────────────────────────┐
│                     OWNERSHIP RESOLUTION                        │
├─────────────────────────────────────────────────────────────────┤
│  1. Check explicit config     → "payment-service: @alice"       │
│           ↓ (if none)                                           │
│  2. Check CODEOWNERS          → "src/payments/*: @payments-team"│
│           ↓ (if none)                                           │
│  3. Check service catalog     → "payment-service: payments-team"│
│           ↓ (if none)                                           │
│  4. Check PagerDuty/Opsgenie  → "payments-team on-call: @bob"   │
│           ↓ (if none)                                           │
│  5. Check recent contributors → "last 30d commits: @carol"      │
│           ↓ (if none)                                           │
│  6. Flag as "no owner"        → route to fallback/admin         │
└─────────────────────────────────────────────────────────────────┘
```

**Ownership sources we integrate with**:
- GitHub/GitLab CODEOWNERS
- Service catalog (Backstage, internal tools)
- PagerDuty/Opsgenie on-call schedules
- Manual configuration in our system
- Git commit history (fallback signal)

### 6.2 Handling Edge Cases

**No owner found**:
- Action is flagged as "unowned"
- Routed to configured fallback (e.g., platform team, admin)
- Highlighted in Ownership Map as coverage gap
- Weekly digest shows all unowned actions

**Owner doesn't respond**:
- Escalation chain triggers after configurable timeout (default: 5 min for critical)
- Escalation order: primary → secondary → team lead → on-call → admin
- All escalations logged for postmortem
- "No response" is itself a metric we track

**Multiple owners conflict**:
- All owners are notified (not OR, but AND)
- Any owner can take action (first responder wins)
- If actions conflict, latest wins + all parties notified
- Post-incident review reconciles if needed

**Cross-service/cross-team incident**:
- All affected service owners notified
- Incident marked as "multi-team"
- Auto-create shared channel/thread for coordination
- Each team sees their portion of blast radius

### 6.3 Handling Organizational Changes

**Person changes team**:
- Ownership transfers with team membership (from HR/directory integration)
- Grace period: old owner still notified for 7 days
- Explicit handoff prompt in UI

**Service changes owner**:
- Service catalog is source of truth
- We sync daily (or webhook on change)
- History preserved: "ownership changed from A to B on date"

**Services merge/split**:
- Explicit migration flow in UI
- "Merge: service A + B → C" transfers all ownership rules
- "Split: service A → B + C" prompts for ownership assignment
- Historical incidents stay linked to original service

---

## Part VII: Notification and Intervention System

### 7.1 Notification Channels

| Channel | Use case | Latency |
|---------|----------|---------|
| Slack/Teams | Primary real-time notification | < 2s |
| PagerDuty/Opsgenie | Critical escalation | < 5s |
| Email | Digest, non-urgent summaries | < 30s |
| In-app | Dashboard alerts | Real-time |
| Webhook | Custom integrations | < 1s |

### 7.2 Slack/Teams Message Structure

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

**Intervention buttons in Slack**:
- **Pause Agent**: Immediately stops the agent from taking further actions
- **Flag for Review**: Marks for async review, doesn't stop execution
- **Rollback**: Triggers recovery path if available
- **Acknowledge**: Marks as "seen, no action needed"

### 7.3 PagerDuty/Opsgenie Integration

**We trigger PagerDuty when**:
- Action is `gated_execute` and no response within timeout
- Incident is created with severity >= high
- Escalation chain exhausts Slack without response

**Event payload**:
```
{
  "routing_key": "...",
  "event_action": "trigger",
  "payload": {
    "summary": "Agent 'deployer' caused production incident",
    "severity": "critical",
    "source": "mandate",
    "custom_details": {
      "action_id": "...",
      "affected_services": ["payments-service"],
      "suggested_recovery": "rollback to v2.3.0"
    }
  }
}
```

### 7.4 What Triggers Intervention?

| Trigger | Action | Configurable? |
|---------|--------|---------------|
| Action on critical resource | Notify owner immediately | Yes (resource sensitivity) |
| Action by new/untrusted agent | Notify + flag for review | Yes (agent trust level) |
| Action outside business hours | Higher notification urgency | Yes (time rules) |
| Pattern matches past incident | Notify + warn | Yes (pattern rules) |
| Owner explicitly watching | Notify on any action | Yes (watch rules) |
| Multiple rapid actions | Rate limit + notify | Yes (rate rules) |

### 7.5 Automatic Actions

**What we auto-execute** (with explicit opt-in):
- Auto-pause agent after N failed actions
- Auto-escalate after timeout
- Auto-create incident channel for multi-team issues
- Auto-generate postmortem draft after incident

**What we never auto-execute**:
- Rollback production changes (always human-triggered)
- Delete anything
- Modify agent code or config
- Override explicit human decisions

**Why**: Auto-recovery that goes wrong is worse than no auto-recovery. Humans trigger recovery; we provide the fastest path.

---

## Part VIII: Learning Loop

### 8.1 What "Learning Loop" Means

The learning loop produces three artifacts:

1. **Postmortem document** (per incident)
2. **Pattern record** (extracted from multiple incidents)
3. **Rule update suggestions** (routing/ownership improvements)

### 8.2 Postmortem Automation

**Auto-generated sections**:
| Section | Source | Automation level |
|---------|--------|------------------|
| Timeline | Activity stream | 100% auto |
| Affected systems | Blast radius analysis | 100% auto |
| Who was involved | Notification/response logs | 100% auto |
| Root cause | Action attribution | 80% auto (human verifies) |
| Impact | Metrics + user reports | 70% auto |
| What we'll change | Pattern analysis | Suggested (human approves) |

**What we don't automate**:
- "Why did this happen" (requires human judgment)
- "What should we do differently" (requires human decision)
- Publishing/sharing (always human-triggered)

**Postmortem output format**:
- Markdown by default
- Exportable to Confluence, Notion, Google Docs
- Linked from incident in our system

### 8.3 Making Postmortems Actually Used

**Problem**: Postmortems rot in Confluence.

**Our approach**:

1. **Postmortem → Action items**: Every postmortem must have at least one action item with owner and due date
2. **Action item tracking**: We track completion status, nag if overdue
3. **Pattern linking**: If same pattern triggers again, we surface "you said you'd fix this"
4. **Metrics**: We show "incidents from unaddressed postmortem items"

### 8.4 Pattern Detection

**How we define "repeat incident"**:

A pattern is a tuple of: `(action_type, resource_pattern, failure_mode)`

Examples:
- `(deploy, payments-*, timeout)` → "Payment deploys that timeout"
- `(db_write, users.*, constraint_violation)` → "User DB writes that fail constraints"

**How we detect patterns**:

| Method | When used | Accuracy |
|--------|-----------|----------|
| Exact match | Same action type + same resource | High |
| Resource pattern | Same action type + similar resource (e.g., `payments-*`) | Medium |
| Failure mode | Same error signature regardless of source | Medium |
| Embedding similarity | Similar incident descriptions | Low (experimental) |

**Pattern clustering**:
- Phase 1 (MVP): Rule-based exact + pattern matching
- Phase 2: Tag-based clustering (human-assigned tags)
- Phase 3 (if needed): Embedding-based similarity

**When pattern matches**:
- Notification includes: "This looks similar to incident #123"
- Link to previous postmortem
- Show whether action items were completed
- Escalate if action items weren't addressed

### 8.5 False Positive / False Negative Handling

**False positives** (notified but wasn't actually relevant):
- User can mark notification as "not relevant"
- We track FP rate per rule
- Rules with >30% FP rate are flagged for review
- Auto-suggest rule refinements

**False negatives** (should have notified but didn't):
- During incident review, user can mark "should have been notified"
- We analyze: why didn't routing catch this?
- Auto-suggest new rules or ownership updates

**Feedback loop**:
- Every notification has thumbs up/down
- Weekly digest shows FP/FN rates
- Routing rules evolve based on feedback

---

## Part IX: Integrations

### 9.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYERS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Agent     │  │   Human     │  │   System    │  SOURCES    │
│  │   Actions   │  │   Actions   │  │   Events    │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              Unified Event Stream                    │       │
│  └─────────────────────────────────────────────────────┘       │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              Routing + Notification                  │       │
│  └─────────────────────────────────────────────────────┘       │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Slack/    │  │  PagerDuty  │  │   Webhook   │  OUTPUTS    │
│  │   Teams     │  │  /Opsgenie  │  │   /API      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Agent Tool Calls

**MCP (Model Context Protocol)**:
- Native integration via MCP interceptor
- Every tool call logged with full context
- Zero-config for MCP-compliant agents

**SDK for non-MCP agents**:
```python
# Wrap your agent's tool calls
from mandate import track

@track
def call_api(endpoint, payload):
    return requests.post(endpoint, json=payload)
```

**What we capture**:
- Tool name, parameters, result
- Timestamp, duration
- Agent identity, session context
- Declared scope (what resources it affects)

### 9.3 Human Actions

**How we track human actions**:
- GitHub/GitLab: webhook on push, PR, merge
- CI/CD: webhook on deploy, rollback
- Cloud console: audit log integration
- Our UI: all actions logged

**Why track humans too**:
- Attribution requires knowing ALL changes
- Humans bypass agents sometimes
- Same notification system applies

### 9.4 GitHub/GitLab Integration

**Signals we use**:
| Signal | Use |
|--------|-----|
| CODEOWNERS | Ownership mapping |
| Push events | Code change actions |
| PR events | Review flow awareness |
| Commit history | Recent contributor fallback |
| Branch protection | Understanding governance context |

**What we output**:
- PR comments when agent changes trigger review
- Status checks (optional, for gated flows)

### 9.5 CI/CD Integration

**Signals we use**:
| Signal | Use |
|--------|-----|
| Deploy events | Production change awareness |
| Rollback events | Recovery tracking |
| Test failures | Incident correlation |
| Environment promotions | Blast radius context |

**Integration methods**:
- Webhook from CI/CD (GitHub Actions, CircleCI, Jenkins)
- SDK wrapper for deploy scripts
- Cloud provider deploy notifications

### 9.6 Cloud Provider Audit Logs

**What we ingest**:
- AWS CloudTrail
- GCP Cloud Audit Logs
- Azure Activity Log

**What we correlate**:
- Agent action → cloud API call → actual resource change
- Helps attribute "who really changed what"

### 9.7 Handling Bypasses

**Human bypasses agent workflow**:
- We still see it (via GitHub webhook, cloud audit log)
- Action is marked as "direct human action"
- Same routing rules apply
- Can configure: "alert when human bypasses"

**Agent bypasses our SDK**:
- If agent calls system API directly, we may not see it
- Mitigation: cloud audit log catches it
- We correlate: "change happened but no agent action logged"
- Flag as "unattributed change" for investigation

---

## Part X: System Status and Reliability

### 10.1 "What State Is The System In?"

**System Status page shows**:

| Section | Content |
|---------|---------|
| **Active Agents** | List of running agents, their current activity, pause status |
| **Recent Actions** | Last N actions with outcomes |
| **Open Incidents** | Any unresolved incidents |
| **Ownership Coverage** | % of resources with owners, gaps highlighted |
| **Health Metrics** | Notification latency, routing accuracy, response rates |

**Quick status summary**:
```
✅ All systems nominal
   12 agents active | 0 paused
   47 actions in last hour | 0 incidents
   98% ownership coverage | 2 gaps
```

Or:
```
⚠️ Active incident
   Incident #234: payments-service degraded
   3 agents paused | 2 teams notified
   Started 12 min ago | @alice responding
```

### 10.2 Low-Noise, High-Reliability Design

**How we stay low-noise**:
- Relevance scoring: only notify if confidence > threshold
- Aggregation: batch related notifications within time window
- Snooze: users can snooze low-priority notifications
- Learning: reduce notifications for resources with high "OK" rate

**How we stay high-reliability**:
- Redundant notification paths (Slack fails → PagerDuty)
- Notification delivery confirmation
- "Mandate is down" alert to admin

### 10.3 P0 Moment Reliability

**When everything is on fire, we must work.**

**Degradation modes**:

| Scenario | Behavior |
|----------|----------|
| Our notification service is slow | Queue + retry, alert admin |
| Slack is down | Fallback to PagerDuty + email |
| Our whole system is down | Webhook to backup endpoint, email to admin list |
| Database is slow | Cache ownership map, eventual consistency on actions |

**What we guarantee in P0**:
- Notifications still go out (via any available channel)
- Pause commands still work (cached locally at agent)
- Status page shows "degraded" state

### 10.4 Cross-Timezone On-Call

**How we handle follow-the-sun**:
- On-call schedules from PagerDuty/Opsgenie
- Time-aware routing: prefer on-call in current timezone
- Handoff awareness: notify incoming on-call of active incidents
- "Sun never sets" mode: always find someone awake

**Escalation respects timezone**:
1. Current on-call (should be awake)
2. Secondary on-call (same timezone)
3. Team lead (any timezone)
4. Global escalation (wake someone up)

---

## Part XI: Competitive Positioning

### 11.1 Market Landscape

| Company | DNA | What they do | What they don't do |
|---------|-----|--------------|-------------------|
| **Rubrik** | Enterprise backup | Data snapshot restore ("Agent Rewind") | No pre-action routing, no learning loop, no real-time notification |
| **Datadog** | Observability | Permission visibility ("AI Agents Console") | No execution governance, no action routing, no incident response |
| **Us** | Developer workflow coordination | Pre-action routing + real-time intervention + learning loop | We don't promise "perfect rollback" |

### 11.2 Fundamental Differences

| Dimension | Rubrik | Datadog | Us |
|-----------|--------|---------|-----|
| Pre-action routing | ❌ None | ❌ None | ✅ Rule-based router |
| Blast radius | Shows dependency graph | - | Proactively notifies affected owners |
| Recovery | Data snapshot restore only | ❌ None | Multi-strategy (git, DB, API, etc.) |
| Learning loop | ❌ None | ❌ None | ✅ Postmortem + pattern detection |
| Core metric | Recovery time | - | TTI (Time-to-Intervention) |

### 11.3 Execution Logic Comparison

**Rubrik**: action executes → incident → rewind data

**Us**: action comes in → routing decision → monitored execution → if incident: faster discovery → faster recovery → learn to prevent recurrence

Rubrik is a **fire extinguisher**.

We are **fire detection + fire extinguisher + fire prevention training**.

### 11.4 What They Don't Understand

> Rollback is not a technical capability — it's a social capability.

The core resource isn't storage. It's **who knows how to fix it** and **who's willing to**.

Almost all major incidents aren't about no one being able to fix it — it's about not knowing who to find, where to start.

We solve "who should know" in real-time, before it becomes an incident. They can't.

---

## Part XII: Market Validation

The market has validated that the problem exists:

- Rubrik raised funding for Agent Cloud (August 2025)
- Datadog announced AI Agents Console at DASH (June 2025)

This shows the market acknowledges the problem is real. We don't need to educate the market that "agent governance matters" — big companies are already doing this for us.

**But they're solving the wrong version of the problem.**

Data snapshots and permission dashboards don't help you find who to call when something breaks.

---

## Part XIII: Go-to-Market

### 13.1 Phase 1: Design Partners (Months 1-6)

**Goal**: Validate core hypotheses

- Target: 3-5 companies deploying 10+ agents
- Compensation: Free or cost-recovery only
- Commitment: Weekly check-ins, feedback

**Deliverables**:
- Activity stream with real-time notifications
- Ownership mapping
- Rule-based routing
- Basic recovery path catalog

**Success criteria**:
- All partners integrated
- TTI measured and improving
- At least 3 partners say "we'd pay for this"

### 13.2 Phase 2: Paid Pilots (Months 7-12)

**Goal**: Validate business model

- Target: 10-20 companies
- Pricing: TBD based on Phase 1 learnings (estimate $50-100/agent/month)

**Success criteria**:
- 10+ paying customers
- < 30% churn after 3 months
- Clear pricing model validated

### 13.3 Pricing Model

Usage-based, likely priced per agent monitored and per action routed.

For comparison: Datadog charges ~$15-30 per host per month for infrastructure monitoring. Agent coordination touches production actions with real consequences, so $50-100 per agent per month seems plausible.

---

## Part XIV: Key Metrics

### 14.1 What We Measure

| Metric | Definition | Target |
|--------|------------|--------|
| **TTI** | Notification → Human action | P95 < 60s for critical |
| **Notification relevance** | % rated "relevant" by recipient | > 70% |
| **False negative rate** | % of incidents where owner wasn't notified | < 10% |
| **Ownership coverage** | % of actions where we found at least one owner | > 90% |
| **Recovery path coverage** | % of action types with documented recovery | > 80% |
| **Repeat incident rate** | Same root cause occurring twice | Decreasing over time |
| **Escalation rate** | % of notifications requiring escalation | < 20% |
| **Response rate** | % of notifications that get human response | > 80% |

### 14.2 What We Don't Measure (Yet)

- "Auto-approval rate" (misleading metric)
- "% safe" (safety isn't a number)
- "Recovery time guarantee" (depends on action type)

---

## Part XV: Risks and Mitigations

### 15.1 Risk: Integration is Too Hard

**Signals**: Partners take > 2 weeks to integrate

**Mitigation**: Start with MCP, build adapters for popular frameworks

**Kill switch**: If > 50% can't integrate in 1 week, pivot approach

### 15.2 Risk: Not Enough Incident Data

**Signals**: < 10 incidents across all partners in 3 months

**Mitigation**: Partner with companies deploying riskier agents, learn from near-misses

**Kill switch**: If no data after 6 months, pivot to pure visibility play

### 15.3 Risk: No One Will Pay

**Signals**: Partners love it but won't pay

**Mitigation**: Find value metric tied to revenue/cost savings

**Kill switch**: If can't get 10 paying customers by Month 12, open source and pivot

### 15.4 Risk: Notification Fatigue

**Signals**: Response rate drops below 50%

**Mitigation**: Aggressive FP reduction, smarter aggregation, user controls

**Kill switch**: If we become "just another alert," we've failed

---

## Part XVI: What We're NOT Building

- ❌ AI risk prediction (no training data yet)
- ❌ Cross-company learning (legal/privacy nightmare)
- ❌ Compliance certification (maybe after Series A)
- ❌ "Perfect rollback" (doesn't exist)
- ❌ Central approval authority (that's the old model)
- ❌ Agent code generation (out of scope)
- ❌ LLM observability/tracing (Datadog's territory)

---

## Conclusion: Our Commitment

**We commit to**:
- Making every agent action visible
- Notifying the right people in real-time
- Providing the fastest possible recovery path for each action type
- Learning from incidents to prevent repeats
- Measuring TTI as our north star metric

**We don't commit to**:
- Preventing all mistakes (impossible)
- Perfect rollback (doesn't exist)
- Specific incident reduction numbers (need to measure first)

**Our starting point**: How can humans keep up with agent speed?

**Our answer**: Not by blocking agents. By making human intervention fast enough.

---

**Document Version**: 5.0 Complete
**Last Updated**: January 2026
**Philosophy**: Humans coordinating at agent speed
**Status**: Ready for Design Partner Conversations
