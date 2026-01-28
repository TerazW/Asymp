# Asymp MVP Features for YC Demo

**Version**: 1.0 | **Date**: January 2026

---

## One-Sentence Definition

> **Asymp routes agent actions to the right humans in real-time so they can intervene before damage compounds.**

---

## MVP Overview

This MVP demonstrates the core value proposition of Asymp: helping humans coordinate at agent speed. All features are functional for demonstration purposes, with realistic mock data showing how the system works in production.

---

## Pages and Features

### 1. Dashboard (`/`)

**Purpose**: Real-time overview of agent activity and system health

**Key Elements**:
| Element | Description | Demo Value |
|---------|-------------|------------|
| **TTI Metric** | Time-to-Intervention (52s average) | Core metric - shows we're faster than alternatives |
| **Action Count** | 1,247 actions in 24h | Shows scale of agent operations |
| **Routing Distribution** | 66% auto, 31% monitored, 3% gated | Proves "we don't slow things down" |
| **Live Activity Feed** | Real-time updates every 3-4s | Demonstrates real-time visibility |
| **Open Incidents** | Current incidents with TTI | Shows incident awareness |
| **Active Agents** | Top agents by activity | Agent-level visibility |

**30-Second Story**: "Look at this dashboard - you can see exactly what all your agents are doing. 66% execute automatically, 31% are monitored, only 3% need attention. Average time to intervention is 52 seconds."

---

### 2. Activity Stream (`/activity`)

**Purpose**: Real-time feed of all agent actions with routing decisions

**Key Elements**:
| Element | Description | Demo Value |
|---------|-------------|------------|
| **Live Stream** | Actions appear in real-time | Shows immediate visibility |
| **Routing Labels** | Auto/Monitored/Gated badges | Core routing concept |
| **Agent Attribution** | Which agent did what | Clear attribution |
| **Target Display** | What resource was affected | Blast radius awareness |
| **Filter by Routing** | Quick filtering | Triage capability |

**Demo Narrative**:
- "Every agent action appears here in real-time"
- "See this green 'Auto' badge? Low-risk actions execute without interruption"
- "This yellow 'Gated' one? The owner was notified immediately"
- "We're not blocking anything - we're making sure the right people know"

**Key Phrase**: *"Routing, not Approval"*

---

### 3. Incidents (`/incidents`)

**Purpose**: Timeline view with attribution and metrics

**Key Elements**:
| Element | Description | Demo Value |
|---------|-------------|------------|
| **Incident Card** | Severity, status, TTI, MTTR | Quick understanding |
| **Timeline View** | Chronological event sequence | "What happened" story |
| **Attribution** | Which agent caused it | "Who did it" answer |
| **Responders** | Who's working on it | Coordination status |
| **Root Cause** | Agent and action identified | Learning loop input |

**30-Second Comprehension Design** (from v5.3):
```
INC-234: Analytics Service degradation

WHAT:   Batch update caused cascading failures
WHEN:   Started 45 min ago, resolved 35 min ago
WHO:    Agent "DataSync" (malformed SQL query) [LIKELY - 85%]
ON IT:  Sarah Chen (resolved)
IMPACT: Analytics Service, Dashboard (10 min outage)
TTI:    60 seconds
MTTR:   10 minutes
```

**Demo Story**: "Here's an incident from earlier. Within 60 seconds, Sarah knew about it. Within 10 minutes, it was resolved. Without Asymp? This would take 30 minutes just to figure out who to call."

---

### 4. Routing Rules (`/routing`)

**Purpose**: Configure how actions are classified and routed

**Key Elements**:
| Element | Description | Demo Value |
|---------|-------------|------------|
| **Flow Diagram** | Visual routing pipeline | Easy concept understanding |
| **Rule Cards** | Individual routing rules | Configuration example |
| **Routing Types** | Auto/Monitored/Gated/Blocked | Risk classification |
| **Default Behavior** | Monitored Execute | "We don't block by default" |

**Routing Philosophy** (from design docs):
```
Routing Type        | What Happens
--------------------|------------------------------------------
Auto Execute        | Low risk, executes automatically
Monitored Execute   | DEFAULT - executes with owner notification
Gated              | High risk, executes but alerts immediately
Blocked            | Extremely high risk, requires approval
```

**Key Message**: "We're not an approval system. We don't block by default. We route to the right people based on risk, so they can intervene if needed."

---

