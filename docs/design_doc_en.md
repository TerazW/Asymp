# Defining How Organizations Operate in the Agent Era

---

## 1. Core Positioning

**Target Users**: Companies deploying 10+ autonomous agents who need velocity but can't accept chaos.

**What We Are Not**:
- Not an approval system
- Not an AI safety firewall
- Not a rollback engine
- Not a centralized agent controller

**What We Are**: Not another version of an agent control plane, but a definition of how organizations operate in the agent era. We're not selling capability—we're selling whether humans can intervene in time.

**External Messaging**:
- ✅ "We help humans coordinate at agent speed"
- ✅ "Datadog tells you what happened. Rubrik lets you undo it. We help you prevent it, recover faster, and make sure it never happens again."
- ❌ "We do LLM observability" (collides with Datadog/Arize/Traceloop)
- ❌ "We rewind agent mistakes" (collides with Rubrik)

---

## 2. Why We Don't Do Centralized Pre-Execution Interception

Centralized pre-execution interception is wrong:

1. **Pre-execution governance makes authorization a bottleneck**: If every agent action requires human approval, you've already lost. This is a decelerator. Even if it claims to accelerate, as long as the core logic is "ask human before execute," it can never be an accelerator.

2. **Real control shouldn't be a defense system—it should be an accelerator**: Blocking doesn't equal safety. Defaulting to asking humans is wrong.

3. **The biggest illusion**: If a system is complex enough, smart enough, comprehensive enough, it can prevent most errors before they happen.

4. **No execution means no data. No data means no improvement.**

5. **The most dangerous errors cannot be identified beforehand**: Pre-execution approval can only block things that obviously shouldn't be done.

6. **Approval is just one form of human intervention, not the core form of governance**: It's not about removing all approvals, but providing intervention capabilities tiered by action type.

**Conclusion**: We should abandon the illusion that systems can replace human judgment, and build a system that lets human judgment keep up with agent speed.

---

## 3. Redefining Governance

**I'm not against real-time governance—governance should be decentralized.**

A central decision-making system has all the problems mentioned above.

- Governance shouldn't be a judge that decides approval or rejection—it should be embedded at every intervention point.
- Governance is no longer about whether to do something, but how I can intervene after it's done.
- Governance isn't about blocking actions—it's about shortening human intervention response time.
- Control shouldn't be centralized. Control should be the system providing intervention capabilities at every intervention point.
- This isn't a plane—it's a real-time collaboration network. Control is no longer a center, but a way of organizational operation.

---

## 4. On Recovery and Rollback

### The Correct Understanding of Fast Recovery

Fast recovery as an outcome is correct, but building fast recovery as a feature is wrong. Especially building fast recovery as perfect rollback.

- **Rollback is always temporary.**
- **We should acknowledge that many actions are irreversible**: Irreversible doesn't mean completely unable to undo—it's because of undo costs, permissions, extremely short windows, and unverifiability that we call it irreversible.
- **Recovery speed cannot be guaranteed**—it depends on action type. We can only guarantee providing the fastest possible recovery path for each action type.
- **Reversibility and rollback shouldn't be the main narrative**—they're just one possibility within recovery paths.

### What "Fast" Really Means

Real speed isn't fast rollback recovery—it's fast awareness of errors, fast intervention, not fewer mistakes. What the real world needs is intervenable speed. And in actual development, it's not rollback that's needed—it's not knowing who did it. The need is fast localization.

### The Essence of Rollback

**My view: Rollback is not a technical capability—it's a social capability.**

- Rollback is not checkpoint.
- Rollback's core resource is not storage—it's who knows how to fix it + who is willing to fix it.
- Turning rollback into a deterministic system capability is wrong. Reality is human coordination capability.
- Almost all real major incidents aren't about no one being able to fix it—it's about not knowing who to find, where to start.

---

## 5. Real Pain Points and Real Needs

### Three Major Pain Points
1. Don't know who did it
2. Don't know why the same mistake happened again
3. Don't know what version the system is currently in

### The Real Risk
Not too much destruction, but invisible destruction. Destruction happened, but no one saw it.

### Real Needs
Visibility, fast localization, fast learning, synchronized communication.

- Make all changes visible
- Every change can be tracked
- Every impact can be attributed to a person or agent
- Know immediately who to find when something goes wrong

This is closer to real production incidents than any safety model.

### What's More Important Than Prevention
- Immediately knowing what happened
- Whether you can accurately know who/which action caused it
- Whether you can stop the bleeding immediately
- Whether you can recover via the fastest path

