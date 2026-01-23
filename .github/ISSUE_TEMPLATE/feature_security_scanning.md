---
name: "🛡️ Security Scanning Features"
about: "Track implementation of security scanning capabilities"
title: "[Feature] Security Scanning & Vulnerability Analysis"
labels: enhancement, security, roadmap
assignees: glaucia86
---

## 🎯 Feature Request: Security Scanning Capabilities

### Overview

Enhance Repo Doctor with security scanning features to provide comprehensive vulnerability analysis alongside health governance checks.

### 📋 Proposed Features

#### Phase 1: v2.1.0 (Short-term)

- [ ] **Dependency Audit Integration**
  - `npm audit --json` for Node.js projects
  - `pip-audit --format json` for Python projects  
  - `cargo audit --json` for Rust projects
  - Parse and report vulnerabilities with severity levels

- [ ] **Secrets Scanning (Basic)**
  - Regex patterns for common secrets:
    - AWS Access Keys (`AKIA...`)
    - GitHub Tokens (`ghp_...`, `gho_...`)
    - Generic API keys and passwords
  - Report as P0 security findings

#### Phase 2: v3.0.0 (Long-term)

- [ ] **Gitleaks Integration**
  - Full secrets detection via [gitleaks](https://github.com/gitleaks/gitleaks)
  - Historical commit scanning option

- [ ] **SBOM Generation**
  - Generate Software Bill of Materials
  - Support for Syft and CycloneDX formats

- [ ] **Snyk/Trivy Integration** (Optional)
  - API-based vulnerability scanning
  - Requires user-provided API tokens

- [ ] **CodeQL Support**
  - Static analysis for code vulnerabilities
  - Integration with GitHub Code Scanning

### 🔧 Technical Approach

#### New Tool Definition

```typescript
const auditDependencies = defineTool("audit_dependencies", {
  description: "Runs security audit on project dependencies",
  parameters: {
    type: "object",
    properties: {
      repoUrl: { type: "string" },
      packageManager: { type: "string", enum: ["npm", "pip", "cargo", "auto"] }
    },
    required: ["repoUrl"]
  },
  handler: async ({ repoUrl, packageManager }) => {
    // Detect package manager if "auto"
    // Clone repo temporarily (or use packed content)
    // Run appropriate audit command
    // Parse JSON output
    // Return structured vulnerability report
  }
});

const scanSecrets = defineTool("scan_secrets", {
  description: "Scans repository content for exposed secrets",
  parameters: {
    type: "object", 
    properties: {
      content: { type: "string", description: "Packed repository content" }
    },
    required: ["content"]
  },
  handler: async ({ content }) => {
    // Apply regex patterns
    // Return findings with file locations
    // Flag as securityFlags.secrets = true
  }
});
```

### 📊 New Report Section

```markdown
### 🔐 Security Scan Results

#### Vulnerabilities Found: 3

| Severity | Package | Version | Issue | Fix |
|----------|---------|---------|-------|-----|
| 🔴 Critical | lodash | 4.17.20 | Prototype Pollution | Upgrade to 4.17.21 |
| 🟠 High | axios | 0.21.0 | SSRF | Upgrade to 0.21.1 |
| 🟡 Medium | minimist | 1.2.5 | Prototype Pollution | Upgrade to 1.2.6 |

#### Secrets Detected: 1 🚨

| Type | File | Line | Status |
|------|------|------|--------|
| AWS Access Key | .env.example | 15 | ⚠️ Exposed |

**Action:** Rotate compromised credentials immediately!
```

### ✅ Acceptance Criteria

- [ ] `audit_dependencies` tool implemented and tested
- [ ] `scan_secrets` tool implemented with regex patterns
- [ ] New findings appear in health report under Security category
- [ ] P0 priority for critical vulnerabilities and exposed secrets
- [ ] Documentation updated with new features
- [ ] Tests for vulnerability parsing

### 🔗 Related

- Inspired by community feedback on Twitter
- Complements existing governance-focused security checks

### 💡 Notes

- Current security analysis is **governance-focused** (SECURITY.md, Dependabot config)
- These features add **vulnerability-focused** analysis
- Should remain optional/non-blocking for repos without package managers

---

**Priority:** High  
**Effort:** Medium (v2.1.0) / High (v3.0.0)  
**Impact:** Significant value-add for users

