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

8. Call \`pack_repository\` with mode="deep" to get consolidated source code

9. Analyze the source code comprehensively for:

   **Architecture & Design:**
   - Project structure and organization (is it modular? separation of concerns?)
   - Design patterns used (or missing)
   - Component coupling and cohesion
   - Dependency injection patterns
   - State management approach
   
   **Code Quality:**
   - Code duplication / DRY violations
   - Function/method complexity (long functions, deep nesting)
   - Naming conventions and consistency
   - Magic numbers/strings that should be constants
   - Dead code or unused exports
   - TODO/FIXME/HACK comments indicating technical debt
   
   **Error Handling:**
   - Exception handling patterns (try/catch coverage)
   - Error propagation strategy
   - User-facing error messages quality
   - Null/undefined safety
   
   **Security Concerns:**
   - Input validation gaps
   - Potential injection vulnerabilities
   - Hardcoded secrets or credentials
   - Insecure API usage patterns
   
   **Performance:**
   - Potential memory leaks (unclosed resources)
   - N+1 query patterns
   - Unnecessary re-renders (React) or recomputation
   - Large bundle/import concerns
   
   **Testability:**
   - Code structure that hinders testing
   - Missing abstraction layers
   - Global state that complicates mocking
   
   **Best Practices per Stack:**
   - For TypeScript: proper typing, no \`any\` abuse, strict null checks
   - For React: proper hooks usage, component organization
   - For Node.js: async patterns, stream handling
   - For Python: type hints, docstrings, PEP8 compliance
   - For Go: error handling, goroutine leaks
   - For Rust: ownership patterns, unsafe usage

10. Generate detailed findings in the "🔬 Deep Analysis" section with:
    - **Code Architecture Review** - Strengths and areas for improvement
    - **Potential Issues** - With code snippets and line references
    - **Refactoring Suggestions** - Specific, actionable improvements
    - **Code Quality Summary** table

**IMPORTANT for Deep Analysis:**
- Be SPECIFIC: quote actual code patterns you found
- Provide code examples showing the issue AND the fix
- Prioritize actionable insights over exhaustive listing
- Connect findings to real impact (maintainability, bugs, performance)`
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
