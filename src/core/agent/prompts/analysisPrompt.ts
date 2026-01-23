/**
 * Analysis Prompt Builder
 * Single Responsibility: Build the user prompt for analysis requests
 */

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface AnalysisPromptOptions {
  repoUrl: string;
  deep?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Build the analysis prompt for a repository
 */
export function buildAnalysisPrompt(options: AnalysisPromptOptions): string {
  const { repoUrl, deep = false } = options;

  const deepInstructions = deep
    ? `

**PHASE 6 — DEEP ANALYSIS (ENABLED)**
Output: "**PHASE 6 — DEEP ANALYSIS**" then:
8. After completing standard analysis, call \`pack_repository\` with mode="deep"
9. Analyze the consolidated source code for:
   - Code patterns and architecture
   - Potential bugs or anti-patterns
   - Test coverage indicators
   - Code quality issues
10. Add findings under "🔬 Deep Analysis" section in report`
    : "";

  return `Analyze the GitHub repository: ${repoUrl}

## CRITICAL OUTPUT REQUIREMENT
Before executing EACH phase, you MUST output the phase header. This is mandatory for proper report capture.

Execute the analysis following the phased approach:

**PHASE 1 — RECONNAISSANCE**
First, output: "**PHASE 1 — RECONNAISSANCE**" then:
1. Call \`get_repo_meta\` to collect repository metadata and detect primary language
2. Call \`list_repo_files\` to index the file tree and detect repository type

**PHASE 2 — STACK DETECTION**
Output: "**PHASE 2 — STACK DETECTION**" then:
3. From metadata.languages and file tree, identify:
   - Primary technology stack (Node, Python, Go, Rust, Java, etc.)
   - Repository type (monorepo, single-package, library, application)
   - Complexity level (trivial <10 files, standard, large >500 files)

**PHASE 3 — STRATEGIC FILE READING**
Output: "**PHASE 3 — STRATEGIC FILE READING**" then:
4. Read files in priority order (max 20 reads):
   - Priority 1: README.md, LICENSE, CONTRIBUTING.md, SECURITY.md
   - Priority 2: .github/workflows/*.yml (up to 3), dependabot.yml
   - Priority 3: Stack manifest (package.json, pyproject.toml, go.mod, Cargo.toml, etc.)
   - Priority 4: Quality configs (linter, formatter, test config) — only if detected
   
5. For each 404 response, record as evidence of missing file

**PHASE 4 — ANALYSIS**
Output: "**PHASE 4 — ANALYSIS**" then:
6. Apply P0/P1/P2 criteria strictly based on:
   - Repository type and complexity
   - Detected stack requirements
   - Evidence collected

**PHASE 5 — REPORT**
Output: "**PHASE 5 — REPORT**" then:
7. Generate the structured health report with:
   - Overall score and category breakdown
   - Findings grouped by priority with evidence
   - Actionable next steps${deepInstructions}

Begin the analysis now by outputting "**PHASE 1 — RECONNAISSANCE**" and then calling the tools.`;
}
