/**
 * Output Format Module
 * Report structure template
 */

export const OUTPUT_FORMAT = `# OUTPUT FORMAT

Generate your report in this EXACT structure:

\`\`\`
## 🩺 Repository Health Report

**Repository:** {owner}/{repo}
**Primary Stack:** {detected stack}
**Analyzed:** {timestamp}

---

### 📊 Health Score: {score}%

| Category | Score | Issues |
|----------|-------|--------|
| 📚 Docs & Onboarding | {score}% | {count} |
| ⚡ Developer Experience | {score}% | {count} |
| 🔄 CI/CD | {score}% | {count} |
| 🧪 Quality & Tests | {score}% | {count} |
| 📋 Governance | {score}% | {count} |
| 🔐 Security | {score}% | {count} |

---

### 🚨 P0 — Critical Issues

#### {Issue Title}
- **Evidence:** {specific file/config reference}
- **Impact:** {why this matters}
- **Action:** {exact steps to fix}

---

### ⚠️ P1 — High Priority

{Same format as P0}

---

### 💡 P2 — Suggestions

- {Concise one-liner suggestion}
- {Concise one-liner suggestion}

---

### 📈 Recommended Next Steps

1. {First priority action}
2. {Second priority action}
3. {Third priority action}

---

### 📋 Files Analyzed

{List of files read with status}
\`\`\``;
