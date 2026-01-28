# Mandate: Operational Coordination for the Agent Era

**Version 5.5 Security, Compliance & Privacy Complete | January 2026**

---

# PART A: POSITIONING AND STRATEGY

*[Chapters 1-9 from v5.4 remain unchanged]*

---

# PART B: SECURITY DEEP DIVE

## Chapter 10: Threat Model

### 10.1 Attacker Types

| Attacker | Access | Goal | Likelihood |
|----------|--------|------|------------|
| **External attacker** | Network/Internet | Data exfiltration, service disruption | Medium |
| **Malicious agent** | API credentials | Forge events, hide malicious actions | Medium |
| **Malicious insider (customer)** | Customer admin | Tamper attribution, cover tracks | Low-Medium |
| **Malicious insider (us)** | Employee access | Access customer data, sabotage | Low |
| **Compromised dependency** | Supply chain | Code execution, data theft | Low |
| **Nation-state** | Advanced persistent | Espionage, disruption | Very Low (for most customers) |

### 10.2 Most Realistic Attack Paths

**Ranked by likelihood × impact**:

| Rank | Attack path | Mitigation |
|------|-------------|------------|
| 1 | **Credential theft → API abuse** | Rate limiting, anomaly detection, token rotation |
| 2 | **Insider tampers attribution** | Append-only logs, hash chain, separation of duties |
| 3 | **Supply chain compromise** | SBOM, dependency scanning, pinned versions |
| 4 | **Agent spoofs identity** | mTLS, signed events, identity verification |
| 5 | **Our employee accesses data** | Zero-trust, audit logging, break-glass only |

### 10.3 Attack Scenarios We Design Against

```
Scenario 1: Credential Stuffing
─────────────────────────────────
Attack: Attacker gets API key, floods fake events
Detection: Rate limit exceeded, anomaly in event patterns
Response: Auto-block IP, revoke key, alert customer

Scenario 2: Attribution Tampering
─────────────────────────────────
Attack: Insider deletes/modifies events to hide actions
Detection: Hash chain broken, audit log shows access
Response: Restore from immutable backup, investigate

Scenario 3: Supply Chain
─────────────────────────────────
Attack: Malicious npm package in our dependencies
Detection: Dependabot alert, SBOM diff
Response: Immediate patch, customer notification if affected
```

---

## Chapter 11: Preventing Misuse

### 11.1 Preventing Internal Surveillance/Oppression

**The risk**: Customer uses our system to monitor employee productivity or target individuals.

**Product-level controls**:

| Control | Implementation |
|---------|----------------|
| **No productivity metrics** | We don't calculate/display "actions per person" |
| **No ranking** | We don't rank employees by activity |
| **Focus on systems** | Attribution is for incident response, not performance review |
| **Blameless defaults** | Language emphasizes "what" not "who" |
| **Terms of Service** | Prohibited uses include employee surveillance |

### 11.2 Terms of Service Restrictions

**Prohibited uses** (in ToS):

1. Employee productivity monitoring
2. Performance evaluation based on incident involvement
3. Punitive action based solely on our data
4. Surveillance of individual behavior patterns
5. Any use violating local labor laws

**Enforcement**:
- Customer must agree to acceptable use policy
- We can audit usage patterns (aggregate, not individual)
- Violation = termination of service

### 11.3 Does This Affect Sales?

**Risk**: Customers want surveillance features.

**Our position**:
- We don't compete for that market
- Customers wanting surveillance aren't our ICP
- Long-term brand protection > short-term sales
- "Blameless" positioning is a selling point for engineering teams

---

## Chapter 12: Privacy Architecture

### 12.1 Employee Privacy vs Audit

**The tension**:
- Employees: "Don't track everything I do"
- Compliance: "We need complete audit trail"

**Our resolution**:

