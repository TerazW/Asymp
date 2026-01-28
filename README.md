# Asymp

**Operational Coordination for the Agent Era**

> "We help humans coordinate at agent speed"

## What is Asymp?

Asymp is a real-time coordination platform for teams deploying autonomous AI agents. We're not an approval system, safety firewall, or rollback engine—we're a system that lets human judgment keep up with agent speed.

### The Problem

When you deploy 10+ autonomous agents, three things become painful:
1. **Don't know who did it** - Which agent caused that production issue?
2. **Don't know why it happened again** - Same mistake, different day
3. **Don't know the current state** - What version is the system in right now?

### Our Solution

**Execute → Broadcast → Visible → Intervene → Recover → Learn**

- **Pre-action routing**: Classify actions by risk without blocking them
- **Real-time visibility**: See all agent activity as it happens
- **Instant attribution**: Know exactly which action caused which effect
- **Fast intervention**: Notify the right people within seconds (TTI)
- **Learning loop**: Postmortem + pattern detection to prevent recurrence

## Quick Start

```bash
# Navigate to app directory
cd asymp-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Features (MVP)

- **Dashboard**: Real-time overview of agent activity and system health
- **Activity Stream**: Live feed of all agent actions with routing decisions
- **Incidents**: Timeline view with attribution and responder tracking
- **Routing Rules**: Configure how actions are classified (auto/monitored/gated)
- **Ownership**: Service ownership graph for instant notification routing

## Key Metrics

- **TTI (Time to Intervention)**: Time from incident to human notification
- **MTTR (Mean Time to Recovery)**: Time from incident to resolution
- **Routing Distribution**: Breakdown of actions by classification

## Philosophy

> "The most dangerous errors cannot be identified beforehand. Pre-execution approval can only block things that obviously shouldn't be done."

We don't believe in:
- ❌ Centralized pre-execution interception (bottleneck)
- ❌ Perfect rollback as a feature (rollback is social, not technical)
- ❌ Systems replacing human judgment

We believe in:
- ✅ Execution with monitoring (default: `monitored_execute`)
- ✅ Decentralized governance at every intervention point
- ✅ Human coordination at agent speed

## How We Compare

| Dimension | Rubrik | Datadog | Asymp |
|-----------|--------|---------|-------|
| DNA | Backup/DR | Observability | Dev workflow coordination |
| Pre-action routing | ❌ | ❌ | ✅ Rule-based |
| Learning loop | ❌ | ❌ | ✅ Postmortem + patterns |
| Recovery | Snapshot restore | None | Multi-strategy |
| Target | Enterprise | Enterprise | Dev teams |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## License

MIT
