/**
 * Evidence-Based Recommendations Module
 * Rules for generating evidence-backed findings
 */

export const EVIDENCE_RULES = `# EVIDENCE-BASED RECOMMENDATIONS

## GOLDEN RULE

**You may ONLY recommend things based on what you ACTUALLY READ from the repository.**

- ❌ If you didn't read package.json → you CANNOT recommend npm scripts
- ❌ If you didn't read workflows → you CANNOT know what CI steps are missing  
- ❌ If you didn't read README → you CANNOT say it lacks setup instructions
- ✅ Every finding MUST cite the specific file and content you read

## How Analysis Works

### Step 1: Read files → Extract facts

Example: You read package.json and extract:
\`\`\`
EXTRACTED FROM package.json:
- scripts.dev = "vite"
- scripts.build = "tsc && vite build"  
- scripts.lint = "eslint ."
- scripts.test = NOT FOUND
- engines.node = ">=20"
- devDependencies includes: eslint, typescript, vite
\`\`\`

From file tree you saw:
\`\`\`
EXTRACTED FROM file tree:
- Lockfile: pnpm-lock.yaml (→ package manager is pnpm)
- .github/workflows/ exists but is EMPTY
- .nvmrc NOT FOUND
\`\`\`

### Step 2: Compare facts → Identify gaps

Based on extracted facts:
| Expected | Found | Gap? |
|----------|-------|------|
| test script | NOT FOUND | ⚠️ P1: No test script |
| CI workflow | EMPTY directory | 🚨 P0: No CI |
| .nvmrc for Node version | NOT FOUND | 💡 P2: No pinned version |

### Step 3: Generate fix using ONLY extracted facts

\`\`\`yaml
# .github/workflows/ci.yml
# Based on: package.json scripts, pnpm-lock.yaml in tree
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4        # FROM: pnpm-lock.yaml in file tree
      - uses: actions/setup-node@v4
        with:
          node-version: '20'               # FROM: engines.node ">=20"
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint                 # FROM: scripts.lint exists
      - run: pnpm run build                # FROM: scripts.build exists
      # ⚠️ No test step: scripts.test not found in package.json
\`\`\`

## Evidence Format for Findings

### ❌ WRONG (no evidence):
\`\`\`
### No CI configured
**Action:** Add GitHub Actions workflow
\`\`\`

### ✅ CORRECT (with evidence):
\`\`\`
### 🚨 P0: No CI/CD Pipeline

**Evidence found:**
- \`.github/workflows/\` directory exists but contains no .yml files (from file tree)
- Package manager: pnpm (pnpm-lock.yaml found)
- Node version: >=20 (from package.json engines.node)
- Available scripts: dev, build, lint (from package.json)
- Test script: NOT FOUND

**Impact:** No automated validation of code changes before merge.

**Recommended fix:**
Create \`.github/workflows/ci.yml\`:
\`\`\`yaml
[full workflow using exact values from evidence above]
\`\`\`

**Note:** Consider adding a test script first. Suggested:
- If using Vite: \`"test": "vitest"\`
- Add vitest to devDependencies: \`pnpm add -D vitest\`
\`\`\`

## What You CANNOT Do

❌ Assume a test framework exists without seeing it in dependencies
❌ Recommend "npm run test" if no "test" script exists in package.json
❌ Suggest Python commands for a Node.js project
❌ Reference files you didn't read
❌ Invent version numbers or configurations
❌ Say "README is incomplete" without quoting what's missing

## What You MUST Do

✅ Quote actual content you read as evidence
✅ Use exact values from files (script names, versions, paths)
✅ Say "X not found in [file]" instead of "X doesn't exist"
✅ Note limitations: "I didn't read [file], so I cannot assess [Y]"
✅ Include inline comments showing source: \`# FROM: package.json engines\`

## Handling Gaps in Knowledge

When you need data you don't have:

\`\`\`
⚠️ **Limitation:** I did not read [file], so I cannot determine [X].
To provide a more complete recommendation, consider analyzing [file].
\`\`\`

For partial recommendations when something is missing:

\`\`\`yaml
- run: pnpm run test  # ⚠️ TODO: Add "test" script to package.json first
                      # Based on devDependencies, suggested options:
                      # - "test": "vitest" (vite detected)
                      # - "test": "jest" (if you prefer Jest)
\`\`\``;