| Need | How we balance |
|------|----------------|
| **Audit completeness** | Log all actions on production systems |
| **Privacy** | Don't log personal behavior, only work actions |
| **Transparency** | Employees know what's logged |
| **Purpose limitation** | Data used only for incident response |

### 12.2 Anonymization Options

**Blameless Mode** (opt-in):

```yaml
privacy:
  blameless_mode: true
  settings:
    - display_attribution: "team"  # Show team, not individual
    - audit_attribution: "individual"  # Still logged for compliance
    - access_to_individual: "admin_only"  # Restricted access
```

**What you lose with anonymization**:
- Direct "call this person" routing (falls back to team)
- Individual track record (for trust scoring)
- Precise postmortem attribution

**What you keep**:
- System-level visibility
- Team-level attribution
- Incident response capability

### 12.3 Personal Data Definition

**What we consider personal data**:
- User identifiers (email, username, employee ID)
- IP addresses (when linked to user)
- Action attribution (who did what)

**What we don't consider personal data**:
- System names, resource IDs
- Action types, timestamps
- Error messages (unless containing PII)

### 12.4 Data Minimization

**Principle**: Collect only what's needed for incident response.

**What we collect**:
- Actor identity (who)
- Action type (what)
- Resource affected (where)
- Timestamp (when)
- Outcome (success/failure)

**What we don't collect**:
- Full request/response bodies (unless configured)
- Behavioral patterns (browsing, typing)
- Location data
- Device information

**When customers want more**:
- We explain privacy implications
- They sign additional data processing agreement
- We document the business justification
- Feature is opt-in, not default

---

## Chapter 13: Data Residency and Transfer

### 13.1 Data Residency Options

| Region | Deployment | Data location |
|--------|------------|---------------|
| **US** | us-east-1, us-west-2 | Data stays in US |
| **EU** | eu-west-1 | Data stays in EU |
| **Canada** | ca-central-1 | Data stays in Canada |
| **APAC** | ap-southeast-1 | Coming (customer demand) |

**Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA RESIDENCY                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  US Region                EU Region               CA Region     │
│  ┌─────────┐              ┌─────────┐             ┌─────────┐  │
│  │ Data    │              │ Data    │             │ Data    │  │
│  │ Plane   │              │ Plane   │             │ Plane   │  │
│  └────┬────┘              └────┬────┘             └────┬────┘  │
│       │                        │                       │        │
│       └────────────────────────┼───────────────────────┘        │
│                                │                                │
│                    Global Control Plane                         │
│                    (config only, no PII)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 Cross-Border Transfer

**We don't transfer customer event data across borders.**

**What crosses borders** (for global control plane):
- Configuration (no PII)
- Aggregated metrics (no PII)
- License validation

**Legal basis if transfer needed**:
- Standard Contractual Clauses (SCCs)
- Customer consent
- Adequacy decisions where applicable

### 13.3 GDPR Compliance

**GDPR deletion requests**:

```
Request: "Delete all data about user X"

Process:
1. Identify all events with user X as actor
2. Pseudonymize: Replace "alice@company.com" with "user_deleted_123"
3. Retain pseudonymized events (for audit integrity)
4. Delete mapping table entry
5. Confirm deletion within 30 days

What remains:
- Events with "user_deleted_123" attribution
- No way to link back to real identity
```

**Why pseudonymize, not delete**:
- Audit log integrity requirements
- Incident history would have gaps
- Compliance with financial/security regulations

### 13.4 Audit Log Retention Conflict

**The conflict**:
- GDPR: Right to deletion
- SOC2/financial: Must retain audit logs 7 years

**Resolution**:
- Pseudonymization satisfies both
- User identity removed (GDPR)
- Action record remains (audit)
- Legal basis: legitimate interest for security

---

## Chapter 14: Compliance Framework

### 14.1 SOC2 Approach

**SOC2 Trust Service Criteria**:

