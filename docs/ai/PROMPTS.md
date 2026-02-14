# Prompt System — Repo Doctor

## Architecture

The system prompt is composed from modular pieces following Open/Closed Principle.

```
src/application/core/agent/prompts/
├── base/                    # Base modules
│   ├── securityDirective.ts # Prompt injection protection
│   ├── expertiseProfile.ts  # Agent capabilities
│   ├── reconnaissance.ts    # Phase 1: metadata
│   ├── languageDetection.ts # Phase 2: stack detection
│   ├── strategicReading.ts  # Phase 3: file priority
│   ├── analysisCriteria.ts  # Phase 4: P0/P1/P2
│   ├── scoring.ts           # Phase 5: weights
│   ├── evidenceRules.ts     # Fact-based rules
│   ├── outputFormat.ts      # Phase 6: report
│   ├── constraints.ts       # Boundaries
│   └── errorHandling.ts     # Recovery
├── modes/
│   ├── quick.ts             # Quick analysis mode
│   └── deep.ts              # Deep analysis mode
└── composers/
    └── systemPromptComposer.ts  # Main composition API
```

## Usage

```typescript
import { getSystemPrompt, composeSystemPrompt } from "./prompts/composers/systemPromptComposer.js";

// Pre-built prompts
const quickPrompt = getSystemPrompt("quick");  // ~350 lines
const deepPrompt = getSystemPrompt("deep");    // ~550 lines

// Custom composition
const customPrompt = composeSystemPrompt({
  mode: "deep",
  additionalRules: "Custom rules",
  maxFileReads: 30,
});
```

## Analysis Phases

| Phase | Module | Purpose |
|-------|--------|---------|
| 1 | reconnaissance | Call get_repo_meta, list_repo_files first |
| 2 | languageDetection | Detect stack from files/languages |
| 3 | strategicReading | Priority file reading (max 20) |
| 4 | analysisCriteria | P0/P1/P2 classification |
| 5 | scoring | Category weights calculation |
| 6 | outputFormat | Structured report generation |

## Multi-Language Detection

| Signal Files | Stack |
|--------------|-------|
| `package.json`, `tsconfig.json` | Node.js/TypeScript |
| `pyproject.toml`, `setup.py` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `pom.xml`, `build.gradle` | Java/Kotlin |
| `*.csproj`, `*.sln` | .NET/C# |
| `Gemfile` | Ruby |

## Scoring Weights

```typescript
const CATEGORY_WEIGHTS = {
  docs: 0.20,        // 20%
  dx: 0.20,          // 20%
  ci: 0.20,          // 20%
  tests: 0.15,       // 15%
  governance: 0.15,  // 15%
  security: 0.10,    // 10%
};

// Deductions: P0 = -30pts, P1 = -15pts, P2 = -5pts
```

## Output Format

```markdown
## 🩺 Repository Health Report

**Repository:** {owner}/{repo}
**Primary Stack:** {detected}
**Analyzed:** {timestamp}

### 📊 Health Score: {score}%

| Category | Score | Issues |
|----------|-------|--------|
| 📚 Docs | {%} | {n} |
| ⚡ DX | {%} | {n} |
| 🔄 CI/CD | {%} | {n} |
| 🧪 Tests | {%} | {n} |
| 📋 Governance | {%} | {n} |
| 🔐 Security | {%} | {n} |

### 🚨 P0 — Critical
### ⚠️ P1 — High Priority
### 💡 P2 — Suggestions
```
