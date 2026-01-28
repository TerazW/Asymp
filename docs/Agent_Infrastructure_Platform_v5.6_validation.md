# Mandate: Operational Coordination for the Agent Era

**Version 5.6 Edge Cases, Market Validation & Evolution | January 2026**

---

# PART A: SYSTEM LIMITS AND EDGE CASES

## Chapter 1: Scale Limits

### 1.1 If Agents Execute 10x Faster

**Current design**: Handles 1,000 events/second sustained.

**At 10x agent speed (10,000 events/second)**:

| Component | Current | At 10x | Solution |
|-----------|---------|--------|----------|
| Event ingestion | ✅ OK | ⚠️ Needs Kafka | Add Kafka buffer |
| Routing decisions | ✅ OK | ✅ OK | Rules are fast |
| Notifications | ⚠️ Bottleneck | ❌ Overwhelmed | Aggressive aggregation |
| Human response | ⚠️ Bottleneck | ❌ Can't keep up | **This is the real limit** |

**The truth**: Our system can scale technically. **Humans can't.**

At 10x agent speed:
- We shift to "exception-only" routing
- More actions go to `auto_execute`
- Humans only see anomalies
- This is the intended evolution

### 1.2 If Team Size Doubles

**Value scaling**:

| Team size | Coordination complexity | Our value |
|-----------|------------------------|-----------|
| 5 people | Low (everyone knows everyone) | Low |
| 20 people | Medium | Medium |
| 50 people | High (who owns what?) | **High** |
| 100+ people | Very high | **Very high** |

**Our value scales super-linearly with team size** because:
- Coordination overhead is O(n²) in team size
- "Who should I call?" gets harder with more people
- We flatten that to O(1) lookup

### 1.3 Team Culture Variations

**No documentation culture**:
```
Impact: HIGHER value
Why: They don't write runbooks, so they need real-time routing more
Risk: Harder initial setup (no existing ownership data)
Approach: Start with git history, build ownership from usage
```

**Heavy ITIL culture**:
```
Impact: Harder to sell, but still valuable
Why: They already have process, we're "another system"
Risk: Seen as redundant to ServiceNow
Approach: Position as "real-time layer on top of ITIL"
         "Your ITIL process defines what should happen; 
          we make sure it happens fast"
```

---

## Chapter 2: Customer Constraints

### 2.1 "Only Observation, No Routing"

**Can we sell?** Yes, with reduced value.