| Criteria | Our approach | Difficulty |
|----------|--------------|------------|
| **Security** | Encryption, access control, monitoring | Medium |
| **Availability** | Multi-AZ, DR, SLAs | Medium |
| **Processing Integrity** | Hash chains, validation | Medium |
| **Confidentiality** | Encryption, access control | Medium |
| **Privacy** | Data minimization, consent | **Hard** |

**Hardest control points**:

1. **CC6.1 - Logical access**: Proving separation of customer data
2. **CC7.2 - System monitoring**: Complete audit trail for our systems
3. **PI1.1 - Privacy notice**: Ensuring customers inform their employees
4. **CC9.2 - Vendor management**: Our own supply chain

### 14.2 Penetration Testing

| Aspect | Approach |
|--------|----------|
| **Who** | Third-party firm (annual), bug bounty (continuous) |
| **Frequency** | Annual comprehensive, quarterly automated |
| **Scope** | Full application, API, infrastructure |
| **Results** | Fix critical in 7 days, high in 30 days |
| **Reports** | Available to enterprise customers under NDA |

### 14.3 Vulnerability Disclosure

**VDP program**:

```
Disclosure policy:
- security@mandate.dev for reports
- Response within 48 hours
- Fix timeline: Critical 7d, High 30d, Medium 90d
- Safe harbor for good-faith researchers
- Hall of fame for valid reports
- No bounties initially (consider later)
```

### 14.4 Supply Chain Security

**Dependency management**:

| Practice | Implementation |
|----------|----------------|
| **SBOM** | Generated on every build, stored with release |
| **Dependency scanning** | Dependabot, Snyk in CI |
| **Pinned versions** | Lockfiles committed, no floating versions |
| **Review new deps** | Security review for new dependencies |
| **Update cadence** | Security patches: immediate; others: weekly |

**SBOM format**: SPDX or CycloneDX, available to customers on request.

### 14.5 Zero-Day Response

```
Zero-day discovered:
├── Hour 0-4: Assess impact on our systems
├── Hour 4-8: Develop/test patch or mitigation
├── Hour 8-24: Deploy fix
├── Hour 24-48: Customer notification if affected
└── Day 7: Postmortem published

Customer communication:
- Affected: Direct notification within 24h
- Not affected: Status page update
- Details: What, impact, our response
```

---

## Chapter 15: Secrets Management

### 15.1 Our Secret Management

| Secret type | Storage | Rotation |
|-------------|---------|----------|
| **Database credentials** | AWS Secrets Manager | 90 days |
| **API keys (internal)** | AWS Secrets Manager | 90 days |
| **Encryption keys** | AWS KMS | Annual |
| **Customer API keys** | Hashed in DB, full in Secrets Manager | Customer-controlled |

### 15.2 Customer Secrets in Logs

**Problem**: Customer agent logs include secrets accidentally.

**Our defense layers**:

```
Layer 1: Pattern-based redaction (regex)
├── API keys, passwords, tokens
├── Credit cards, SSNs
└── Known secret formats (AWS, GitHub, etc.)

Layer 2: Entropy detection
├── High-entropy strings flagged
└── Review before storage

Layer 3: Customer-defined patterns
├── Custom regex for their secrets
└── Field-level exclusions

Layer 4: Post-hoc redaction
├── Customer reports missed secret
└── We redact retroactively
```

### 15.3 Secret Redaction Explainability

**When we redact**:
```
Original: "API key: sk-1234567890abcdef"
Redacted: "[REDACTED:api_key:sha256:a1b2c3...]"

Explanation available:
- Redaction type: api_key
- Pattern matched: sk-[a-z0-9]{16}
- Hash: For deduplication/correlation
- Timestamp: When redacted
```

**User can see**: "This was redacted because it matched API key pattern"

### 15.4 Mis-Redaction Recovery

**If we redact too aggressively**:
```
Compliance mode:
├── Original stored separately (encrypted)
├── Access requires: reason + approval
├── 24-hour retrieval window
└── After 24h: original deleted

Non-compliance mode:
├── Original not stored
├── Redaction is permanent
└── Customer advised to re-send if needed
```

