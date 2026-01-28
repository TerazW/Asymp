# Mandate: Operational Coordination for the Agent Era

**Version 5.0 | January 2026**

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

## Part IV: Product Architecture

### 4.1 The Flow We Adopt

```
Execute → Broadcast → Visible → Intervene → Recover → Learn
```

**Default policy**: `monitored_execute` (not "ask human")

This is key: we bias toward execution, not blocking.

### 4.2 Five Closed-Loop Elements

| Element | Question it answers |
|---------|---------------------|
| **Action/Effect** | What happened? |
| **Ownership/Attribution** | Who did it? Who's affected? |
| **Intervention/Routing** | Can I intervene now? |
| **Containment/Recovery** | What to do if something already went wrong? |
| **Postmortem/Governance Evolution** | How to not be blind next time? |

### 4.3 The Core Metric: TTI (Time-to-Intervention)

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

### 4.4 Core Components

**Phase 1: Foundation (Months 1-3)**

| Component | Purpose |
|-----------|---------|
| Activity Stream | Every agent action logged, broadcast in real-time |
| Ownership Map | Who owns what system/file/table (from config, not inference) |
| Rule-Based Router | User-configurable routing, NO ML, 100% explainable |
| Recovery Path Catalog | Map action types to best possible recovery methods |

**Phase 2: Response (Months 4-6)**

| Component | Purpose |
|-----------|---------|
| Incident Response | Containment → Expert finder → Recovery path |
| Postmortem Generator | Auto-draft, human approves |
| Pattern Detection | Find repeat incidents, prevent recurrence |

### 4.5 Routing: Intervention Paths, Not Approval Levels

We don't use "approval" framing. We use **intervention path** framing:

| Path | Meaning | When to use |
|------|---------|-------------|
| `auto_execute` | Execute, minimal logging | Read-only, zero-impact operations |
| `monitored_execute` | Execute with full visibility, notify owners | Default for most actions |
| `flagged_execute` | Execute, but flag for review within N hours | Higher-risk but time-tolerant |
| `gated_execute` | Queue for human confirmation before execute | Irreversible high-stakes only |

**Key insight**: `gated_execute` is the exception, not the default. Most actions should flow through `monitored_execute`.

### 4.6 Recovery Paths (Not Rollback Features)

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

## Part V: Competitive Positioning

### 5.1 Market Landscape

| Company | DNA | What they do | What they don't do |
|---------|-----|--------------|-------------------|
| **Rubrik** | Enterprise backup | Data snapshot restore ("Agent Rewind") | No pre-action routing, no learning loop, no real-time notification |
| **Datadog** | Observability | Permission visibility ("AI Agents Console") | No execution governance, no action routing, no incident response |
| **Us** | Developer workflow coordination | Pre-action routing + real-time intervention + learning loop | We don't promise "perfect rollback" |

### 5.2 Fundamental Differences

| Dimension | Rubrik | Datadog | Us |
|-----------|--------|---------|-----|
| Pre-action routing | ❌ None | ❌ None | ✅ Rule-based router |
| Blast radius | Shows dependency graph | - | Proactively notifies affected owners |
| Recovery | Data snapshot restore only | ❌ None | Multi-strategy (git, DB, API, etc.) |
| Learning loop | ❌ None | ❌ None | ✅ Postmortem + pattern detection |
| Core metric | Recovery time | - | TTI (Time-to-Intervention) |

### 5.3 Execution Logic Comparison

**Rubrik**: action executes → incident → rewind data

**Us**: action comes in → routing decision → monitored execution → if incident: faster discovery → faster recovery → learn to prevent recurrence

Rubrik is a **fire extinguisher**.

We are **fire detection + fire extinguisher + fire prevention training**.

### 5.4 What They Don't Understand

> Rollback is not a technical capability — it's a social capability.

The core resource isn't storage. It's **who knows how to fix it** and **who's willing to**.

Almost all major incidents aren't about no one being able to fix it — it's about not knowing who to find, where to start.

We solve "who should know" in real-time, before it becomes an incident. They can't.

---

## Part VI: Market Validation

The market has validated that the problem exists:

- Rubrik raised funding for Agent Cloud (August 2025)
- Datadog announced AI Agents Console at DASH (June 2025)

This shows the market acknowledges the problem is real. We don't need to educate the market that "agent governance matters" — big companies are already doing this for us.

**But they're solving the wrong version of the problem.**

Data snapshots and permission dashboards don't help you find who to call when something breaks.

---

## Part VII: Go-to-Market

### 7.1 Phase 1: Design Partners (Months 1-6)

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

### 7.2 Phase 2: Paid Pilots (Months 7-12)

**Goal**: Validate business model

- Target: 10-20 companies
- Pricing: TBD based on Phase 1 learnings (estimate $50-100/agent/month)

**Success criteria**:
- 10+ paying customers
- < 30% churn after 3 months
- Clear pricing model validated

### 7.3 Pricing Model

Usage-based, likely priced per agent monitored and per action routed.

For comparison: Datadog charges ~$15-30 per host per month for infrastructure monitoring. Agent coordination touches production actions with real consequences, so $50-100 per agent per month seems plausible.

---

## Part VIII: Key Metrics

### 8.1 What We Measure

| Metric | Definition | Target |
|--------|------------|--------|
| **TTI** | Notification → Human action | P95 < 60s for critical |
| **Notification relevance** | % rated "relevant" by recipient | > 70% |
| **False negative rate** | % of incidents where owner wasn't notified | < 10% |
| **Ownership coverage** | % of actions where we found at least one owner | > 90% |
| **Recovery path coverage** | % of action types with documented recovery | > 80% |
| **Repeat incident rate** | Same root cause occurring twice | Decreasing over time |

### 8.2 What We Don't Measure (Yet)

- "Auto-approval rate" (misleading metric)
- "% safe" (safety isn't a number)
- "Recovery time guarantee" (depends on action type)

---

## Part IX: Risks and Mitigations

### 9.1 Risk: Integration is Too Hard

**Signals**: Partners take > 2 weeks to integrate

**Mitigation**: Start with MCP, build adapters for popular frameworks

**Kill switch**: If > 50% can't integrate in 1 week, pivot approach

### 9.2 Risk: Not Enough Incident Data

**Signals**: < 10 incidents across all partners in 3 months

**Mitigation**: Partner with companies deploying riskier agents, learn from near-misses

**Kill switch**: If no data after 6 months, pivot to pure visibility play

### 9.3 Risk: No One Will Pay

**Signals**: Partners love it but won't pay

**Mitigation**: Find value metric tied to revenue/cost savings

**Kill switch**: If can't get 10 paying customers by Month 12, open source and pivot

---

## Part X: What We're NOT Building

- ❌ AI risk prediction (no training data yet)
- ❌ Cross-company learning (legal/privacy nightmare)
- ❌ Compliance certification (maybe after Series A)
- ❌ "Perfect rollback" (doesn't exist)
- ❌ Central approval authority (that's the old model)

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

**Document Version**: 5.0
**Last Updated**: January 2026
**Philosophy**: Humans coordinating at agent speed
**Status**: Ready for Design Partner Conversations