**Observation-only product**:
- Activity stream (what's happening)
- Attribution (who did it)
- Timeline (incident view)
- NO automated notifications
- NO routing decisions

**Value prop**: "Know what happened, even without automation"

**Pricing**: Lower tier, ~40% of full price

**Upsell path**: "Once you trust the data, turn on routing"

### 2.2 "We Want Strong Approval"

**How to refuse and still close**:

```
Customer: "We need approval before any agent action"

Response: "I understand the desire for control. Let me share 
what we've learned: approval systems become bottlenecks. 
Here's what actually works:

Option 1: Gated routing for truly critical actions only
- We can gate the 5% that are truly irreversible
- 95% flows with monitoring
- You get control where it matters without bottleneck

Option 2: Post-hoc audit with fast intervention
- Everything executes, everything visible
- You can intervene within seconds
- Safer than approval (no tired human rubber-stamping)

Which resonates more with your real concern?"
```

**If they insist on full approval**: We're not the right product. Refer to approval-focused tools.

### 2.3 "We Don't Have Many Incidents"

**Sales response**:

```
"That's great! Let's unpack why:

1. Are incidents low because you're careful, or because 
   you're not deploying agents aggressively?

2. When you DO have an incident, how long does it take 
   to figure out what happened?

3. How much time do you spend preventing incidents that 
   could be spent shipping?

We help teams who want to move faster without more incidents.
If you're happy with current velocity, maybe we're not needed yet.
But if you want to 3x agent deployment without 3x incidents..."
```

### 2.4 "We Have Many Incidents But Don't Want to Record"

**Understand why**:

```
If fear of blame:
→ "Our system is designed for blameless culture. 
   We can anonymize individual attribution."

If political:
→ "We can scope to specific systems, not org-wide"

If regulatory fear:
→ "Recording protects you. When auditors ask 
   'what happened?', you'll have answers."

If denial:
→ This is not our customer. Walk away.
```

### 2.5 "We Already Have SRE"

**Sales response**:

```
"SREs are the ones who need us most! 

Your SREs spend time on:
- Figuring out who to call (we automate)
- Chasing down 'what changed?' (we show instantly)
- Running war rooms (we pre-create)
- Writing postmortems (we draft)

We don't replace SREs. We give them superpowers.
Would your SREs like to spend less time on coordination 
and more time on prevention?"
```

### 2.6 "We Don't Trust AI"

**Sales response**:

```
"Good news: we're not AI.

We don't use ML for routing or decisions.
We use explicit rules you configure.
Every routing decision is explainable and auditable.

Think of us like PagerDuty, not like ChatGPT.
We route notifications to humans, not AI."
```

### 2.7 "We Fully Trust AI"

**Risk**: They want to automate everything, including response.

**Our guidance**:

```
"We support automation, with guardrails:

1. Auto-escalation: ✅ Safe
2. Auto-pause on failures: ✅ Safe (stops damage)
3. Auto-rollback: ⚠️ Careful (can make things worse)
4. Auto-remediation: ❌ Not recommended without human review

We can help you find the right automation level.
What specific responses are you thinking of automating?"
```

---

## Chapter 3: Integration Constraints

### 3.1 "Agent is Black Box (Vendor-Provided)"

**What we can do**:
- Integrate at infrastructure level (cloud audit logs)
- Correlate agent activity with system changes
- Attribution: "Something from Agent X's IP at this time"

**What we can't do**:
- Tool-call level attribution
- Intent understanding
- Precise action mapping

**Approach**:
```
Vendor agent (black box)
       │
       ▼
Cloud audit log (AWS CloudTrail)
       │
       ▼
We correlate: "Change to DB at T came from Agent X"
```

### 3.2 "No Tool-Call Logs"

**Fallback strategy**:

| Available signal | What we can do |
|------------------|----------------|
| Cloud audit logs only | Infra-level attribution |
| Git commits only | Code change attribution |
| Metrics only | Anomaly correlation (weak) |
| Nothing | We can't help (yet) |

**Minimum requirement**: At least one change signal (audit log, git, or API logs)

### 3.3 "Only Metrics, No Logs"

**Limited value**:
- Can correlate metric anomalies with known events
- Can't attribute to specific actions
- Can suggest "something happened at T"

**Positioning**: "We need at least change logs. Metrics tell you something's wrong, not what caused it."

### 3.4 "Only Logs, No Trace"

**Good enough for MVP**:
- Logs often contain action information
- We parse and structure
- Attribution from log content

### 3.5 "Only Chat Records"

**If agent operates via chat** (e.g., Slack bot):
- Chat history = action log
- We can parse commands and responses
- Attribution from chat context

### 3.6 "Only Git Changes"

**Code-focused attribution**:
- Every commit = action
- CODEOWNERS = ownership
- PR/deploy correlation

**Limited to**: Code-related incidents only

---

## Chapter 4: Incident Type Coverage

### 4.1 Third-Party Outage (Stripe Down)

**What we do**:
```
1. Detect: Correlate with status page (integration)
2. Surface: "AWS/Stripe/etc reporting issues"
3. Distinguish: "This may not be your fault"
4. Coordinate: "Notify affected service owners anyway"
5. Track: "External dependency incident"
```

**Value**: Prevent internal wild goose chase

### 4.2 Slow Performance Degradation

**What we do**:
```
1. Detect: Requires metrics integration (Datadog)
2. Correlate: "Degradation started after action X"
3. Surface: "Gradual degradation alert" (not full incident)
4. Attribute: "Most likely cause: [action]"
```

**Limitation**: Need metrics integration, baseline data

### 4.3 Silent Data Corruption

**What we do**:
```
1. We don't detect automatically (no data validation)
2. When human reports: Create incident
3. Correlate: "Actions on affected tables in time window"
4. Attribute: "Possible causes: [list]"
5. Learn: "Add monitoring for this pattern"
```

**Limitation**: We don't validate data, only correlate actions

### 4.4 Permission Misconfiguration

**What we do**:
```
1. Track: Permission changes as actions
2. Correlate: "Access error after permission change"
3. Attribute: "Permission change by X at T"
4. Suggest: "Revert permission change"
```

### 4.5 Cost Explosion

**What we do** (with billing integration):
```
1. Alert: "Spending anomaly" from billing webhook
2. Correlate: "Agent X spawned 1000 resources"
3. Notify: Owner of agent X
4. Suggest: "Kill resources" / "Pause agent"
```

### 4.6 Infinite Loop / Resource Exhaustion

**What we do**:
```
1. Detect: Action rate spike from single agent
2. Alert: "Agent X unusually active (100x normal)"
3. Suggest: "Pause agent"
4. If configured: Auto-pause after threshold
```

### 4.7 Human-Caused Incident

**Can we catch it?** Yes, if we have signal.

```
Sources:
- Cloud audit log (human console access)
- Git commits (human commits)
- Deployment logs (human-triggered deploy)

Attribution: "Human action, not agent"
Value: Same timeline, same routing
```

### 4.8 Race Condition / Concurrent Write

**What we do**:
```
1. Detect: Multiple actions on same resource, close timing
2. Flag: "Concurrent modification detected"
3. Surface: "Actions A and B both touched X at T"
4. Don't guess: Human investigates causality
```

**Limitation**: We detect, we don't resolve

### 4.9 "Nobody Wants to Own It"

**What we do**:
```
1. Route to fallback/admin
2. Flag: "Ownership disputed"
3. Escalate faster
4. Track: "Unowned resource" metric
5. Nag: Weekly "these resources need owners"
```

### 4.10 "Two Teams Blaming Each Other"

**Do we make it worse?** We try not to.

```
Our approach:
1. Show facts, not fault
2. Timeline is neutral
3. Attribution is "involved", not "guilty"
4. Both teams see same data
5. Facilitate shared channel

We can make it worse if:
- One team uses our data as ammunition
- Management uses attribution punitively

Mitigation: Blameless mode, framing, ToS
```

### 4.11 "Politically Sensitive" Incident

**How we avoid being shut out**:
```
1. Neutral framing in all UI/messages
2. Data is factual, not judgmental
3. Access controls: Limit who sees what
4. Blameless mode available
5. Enterprise: Customer controls retention/visibility
```

### 4.12 "Compliance-Sensitive" Incident

**How we provide evidence**:
```
1. Complete, immutable audit trail
2. Hash chain for integrity
3. Export in standard formats
4. Chain of custody documentation
5. Timestamp attestation (enterprise)
```

---

## Chapter 5: Difficult Requests

### 5.1 "Give Me 'Who Makes Most Mistakes' Report"

**Our answer**: No.

**How we explain**:
```
"We don't provide individual error rankings because:

1. It incentivizes hiding problems, not fixing them
2. Context matters—someone touching critical systems 
   will have more incidents than someone on low-risk work
3. It damages blameless culture

We can provide:
- Team-level patterns
- System-level incident frequency
- Time-to-response metrics

Would those serve your underlying need?"
```

### 5.2 "Remove Someone from On-Call"

**Our response**:
```
"We don't manage on-call membership—that's PagerDuty/Opsgenie.
We route based on your on-call schedules.

If you need to change who's on-call:
1. Update in your scheduling tool
2. We'll pick up the change automatically

If you're asking because someone isn't responding:
We can show response metrics for review with their manager."
```

### 5.3 Legal Risks of Our System

**Potential legal exposure**:

| Risk | Scenario | Mitigation |
|------|----------|------------|
| Labor dispute | Data used in termination | ToS prohibits; blameless mode |
| Discrimination | Patterns show bias | We don't analyze demographics |
| Privacy violation | Over-collection | Data minimization by default |
| Defamation | Attribution is wrong | Confidence levels; "suspected" not "guilty" |

### 5.4 Subpoena for Logs

**Our process**:
```
1. Receive valid legal process
2. Notify customer (if legally permitted)
3. Provide requested data
4. Do not interpret or analyze
5. Customer's legal team handles

We are a neutral record keeper.
```

### 5.5 "Delete This History"

**Our response**:
```
Standard: "We can pseudonymize, not delete, for audit integrity"

If they insist on full deletion:
- Requires legal review
- May break audit compliance
- Customer assumes compliance risk
- We document their request
```

### 5.6 "Never Delete Anything"

**Cost handling**:
```
Retention tiers:
- Hot (90 days): Included
- Warm (1 year): Included
- Cold (7 years): Storage cost passed through
- Infinite: Custom pricing, S3 lifecycle

Cost estimate: ~$0.01/GB/month for cold storage
Typical customer: <$100/month for 7-year retention
```

### 5.7 "Encrypt So You Can't Read"

**BYOK approach**:
```
With BYOK:
- You control the key
- We can't read without your KMS
- Functions that need decryption: 
  - Search (limited to encrypted search)
  - Display (decrypted on-demand)
  
Trade-off: Some features limited (full-text search)
```

### 5.8 "Air-Gap Deployment"

**Our approach**:
```
Air-gap package:
├── Container images (signed)
├── Helm charts
├── Offline documentation
├── Offline license file

Updates:
├── Customer downloads release (quarterly)
├── Verifies signatures
├── Deploys in their window
├── No phone-home

Support:
├── Async (email, ticket)
├── No remote access
├── Customer provides logs for debugging
```

### 5.9 "Read-Only Integration"

**Fully supported**:
```
Read-only mode:
- We observe events
- We send notifications (to Slack, not to your systems)
- We don't write to your systems
- We don't execute actions

This is our default mode.
```

### 5.10 "Write Permission / Auto-Remediation"

**Our position**:
```
Default: We don't write to your systems

If requested:
- Pause agent (via agent SDK): Opt-in
- Trigger webhook (to your automation): Opt-in
- Direct system writes: NOT supported

Why: Auto-remediation that fails is worse than no remediation.
We tell humans what to do; humans do it.
```

### 5.11 "Guarantee MTTR Reduction"

**Can we sign this SLA?** No.

**Why**:
```
MTTR depends on:
- Your team's response
- Incident complexity
- System architecture
- Many factors we don't control

What we CAN guarantee:
- TTI (time-to-intervention): P50 <60s
- Notification delivery: 99.5% within 5s
- System availability: 99.9%

We sign SLAs on what we control, not what you control.
```

### 5.12 What SLAs We Sign

| Metric | SLA | Penalty |
|--------|-----|---------|
| Availability | 99.9% monthly | Service credit |
| Event ingestion | 99.9% delivery | Service credit |
| Notification delivery | 99.5% within 5s | Service credit |

**What we don't SLA**:
- MTTR (we don't control response)
- Incident reduction (we don't control prevention)
- Attribution accuracy (we estimate, humans confirm)

### 5.13 Why Trust Without SLA?

**Our answer**:
```
"We SLA what we control: availability, delivery.

For outcomes like MTTR, we provide:
1. Case studies with measured improvements
2. Free pilot to measure your before/after
3. Monthly review of your metrics
4. No long-term lock-in if it doesn't work

Trust comes from results, not contracts."
```

---

# PART B: MARKET AND STRATEGY

## Chapter 6: Acquisition and Independence

### 6.1 Likely Acquirers

| Acquirer type | Why they'd want us | Likelihood |
|---------------|-------------------|------------|
| **Datadog** | Add coordination to observability | High |
| **PagerDuty** | Extend into agent space | High |
| **ServiceNow** | Add real-time layer | Medium |
| **Salesforce** | Agent ecosystem play | Medium |
| **Microsoft** | Azure AI integration | Low |
| **Anthropic/OpenAI** | Agent tooling | Low |

### 6.2 Independence Path

**How to stay independent**:

```
Year 1-2: Establish category
├── Be the "coordination for agents" leader
├── Brand recognition in developer community
└── 100+ paying customers

Year 2-3: Platform expansion
├── Ecosystem of integrations
├── Partner network
├── Enterprise contracts (multi-year)

Year 3-5: Category defense
├── Data network effects (patterns across customers)
├── Integration moat (deep into customer stack)
├── Expand scope carefully
```

### 6.3 "Agent Runtime Embeds Everything"

**If agent platforms build coordination in**:

```
Our response:
1. Specialize: We work across agent platforms, they don't
2. Depth: Built-in features are shallow
3. Neutrality: We're not tied to one vendor
4. Focus: Our whole company does this; it's their side feature

Example: Salesforce built Chatter. Slack still won.
         Built-in ≠ best-in-class.
```

### 6.4 "Market Goes Full Approval/Governance"

**If market demands strong pre-approval**:

```
We adapt:
1. Gated routing can be default (not exception)
2. Approval workflow added
3. We become "smart approval" not "dumb approval"
4. Still better than traditional approval systems

We don't abandon our philosophy, but we meet market.
```

### 6.5 "Full Automation, No Humans"

**If agents don't need human coordination**:

```
Our evolution:
1. Agent-to-agent coordination (agents notify agents)
2. Exception handling (humans only for edge cases)
3. Audit and compliance (someone still needs to review)
4. Learning loop (still valuable)

Even in full automation, you need:
- Visibility into what happened
- Attribution when things go wrong
- Learning to prevent recurrence
```

---

## Chapter 7: Product Evolution

### 7.1 "Agents Do Their Own Postmortem"

**If agents can self-analyze**:

```
Our role shifts to:
1. Data provider: Agents query us for history
2. Coordination: Still need to notify stakeholders
3. Verification: Humans review agent conclusions
4. Learning distribution: Share patterns across agents
```

### 7.2 "Agents Find Their Own Owners"

**If agents can discover ownership**:

```
Our role:
1. Authoritative source: We maintain ownership truth
2. Conflict resolution: When agents disagree
3. Human override: Final say stays with humans
4. Audit trail: Who changed ownership and why
```

### 7.3 Evolution to "Humans at Critical Points Only"

**Trajectory**:

```
Today: Humans notified for most actions
       ├── monitored_execute is default
       └── Humans see a lot

Year 2: Humans notified for exceptions
        ├── auto_execute is default for known-safe
        └── Humans see less, but more important

Year 5: Humans at critical decisions only
        ├── Agents handle routine
        └── Humans handle novel, high-stakes, conflict
```

### 7.4 Defining "Critical Point"

**Critical point = where human judgment is irreplaceable**:

| Type | Example | Why human needed |
|------|---------|------------------|
| Novel | First time seeing this pattern | No historical guidance |
| High-stakes | Production delete | Irreversible |
| Conflict | Two agents disagree | Need tiebreaker |
| Political | Cross-team impact | Need organizational authority |
| Ethical | Customer-impacting decision | Need accountability |

### 7.5 Preventing Critical Point Explosion

**Risk**: Everything becomes "critical"

**Prevention**:
```
1. Quantitative threshold: <10% of actions are critical
2. Decay: Critical actions that always succeed → demote
3. Cost: Each "critical" designation has review overhead
4. Metrics: Track "critical inflation", alert if growing
```

### 7.6 Avoiding Scope Creep

**What we won't become**:

| Product | Why not |
|---------|---------|
| **Jira** | We're real-time, not project tracking |
| **ServiceNow** | We're dev-focused, not IT service desk |
| **Datadog** | We're coordination, not observability |
| **PagerDuty** | We're agent-native, not just alerting |

**Scope guard rails**:
```
Every feature must:
1. Reduce TTI, or
2. Improve attribution accuracy, or
3. Accelerate learning loop

If none of the above → don't build it
```

---

## Chapter 8: Customer Segments

### 8.1 No Mature Org Structure

**Where does owner graph come from?**

```
Fallback sources:
1. Git history: "Who touched this file most?"
2. On-call schedule: "Who's been paged for this?"
3. Self-declaration: "Who wants to own this?"
4. Manager assignment: "You own this now"

We help build the graph, not just consume it.
```

### 8.2 Org Structure Changes Daily

**Sync strategy**:
```
1. Webhook from HR/directory system
2. Real-time updates
3. Grace periods for transitions
4. Fallback to last-known-good
5. Flag: "Ownership may be stale"
```

### 8.3 M&A / Org Chaos

**Our value**: **Higher** during chaos

```
Why:
- "Who owns what?" is the #1 question
- We provide single source of truth
- We help map the new org

Positioning: "You're merging two companies. 
             We help you figure out who's responsible 
             for what during the transition."
```

### 8.4 Team of 3 People

**Do they need us?**

```
Probably not, unless:
- They're managing 50+ agents
- They're on-call alone and need automation
- They're growing fast

Better answer: "Not yet. Call us when you're at 10 people."
```

### 8.5 Team of 300 People

**Why not use existing tools?**

```
"Your existing tools weren't built for agents:

- PagerDuty: Doesn't understand agent actions
- ServiceNow: Too slow for agent speed
- Datadog: Shows data, doesn't route response

You need a layer that:
- Speaks agent (MCP, tool calls)
- Routes at agent speed
- Learns from agent patterns

We're that layer."
```

### 8.6 Fast Startup vs Slow Enterprise

**Crossing the chasm**:

| Startup | Enterprise |
|---------|------------|
| Fast adoption | Slow procurement |
| Price sensitive | Value sensitive |
| Want simple | Want complete |
| Self-serve | High-touch |

**Our approach**: Start with startups (fast iteration), expand to enterprise (revenue)

### 8.7 Which Market First?

**Choice**: Mid-market tech companies (50-500 people)

**Why**:
```
1. Big enough to need coordination
2. Small enough to decide fast
3. Tech-forward (deploying agents)
4. Budget for tools ($5-20K/year)
5. Not so big they need enterprise sales
```

### 8.8 Proving This Isn't Random

**Evidence**:
```
1. Design partner conversations: 5 of 7 are mid-market tech
2. Agent adoption data: Mid-market leading enterprise
3. Competition: Giants targeting enterprise, not mid-market
4. Unit economics: Mid-market can self-serve
```

---

## Chapter 9: Two-Week Validation

### 9.1 Validate Wedge in 2 Weeks

**Week 1: Discovery**
```
Day 1-3: Talk to 10 companies deploying agents
Day 4-5: Identify top 3 pain points
Day 6-7: Prototype notification flow (no code)
```

**Week 2: Test**
```
Day 8-10: Demo prototype to 5 companies
Day 11-12: Refine based on feedback
Day 13-14: Get 2 verbal commits to pilot
```

**Success criteria**:
- 5+ companies say "yes, this is a problem"
- 2+ companies willing to pilot
- 1+ company mentions budget

### 9.2 Proving Willingness to Pay

**In 2 weeks**:
```
Question to ask: "If this existed today, what would you pay?"

Signals:
- "We'd find budget" → Strong
- "We'd have to see it first" → Weak
- "That's not a budget item" → No
- "We already pay $X for related tool" → Context

Goal: 2 companies say specific $ amount
```

### 9.3 Proving High Frequency

**In 2 weeks**:
```
Question to ask: "How often do agent-related issues require coordination?"

Signals:
- "Daily" → High frequency ✅
- "Weekly" → Medium, viable
- "Monthly" → Low, risky
- "Rarely" → Not our customer

Goal: 3+ companies say "daily" or "multiple times per week"
```

### 9.4 Proving Must-Have vs Nice-to-Have

**In 2 weeks**:
```
Question to ask: "What happens if you don't solve this?"

Must-have signals:
- "We can't scale agent deployment"
- "We've had incidents we couldn't explain"
- "Leadership is asking for accountability"
- "We're slowing down because we're scared"

Nice-to-have signals:
- "It would be more convenient"
- "We're managing okay for now"
- "Maybe when we're bigger"
```

### 9.5 Proving Budget Exists

**In 2 weeks**:
```
Question to ask: "Where would this come from in your budget?"

Budget signals:
- "Infrastructure/platform tools" → Existing category
- "We just bought [similar tool]" → Budget allocated
- "Engineering discretionary" → Fast decision

Non-budget signals:
- "We'd need to create a new line item"
- "That's a next year thing"
```

### 9.6 Proving Not Imaginary Problem

**In 2 weeks**:
```
Question to ask: "Tell me about the last agent-related incident"

Real problem signals:
- They have a specific recent story
- Multiple people involved
- Took longer than expected to resolve
- They're frustrated telling it

Imaginary signals:
- "We haven't really had one"
- Vague, hypothetical concerns
- "I've read about this being a problem"
```

### 9.7 Proving Can't Be Solved by Slack Channels

**In 2 weeks**:
```
Question to ask: "Why doesn't a Slack channel solve this?"

Validation signals:
- "We have channels, but no one knows which to use"
- "The right person doesn't see it in time"
- "We don't know who the right person is"
- "Slack is too noisy"

Invalidation signals:
- "Actually, maybe we just need better channels"
- "We haven't really tried that"
```

### 9.8 Proving Can't Be Solved by Documentation

**In 2 weeks**:
```
Question to ask: "Do you have runbooks for this?"

Validation signals:
- "Runbooks are always out of date"
- "People don't read them during incidents"
- "We don't know which runbook applies"

Invalidation signals:
- "We should probably write some runbooks"
```

### 9.9 Proving Can't Be Solved by PagerDuty Config

**In 2 weeks**:
```
Question to ask: "Why doesn't PagerDuty solve this?"

Validation signals:
- "PagerDuty doesn't know about agent actions"
- "By the time PagerDuty alerts, it's too late"
- "PagerDuty can't route based on what the agent did"
- "We can't configure PagerDuty for every agent scenario"

Invalidation signals:
- "Maybe we just need to configure PagerDuty better"
```

### 9.10 Proving More Than a Bot

**In 2 weeks**:
```
Question to ask: "Have you tried building a Slack bot for this?"

Validation signals:
- "We built one, it's unmaintainable"
- "It doesn't scale, too many rules"
- "We don't have time to maintain it"
- "It doesn't learn from incidents"

Invalidation signals:
- "A bot might work actually"
- "We haven't tried"
```

### 9.11 Proving Not Just a Feature

**In 2 weeks**:
```
Question to ask: "If Datadog added this, would you use it?"

Platform signals:
- "Datadog doesn't understand our ownership model"
- "We'd need it to work across tools, not just Datadog"
- "We need deeper integration than a Datadog feature"

Feature signals:
- "Yeah, that would be enough"
- "We mostly use Datadog anyway"
```

### 9.12 Proving Platform Potential

**In 2 weeks**:
```
Question to ask: "What else would you want this to connect to?"

Platform signals:
- They list 3+ integrations spontaneously
- "It needs to work with our whole stack"
- "We'd want to extend it for [specific use case]"

Point solution signals:
- "Just Slack is fine"
- "We don't have many tools"
```

---

# APPENDIX: Validation Checklist

## Two-Week Sprint Checklist

```
□ Talked to 10 potential customers
□ 5+ confirmed "this is a real problem"
□ 2+ willing to pilot
□ 1+ mentioned specific budget
□ 3+ said "daily" or "weekly" frequency
□ 3+ gave specific recent incident story
□ 3+ explained why Slack/docs/PagerDuty don't solve it
□ 2+ asked about integrations (platform signal)
□ Prototype demo'd to 5 people
□ Refined value prop based on feedback

If all boxes checked: Proceed to build MVP
If <7 boxes checked: Pivot or dig deeper
If <4 boxes checked: Major pivot needed
```

---

**Document Version**: 5.6 Edge Cases & Validation
**Last Updated**: January 2026
**Status**: Ready for Validation Sprint