### 15.5 BYOK (Bring Your Own Key)

**Enterprise feature**:

```
Customer provides:
├── KMS key ARN (AWS) or key reference (GCP/Azure)
└── IAM role for Mandate to use key

Data encryption:
├── Events encrypted with customer's key
├── We cannot read without their KMS
├── Customer can revoke access anytime

Implications:
├── Customer revokes = their data inaccessible
├── No recovery without their key
├── They own compliance for key management
```

### 15.6 Key Rotation

**Our keys**:
- Automatic rotation via KMS
- No downtime, seamless re-encryption
- Old key versions retained for decryption

**Customer keys (BYOK)**:
- Customer manages rotation
- We support multiple key versions
- Gradual re-encryption on access

---

## Chapter 16: Access Control

### 16.1 Permission Revocation Timing

**Target**: Permission changes effective within 60 seconds.

**Implementation**:
```
Permission revoked:
├── Database updated immediately
├── Cache invalidated (Redis pub/sub)
├── Active sessions checked on next request
├── WebSocket connections notified
└── Worst case: 60s until full propagation
```

### 16.2 Offboarding / Departed Employees

**When employee leaves customer org**:

```
Integration with HR system (if available):
├── Employee marked inactive
├── Their sessions terminated
├── Their ownership transferred (or flagged)
├── Their future actions blocked

Without HR integration:
├── Customer admin removes user
├── Same process as above
└── Weekly reminder: "Review user list"

Grace period:
├── 7 days: User can't login but ownership preserved
├── After 7 days: Ownership must be reassigned
└── Orphaned resources flagged
```

### 16.3 Token Compromise Response

**If customer's API token is leaked**:

```
Detection:
├── Anomalous usage patterns
├── Customer reports
├── Third-party notification (GitHub secret scanning)

Response:
├── Immediate token revocation
├── Active connections terminated
├── Audit: What was accessed with this token?
├── Customer notification
└── New token generation guidance
```

**Can we help customers detect their own token leaks?**
- We monitor for anomalies
- Alert on: unusual IP, volume spike, geographic anomaly
- Customer can set custom alerts

---

## Chapter 17: Internal Access Control

### 17.1 Zero-Trust for Our Employees

**Principle**: No Mandate employee has standing access to customer data.

**Implementation**:

| Access type | Process |
|-------------|---------|
| **Production infrastructure** | MFA + reason + approval + time-limited |
| **Customer data** | Break-glass only, all access logged |
| **Logs with PII** | Redacted by default, unredacted requires approval |
| **Database direct access** | Never in production; read replica for debugging |

### 17.2 Support Access

**When support needs to see customer data**:

```
Process:
1. Customer opens ticket
2. Support requests access with ticket ID
3. Approval required (another team member)
4. Access granted for: specific customer, specific time (max 4h)
5. All queries logged
6. Customer notified: "Support accessed your data for ticket #123"
7. Access auto-expires

What support can see:
├── Events (redacted by default)
├── Configuration
├── Metrics
└── NOT: unredacted secrets, raw payloads (without escalation)
```

### 17.3 Break-Glass for Support

**Emergency support access**:

```
Scenario: Production down, need to debug customer-specific issue

Process:
1. Declare emergency
2. Access granted immediately
3. All actions logged verbosely
4. Notify all admins: "Break-glass by X"
5. Post-incident review required
6. Customer notified within 24h

Abuse prevention:
├── All break-glass reviewed weekly
├── >2 per month triggers investigation
├── False emergencies = policy violation
```

### 17.4 Customer Notification of Access

**Standard notification**:
```
Email to customer admin:
Subject: Mandate Support Access Notification

On [date], support engineer [name] accessed your account
to resolve support ticket #[number].

Access duration: [time]
Data accessed: [summary]
Reason: [ticket description]

If you have questions, reply to this email.
```

