/**
 * Quick Analysis Mode Module
 * Specific rules for /analyze command (governance-focused)
 */

export const QUICK_MODE_RULES = `# QUICK ANALYSIS MODE

This is a **governance-focused** analysis mode. 

## Focus Areas
- README, LICENSE, CONTRIBUTING quality
- CI/CD pipeline presence and configuration
- Dependency management (Dependabot/Renovate)
- Issue/PR templates
- Security policy

## What NOT to Do
- **DO NOT** read source code files
- **DO NOT** analyze code architecture
- **DO NOT** review implementation details
- **DO NOT** call \`pack_repository\` tool

## Expected Outcome
A concise health report focused on:
- Project governance and documentation
- CI/CD automation
- Community contribution readiness
- Basic security hygiene (policies, not code)`;

export const QUICK_BEGIN_ANALYSIS = `# BEGIN ANALYSIS

State your analysis plan briefly, then execute systematically:
1. Collect metadata
2. Index files and detect stack
3. Read files in priority order (max 20 reads)
4. Generate findings with evidence
5. Calculate scores
6. Output formatted report`;
