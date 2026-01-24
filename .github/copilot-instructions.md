# Copilot Instructions — Repo Doctor

## Project Overview

Repo Doctor is an **Agentic CLI Tool** built with the [GitHub Copilot SDK](https://github.com/github/copilot-sdk). It analyzes GitHub repositories for health issues across 6 categories: docs, DX, CI/CD, tests, governance, and security.

## Architecture

```
src/
├── cli.ts                     # Entry point (Commander setup only, ~186 lines)
├── cli/                       # CLI Layer (SRP)
│   ├── chatLoop.ts            # Interactive REPL
│   ├── handlers/              # Command handlers (one per command)
│   │   ├── analyzeHandler.ts  # /analyze, /deep
│   │   ├── copyHandler.ts     # /copy
│   │   ├── exportHandler.ts   # /export
│   │   ├── modelHandler.ts    # /model
│   │   └── ...
│   ├── parsers/               # Input parsing utilities
│   │   ├── repoParser.ts      # GitHub URL parsing
│   │   └── reportExtractor.ts # Report extraction
│   └── state/                 # Application state
│       └── appState.ts        # IAppState interface + AppState class
├── core/
│   ├── agent.ts               # Copilot SDK session management
│   ├── repoPacker.ts          # Repomix integration for deep analysis
│   └── agent/                 # Agent modules
│       ├── prompts/           # Isolated prompts (OCP)
│       │   ├── systemPrompt.ts # SYSTEM_PROMPT (~500 lines)
│       │   └── analysisPrompt.ts
│       ├── eventHandler.ts    # Session event handling
│       ├── toolCallTracker.ts # Loop detection (tracks tool calls)
│       └── guardrails.ts      # Safety mechanisms (step limits, loop prevention)
├── providers/
│   └── github.ts              # Octokit factory, token resolution (env → gh CLI)
├── tools/                     # Individual tool files (DIP)
│   ├── repoTools.ts           # Factory (re-exports individual tools)
│   ├── getRepoMeta.ts         # get_repo_meta tool
│   ├── listRepoFiles.ts       # list_repo_files tool
│   ├── readRepoFile.ts        # read_repo_file tool
│   └── packRepository.ts      # pack_repository tool
├── types/
│   ├── schema.ts              # Zod schemas for all data types
│   └── interfaces.ts          # Shared interfaces (IAppState, etc.)
├── ui/                        # Terminal display
│   └── display/               # Modular UI components (SRP)
│       ├── messages.ts        # printSuccess, printError, etc.
│       ├── menus.ts           # Command menus, model selection
│       └── spinner.ts         # Spinner management
└── utils/
    ├── sanitizer.ts           # Security: prompt injection detection
    └── clipboard.ts           # Cross-platform clipboard
```

## Key Patterns

### 1. Copilot SDK Integration (agent.ts)

```typescript
import { CopilotClient, type SessionEvent } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();

const session = await client.createSession({
  model: "claude-sonnet-4",
  streaming: true,
  tools: repoTools({ token, maxFiles, maxBytes }),
  systemMessage: { mode: "append", content: SYSTEM_PROMPT },
  // Infinite Sessions (v0.1.18+) - auto-compacts context for long analyses
  infiniteSessions: {
    enabled: true,
    backgroundCompactionThreshold: 0.80,  // Start compaction at 80%
    bufferExhaustionThreshold: 0.95,      // Block at 95%
  },
});

session.on((event: SessionEvent) => {
  // Handle: assistant.message_delta, tool.execution_start, session.idle
  // Compaction events (v0.1.18+): session.compaction_start, session.compaction_complete
});

await session.sendAndWait({ prompt }, timeout);
```

### 2. Tool Definition Pattern (repoTools.ts)

Tools are defined using `defineTool()` from the SDK with Zod-style parameters:

```typescript
const getRepoMeta = defineTool("get_repo_meta", {
  description: "...",
  parameters: {
    type: "object",
    properties: { repoUrl: { type: "string", description: "..." } },
    required: ["repoUrl"],
  },
  handler: async (args) => { /* return JSON-serializable result */ },
});
```

### 3. Security: Content Sanitization

All file content from repositories is wrapped with delimiters and scanned for prompt injection:

```typescript
// In repoTools.ts → read_repo_file handler
const sanitized = sanitizeFileContent(rawContent, safePath);
return {
  content: sanitized.content,
  securityFlags: sanitized.suspicious ? { suspicious: true, ... } : undefined,
};
```

## Development Workflow

```bash
# Install dependencies
npm install

# Development mode (uses tsx for TypeScript)
npm run dev                    # Interactive chat mode
npm run dev -- vercel/next.js  # Direct analysis

# Build for production
npm run build                  # Compiles to dist/

# Link globally for testing
npm link
repo-doctor vercel/next.js --model gpt-4o --deep
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `/analyze <repo>` | Quick analysis via GitHub API |
| `/deep <repo>` | Deep analysis with Repomix (packs full source) |
| `/copy` | Copy last report to clipboard |
| `/export [path]` | Save report as markdown |
| `/model [name]` | Switch AI model |

## Available AI Models

The tool supports multiple models via the Copilot SDK:

| Model | Type | Best For |
|-------|------|----------|
| `gpt-4o` | Free | Balanced performance (good default) |
| `gpt-4.1` | Free | Fast analysis |
| `gpt-5-mini` | Free | Quick scans |
| `claude-sonnet-4` | Premium ⚡ | **Default** — Excellent for detailed analysis |
| `claude-sonnet-4.5` | Premium ⚡ | Enhanced reasoning |
| `claude-opus-4.5` | Premium ⚡ | Most capable (3x rate limit cost) |
| `gpt-5` | Premium ⚡ | Advanced reasoning |
| `o3` | Premium ⚡ | Deep reasoning tasks |

Models are configured in [cli.ts](src/cli.ts) in the `AVAILABLE_MODELS` array.

## Deep Analysis with Repomix

The `/deep` command uses [Repomix](https://github.com/yamadashy/repomix) to pack the entire repository into a single consolidated file for comprehensive analysis.

### How It Works

1. **Standard Analysis** (`/analyze`): Uses GitHub API to read individual files (max 20 reads)
2. **Deep Analysis** (`/deep`): Uses Repomix to clone and pack the full repository

```typescript
// In repoTools.ts → pack_repository tool
const result = await packRemoteRepository({
  url: repoUrl,
  ref,                    // Branch/tag/commit (optional)
  include: patterns,      // File patterns to include
  compress: false,        // Token compression for large repos
  maxBytes: 512000,       // 500KB limit for packed content
  timeout: 180000,        // 3 minutes timeout
});
```

### Include Patterns

Two modes defined in [repoPacker.ts](src/core/repoPacker.ts):

- **`governance`** (default): Config files, docs, workflows only
  - `README.md`, `LICENSE`, `CONTRIBUTING.md`, `package.json`, `.github/**`
- **`deep`**: Full source code analysis
  - Adds `src/**`, `lib/**`, `app/**`, test configs, etc.

### When to Use Deep Analysis

- Complex architectures that require understanding code patterns
- Full code review beyond governance files
- Test coverage and quality assessment
- Large monorepos where file-by-file is insufficient

## Adding New Analysis Categories

1. Add category to `CategorySchema` in [schema.ts](src/types/schema.ts)
2. Update `CATEGORY_WEIGHTS` and checks in the SYSTEM_PROMPT ([agent.ts](src/core/agent.ts))
3. Add relevant file patterns to read in Phase 3 of the prompt

## Adding New Tools

1. Define tool in [repoTools.ts](src/tools/repoTools.ts) using `defineTool()`
2. Include in the tools array returned by `repoTools()` or `deepAnalysisTools()`
3. Document tool in SYSTEM_PROMPT so the agent knows when/how to use it

## Conventions

- **ES Modules**: All imports use `.js` extension (e.g., `import { x } from "./file.js"`)
- **UI Output**: Use helpers from `src/ui/` (`printSuccess`, `printError`, `c.brand()`) — never raw console.log for user-facing output
- **Error Handling**: Tools return error objects (not throw) so the agent can use errors as evidence
- **Streaming**: Agent output streams via `assistant.message_delta` events — buffer content for `/copy` and `/export`

## Testing

The project uses **Vitest** for unit testing with **86 tests** across 7 test files.

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

### Test Files

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `tests/cli/parsers/repoParser.test.ts` | 12 | URL parsing |
| `tests/cli/parsers/reportExtractor.test.ts` | 9 | Report extraction |
| `tests/cli/state/appState.test.ts` | 16 | State management |
| `tests/core/agent/analysisPrompt.test.ts` | 8 | Prompt building |
| `tests/core/agent/eventHandler.test.ts` | 17 | Event handling |
| `tests/core/agent/toolCallTracker.test.ts` | 13 | Loop detection |
| `tests/core/agent/guardrails.test.ts` | 11 | Safety mechanisms |

### Manual Testing

```bash
npm run dev                    # Interactive chat mode
npm run dev -- vercel/next.js  # Direct analysis
npm run dev -- /deep owner/repo # Deep analysis
```

### Edge Cases to Test

| Test Case | Input | Expected |
|-----------|-------|----------|
| Healthy repo | `vercel/next.js` | Score > 80%, few P2s |
| Missing LICENSE | Repo without LICENSE | P0 finding |
| No CI | Repo without workflows | P0 finding |
| Rate limited | Simulate 403 | Partial report with warning |
| Private repo | Private without token | Auth error message |
| Archived repo | Archived repository | Note in summary, adjusted expectations |
| Empty repo | Empty repository | P0: "Repository appears empty" |

## Files to Read First

When understanding this codebase, read in order:
1. [systemPrompt.ts](src/core/agent/prompts/systemPrompt.ts) — SYSTEM_PROMPT for agent behavior
2. [agent.ts](src/core/agent.ts) — Copilot SDK session management
3. [repoTools.ts](src/tools/repoTools.ts) — Available tools for analysis
4. [cli.ts](src/cli.ts) — Commander setup (entry point)
5. [chatLoop.ts](src/cli/chatLoop.ts) — Interactive REPL
6. [guardrails.ts](src/core/agent/guardrails.ts) — Safety mechanisms