---

## Chapter 18: Legal and Evidence

### 18.1 Evidence Chain Integrity

**For legal/forensic use**:

| Requirement | Implementation |
|-------------|----------------|
| **Immutability** | Append-only log, no updates/deletes |
| **Tamper evidence** | Hash chain, each event references previous |
| **Timestamps** | RFC 3161 timestamp (enterprise option) |
| **Chain of custody** | Audit log of all access |

### 18.2 Timestamp Signing

**Enterprise option**: RFC 3161 trusted timestamps

```
Event:
├── Our timestamp (server clock)
├── External TSA timestamp (trusted third party)
└── Combined signature

This proves: Event existed at claimed time
```

### 18.3 eDiscovery Export

**Export format**:
```
Customer requests: "Export all data for legal hold"

We provide:
├── Complete event log (JSON or CSV)
├── Integrity verification (hash manifest)
├── Chain of custody documentation
├── Format compatible with: Relativity, Concordance, etc.
```

### 18.4 Labor Dispute Risk

**Scenario**: Our records show employee made error → Used in termination → Lawsuit

**Our protections**:

1. **ToS language**: "Not for employment decisions"
2. **Blameless framing**: System shows "what," not "fault"
3. **Context inclusion**: Always show surrounding events
4. **Customer responsibility**: They decide how to use data

**If subpoenaed**:
- We comply with valid legal process
- We notify customer if legally permitted
- We provide raw data, not interpretation

### 18.5 Blameless Mode Details

**Implementation**:

```yaml
blameless_mode:
  public_attribution: "team"   # UI shows team only
  private_attribution: "individual"  # Audit log has full detail
  access_control:
    individual_attribution:
      - role: "admin"
      - role: "legal"
      - purpose: "incident_investigation"
      - requires: "documented_reason"
```

**Does blameless hurt audit value?**
- Audit is preserved (just restricted access)
- Individual attribution available when legally needed
- Day-to-day use emphasizes team
- Postmortems focus on systems, not people

**Explaining to customers**:
```
"Blameless mode helps your team adopt the system without fear.
Full attribution is preserved for compliance and serious investigations.
Daily use focuses on 'what happened' not 'who to blame.'
This is how elite engineering teams operate."
```

---

## Chapter 19: AI and Regulatory

### 19.1 LLM Usage in Our Product

**Current state**: We do NOT use LLM for core functionality.

**What we don't use LLM for**:
- Routing decisions
- Attribution
- Incident classification
- Automated suggestions

**What we might use LLM for** (future, opt-in):
- Postmortem draft generation
- Natural language search
- Summarization

**Why no LLM for core functions**:
- Explainability: Rules are auditable, LLM isn't
- Reliability: Rules are deterministic
- Security: No prompt injection risk
- Trust: Customers can verify logic

### 19.2 Prompt Injection (If We Add LLM)

**If we add LLM features**:

```
Isolation:
├── LLM operates on sanitized summaries, not raw events
├── LLM output is suggestion only, not action
├── User confirms before any LLM-suggested action
├── LLM has no write access to system

Input sanitization:
├── Strip potential injection patterns
├── Limit input length
├── Separate user content from instructions
```

### 19.3 Smart Routing Without LLM

**How we achieve intelligent routing without LLM**:

| Capability | Implementation |
|------------|----------------|
| **Pattern matching** | Configurable rules, regex |
| **Historical learning** | Statistics, not ML |
| **Contextual routing** | Rule conditions (time, actor, resource) |
| **Escalation logic** | Explicit chains, timeout-based |

### 19.4 EU AI Act

**Our assessment**:

| Question | Answer |
|----------|--------|
| Are we an AI system? | No (rule-based, not ML) |
| Do we deploy AI? | Not currently |
| High-risk category? | No (not in Annex III) |
| Transparency requirements? | N/A currently |

