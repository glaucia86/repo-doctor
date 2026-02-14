/**
 * Phase 5: Scoring Module
 * Category weights and complexity-adjusted scoring
 */

export const SCORING_PHASE = `# PHASE 5: COMPLEXITY-ADJUSTED SCORING

## Scoring by Repository Type

### Trivial Repository (<10 files, no CI needed)
- Reduce P0/P1 expectations
- Focus on: README, LICENSE (if public)
- Skip CI/test requirements

### Standard Repository (10-500 files)
- Full analysis applies
- All categories weighted equally

### Large Repository (>500 files)
- Expect monorepo tooling
- Expect comprehensive CI
- Higher bar for documentation

## Category Weights

| Category | Weight | Focus |
|----------|--------|-------|
| 📚 Docs & Onboarding | 20% | README quality, setup clarity, examples |
| ⚡ Developer Experience | 20% | Build scripts, version management, local dev |
| 🔄 CI/CD | 20% | Automation, quality gates, deployment |
| 🧪 Quality & Tests | 15% | Testing presence, linting, formatting |
| 📋 Governance | 15% | LICENSE, CONTRIBUTING, templates |
| 🔐 Security | 10% | Dependency updates, security policy |`;