### On Learning
We learn from incidents and prevent repetition. Because making mistakes isn't scary—making the same mistake is.

---

## 6. Design Principles

### The Flow We Adopt
Execute → Broadcast → Visible → Intervene → Recover → Learn

### Default Policy
monitored_executed

### Five Closed-Loop Elements
1. **What happened** (action/effect)
2. **Who did it, who's affected** (Ownership / Attribution)
3. **Can I intervene now** (Intervention / Routing)
4. **What to do if something already went wrong** (Containment / Recovery)
5. **How to not be blind next time** (Postmortem / Governance evolution)

### Note
Time correlation ≠ causation. This is false attribution.

---

## 7. Competitor Analysis

### Rubrik

**Background**: Released Agent Rewind in August 2025, full Agent Cloud platform in October. Claims to provide "the industry's only solution for precise time and blast radius rollback of undesirable or destructive actions," able to "instantly undo unwanted or destructive actions, without any downtime or data loss."

**Rubrik's Design Philosophy**:
1. Comes from data backup background: Rubrik started in enterprise backup/disaster recovery. Agent Cloud applies this logic to AI agents
2. Depends on Rubrik Security Cloud: Agent Rewind needs integration with their backup infrastructure
3. Targets large enterprises: Microsoft Copilot Studio, Salesforce Agentforce, Amazon Bedrock
4. Rollback = restore data snapshots: Their "rewind" is essentially restoring files/databases/configurations modified by agents
5. No learning loop: After rewind, no learning to prevent recurrence

**Rubrik's Logic**: agent messes up → restore data snapshot

### Datadog

**Background**: At DASH conference in June 2025, released AI Agent Monitoring, LLM Experiments, and AI Agents Console, providing "end-to-end visibility, rigorous testing capabilities, and centralized governance of both in-house and third-party AI agents."

**Limitations**: Their "governance" is visibility governance (seeing what permissions agents have), not execution governance (controlling what agents can do). They have no action routing, no rollback, no incident response.

### Market Status

Everyone in the market is doing Trace/replay. But these can only ever be background infrastructure, not the product itself. Replay is just a foundation, because all actions depend on complete event chains.

---

## 8. Our Fundamental Differences from Competitors

**We have fundamental differences from all control products in the market. To avoid being a decelerator, they all do post-hoc analysis. What we achieve is pre-action routing + in-process monitoring + post-incident recovery.**

| Dimension | Rubrik | Datadog | Us |
|-----------|--------|---------|-----|
| DNA | Enterprise backup, disaster recovery | Observability | Developer workflow coordination |
| Rollback method | Data snapshot restore | None | Multi-strategy (including git revert, DB rollback, etc.) |
| Pre-action routing | None | None | Rule-based router |
| Blast radius | Only shows dependency graph | - | Proactively notifies affected owners |
| Learning loop | None | None | Postmortem + pattern detection |
| Target | Enterprise Salesforce, Copilot Studio | - | Dev teams |

### Core Differentiators
1. **Pre-action routing**: They all react post-hoc, but we route before affecting or blocking event occurrence, through different paths, like tagging some actions as monitored_executed
2. **Operational coordination**: We solve the "who should know" problem. They can't.
3. **Learning loop**: Postmortem + pattern detection is closed-loop design
4. **Multi-strategy recovery**: They can only restore data

### Execution Logic Comparison
- **Rubrik**: action executes → incident → rewind
- **Us**: action comes in → routing decision → monitored execution → fast recover if incident → learn to prevent recurrence
- **Another way to put it**: action executes (with monitoring) → if incident, faster discovery → faster recovery

Rubrik is a "fire extinguisher." We are "fire system + fire extinguisher + fire prevention training."

---

## 9. Market Significance

The market has validated that the problem exists: Rubrik can get funding to do this, Datadog can announce AI Agents Console at DASH conference—this shows the market acknowledges this problem is real. We don't need to educate the market that "agent governance matters"—big companies are already doing this for us.

---

## 10. External Communication Principles

1. **Stop saying "visibility + recovery"**: This makes us sound like a poor man's Rubrik

2. **Emphasize real differentiators**:
   - Pre-action routing (Rubrik doesn't have this at all)
   - TTI (Time-to-Intervention) (the core metric for humans keeping up with agent speed)
   - Learning loop (preventing recurrence)

3. **Our starting point is how humans can keep up with agent speed**