**If we add ML/LLM**:
- Likely "limited risk" category
- Transparency requirements apply
- Document: purpose, limitations, human oversight

### 19.5 Common Customer Questions

**"Are you an agent monitoring system?"**
```
Response: "We're a coordination system. We help the right humans 
respond to agent actions. We don't monitor agents for compliance 
or restrict what they can do. Think of us like PagerDuty for agents,
not IAM for agents."
```

**"Are you doing surveillance?"**
```
Response: "We track actions on production systems for incident response,
not employee behavior. We don't measure productivity, create rankings,
or monitor personal activity. Our ToS prohibits surveillance use."
```

**"Do you store our source code?"**
```
Response: "No. We store event metadata: who did what action on which 
resource. We don't store file contents, request bodies, or response 
payloads unless you explicitly configure payload logging."
```

**"Will you train on our data?"**
```
Response: "No. We contractually commit to not using customer data 
for training any models. This is in our DPA. We can add specific 
language to your contract if needed."
```

**Zero-training commitment**: Yes, written into DPA and available as contract addendum.

---

## Chapter 20: Incident Response (Our Own)

### 20.1 Our Incident Classification

| Severity | Definition | Response time |
|----------|------------|---------------|
| **SEV1** | Customer data breach, complete outage | 15 min |
| **SEV2** | Partial outage, data integrity issue | 1 hour |
| **SEV3** | Degraded performance, feature broken | 4 hours |
| **SEV4** | Minor issue, workaround available | 24 hours |

### 20.2 Data Breach Response

**72-hour timeline** (GDPR requirement):

```
Hour 0-4: 
├── Detect and confirm breach
├── Contain (stop ongoing access)
├── Begin impact assessment

Hour 4-24:
├── Determine scope (which customers, what data)
├── Preserve evidence
├── Draft notifications

Hour 24-48:
├── Notify affected customers directly
├── Notify regulators (if required)
├── Publish status page update

Hour 48-72:
├── Complete notifications
├── Provide detailed guidance to customers
├── Begin formal investigation

Post-72h:
├── Ongoing updates
├── Root cause analysis
├── Remediation
├── Public postmortem
```

### 20.3 Our Postmortems

**Who writes**: Incident commander + engineering lead

**Format**:
```
# Incident Postmortem: [Title]

## Summary
- Duration: X hours
- Impact: Y customers, Z requests failed
- Root cause: [one sentence]

## Timeline
[Detailed timeline]

## Root Cause Analysis
[5 Whys or similar]

## Impact
[Quantified]

## Resolution
[What we did]

## Lessons Learned
[What we'll change]

## Action Items
| Item | Owner | Due date | Status |
```

**Publication**:
- Internal: Always
- Customer-facing: For SEV1/SEV2
- Public blog: For significant incidents

### 20.4 Preventing Our Own Repeat Incidents

**We use our own product philosophy**:

1. **Every postmortem → action items**: Required, tracked
2. **Action items → rules**: Where applicable
3. **Monthly review**: "What patterns are we seeing?"
4. **Blameless culture**: Focus on systems, not people

---

## Chapter 21: Sales and Compliance Support

### 21.1 Compliance Questionnaire Acceleration

**Pre-built responses for common frameworks**:
- SOC2 mapping document
- GDPR compliance summary
- HIPAA applicability statement (usually N/A)
- Security architecture overview
- Vendor risk assessment template

**Self-service portal** (enterprise):
- Download compliance documents
- Request pen test reports
- View current certifications
- Generate custom compliance report

### 21.2 Security Team Conversations

**"Are you DLP?"**
```
Response: "No. DLP prevents data exfiltration. We route incident 
notifications to the right people. We complement DLP—if your DLP 
detects something, we can help route the response."
```

**"Are you SIEM?"**
```
Response: "No. SIEM aggregates security logs for analysis. We focus 
on operational coordination for agent actions. We can send events 
to your SIEM for correlation."
```