### 5. Ownership (`/ownership`)

**Purpose**: Service ownership graph for instant notification routing

**Key Elements**:
| Element | Description | Demo Value |
|---------|-------------|------------|
| **Service Cards** | Services with owners | Ownership clarity |
| **On-Call Indicator** | Who's currently on-call | Instant contact |
| **Team Structure** | Primary/Secondary owners | Escalation path |
| **Dependencies** | Service dependencies | Blast radius context |
| **Slack Channel** | Direct communication link | Integration point |

**Why Ownership Matters** (3-step flow):
```
1. Incident Happens → Agent action causes problem
2. Instant Attribution → Asymp identifies affected services + owners
3. Immediate Notification → Right people notified within seconds
```

**Demo Point**: "When something goes wrong, we don't just know what happened - we know exactly who to call. This takes seconds, not minutes."

---

### 6. Settings (`/settings`)

**Purpose**: Integration configuration (demonstration)

**Shows**:
- Connected integrations (Slack, GitHub, PagerDuty, AWS)
- Notification preferences
- API key management

**Demo Value**: Shows how Asymp fits into existing toolchain

---

## Key Metrics (Mock Data)

| Metric | Value | Meaning |
|--------|-------|---------|
| **TTI P50** | 52 seconds | Time from incident to human notification |
| **MTTR** | 10 minutes | Time from incident to resolution |
| **Actions/24h** | 1,247 | Scale of agent operations |
| **Routing: Auto** | 66% | Actions that don't need attention |
| **Routing: Monitored** | 31% | Actions with owner notification |
| **Routing: Gated** | 3% | Actions requiring immediate attention |
| **Active Agents** | 4 | Agents currently operating |

---

## Demo Script (3 Minutes)

### Opening (30s)
"Asymp helps humans coordinate at agent speed. When you have 10+ agents in production, three things become painful: you don't know who did it, you don't know why it happened again, and you don't know the current state. We fix all three."

### Dashboard (30s)
"Here's our dashboard. You can see 4 agents made 1,247 actions today. 66% executed automatically - low risk. Only 3% needed attention. Our average time-to-intervention is 52 seconds. That's how fast the right person knows about a problem."

### Activity Stream (30s)
"Every action appears here in real-time. See these routing labels? 'Auto' means low risk, executed automatically. 'Monitored' means the owner was notified. 'Gated' means high risk - we alert immediately. We're not blocking anything - we're routing to the right people."

### Incident (45s)
"Here's a real incident. Agent 'DataSync' ran a malformed SQL query. Within 60 seconds, Sarah Chen was notified. Within 10 minutes, she'd rolled it back and fixed it. Without Asymp, this takes 30 minutes just to figure out who owns what."

### Ownership (30s)
"This is our ownership graph. When something breaks, we instantly know who to call. No more Slack searching, no more 'who owns this?' We route to the right person in seconds."

### Close (15s)
"That's Asymp. We help humans intervene at agent speed. Current TTI: 52 seconds. Target: under 60. We're looking for design partners deploying 10+ agents who need faster incident response."

---

## Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data**: Realistic mock data with live simulation

---

## What This MVP Demonstrates

| Capability | How It's Shown |
|------------|----------------|
| **Real-time visibility** | Live activity stream with updates |
| **Pre-action routing** | Routing labels on every action |
| **Fast attribution** | Agent → Action → Effect chain |
| **Instant notification routing** | Ownership graph + on-call display |
| **Incident timeline** | Chronological event view |
| **TTI as core metric** | Displayed prominently |
| **Integration points** | Slack, PagerDuty, GitHub shown |

---

## What's NOT in MVP (Future)

- Actual agent SDK integration
- Real Slack/PagerDuty notifications
- Pattern detection and learning loop
- Postmortem generation
- Multi-tenant authentication
- Database persistence

---

## Running the MVP

```bash
cd asymp-app
npm install
npm run dev
```

Open http://localhost:3000

---

## Key Messages for YC

1. **Problem**: Agents act in seconds, humans discover issues in hours
2. **Solution**: Pre-action routing to the right humans in real-time
3. **Metric**: TTI (Time-to-Intervention) - P50 target <60 seconds
4. **Positioning**: "Like PagerDuty for agents" - coordination, not control
5. **Differentiation**: We route, we don't block. Learning loop for prevention.

---

**Document Version**: 1.0
**Last Updated**: January 2026