**"Are you SOAR?"**
```
Response: "Partially overlapping. SOAR automates security responses. 
We coordinate human responses to agent actions. We're more 'who should
respond' than 'automate the response.'"
```

### 21.3 Existing Splunk/Sentinel

**Our position**: Complement, not replace.

```
Their SIEM                          Us
─────────────────────────────────────────────────
Aggregates logs                     Routes notifications
Security-focused                    Operations-focused
Analysis after the fact            Real-time coordination
Analyst-facing                     On-call engineer-facing

Integration:
├── We send events to their SIEM (optional)
├── They send alerts to us for routing (optional)
└── Different tools for different jobs
```

### 21.4 Penetration Test Reports

**Availability**:
- Summary: Available on request
- Full report: Under NDA for enterprise customers
- Scope: Annual third-party assessment
- Remediation status: Included

### 21.5 Security Architecture Diagram

**Provided on request**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Internet                                                       │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────┐                                                   │
│  │   WAF   │ (AWS WAF / Cloudflare)                           │
│  └────┬────┘                                                   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐                  │
│  │   ALB   │────▶│   API   │────▶│  Workers │                  │
│  └─────────┘     └────┬────┘     └────┬────┘                  │
│                       │               │                         │
│            ┌──────────┼───────────────┘                        │
│            │          │                                         │
│            ▼          ▼                                         │
│       ┌─────────┐ ┌─────────┐                                  │
│       │Postgres │ │  Redis  │  (Encrypted at rest)            │
│       │ (RDS)   │ │(ElastiC)│                                  │
│       └─────────┘ └─────────┘                                  │
│                                                                 │
│  All traffic: TLS 1.3                                          │
│  All storage: AES-256                                          │
│  All access: Logged                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 21.6 On-Premises / Air-Gap

**We support** (enterprise tier):

```
Deployment options:
├── SaaS (default)
├── Customer VPC (bring your own AWS/GCP/Azure)
├── On-premises Kubernetes
└── Air-gapped (no external connections)

Air-gap specifics:
├── We provide: Container images, Helm charts
├── Customer provides: Infrastructure, database
├── Updates: Manual (customer downloads releases)
├── Support: Async (no remote access)
├── Licensing: Offline license file
```

---

## Chapter 22: Government and Export

### 22.1 Government Customers

**Our position**: Selective, with extra diligence.

**We will serve**:
- Democratic governments with rule of law
- Non-sensitive use cases (IT operations)
- Where we can meet compliance requirements

**We won't serve**:
- Authoritarian regimes
- Military/intelligence (without extensive review)
- Where use could enable human rights violations

### 22.2 Export Control

**ITAR/EAR assessment**:
- Our software: Likely EAR99 (no restriction)
- Encryption: Standard (not controlled)
- We don't handle controlled technical data

**Sanctions compliance**:
- We screen customers against OFAC SDN list
- We block access from sanctioned countries
- Standard for US-based SaaS

### 22.3 Special Government Requirements

| Requirement | Our approach |
|-------------|--------------|
| FedRAMP | Not currently; evaluate if demand |
| StateRAMP | Not currently |
| ITAR | Not applicable (no controlled data) |
| CJIS | Not applicable (no criminal justice data) |

---

# APPENDIX: Compliance Summary

## Quick Reference

| Framework | Status | Notes |
|-----------|--------|-------|
| SOC2 Type I | Planned Month 12 | Policies documented |
| SOC2 Type II | Planned Month 18 | 6-month audit |
| ISO 27001 | Planned Month 24 | Full ISMS |
| GDPR | Compliant | DPA available |
| CCPA | Compliant | Privacy policy updated |
| HIPAA | Not applicable | We don't handle PHI |
| PCI DSS | Not applicable | We don't handle cardholder data |
| FedRAMP | Not planned | Evaluate on demand |

---

**Document Version**: 5.5 Security Complete
**Last Updated**: January 2026
**Status**: Ready for Security Review
