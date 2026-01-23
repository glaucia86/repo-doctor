# Copilot Instructions — Repo Doctor

## Project Overview

Repo Doctor is an **Agentic CLI Tool** built with the [GitHub Copilot SDK](https://github.com/github/copilot-sdk). It analyzes GitHub repositories for health issues across 6 categories: docs, DX, CI/CD, tests, governance, and security.

## Architecture

```
src/
├── cli.ts           # Main CLI entry, Commander setup, chat loop, command handlers
├── core/
│   ├── agent.ts     # Copilot SDK session, SYSTEM_PROMPT, event handling
│   ├── repoPacker.ts # Repomix integration for deep analysis
│   └── markdownReporter.ts
├── providers/
│   └── github.ts    # Octokit factory, token resolution (env → gh CLI)
├── tools/
│   └── repoTools.ts # defineTool() implementations: get_repo_meta, list_repo_files, read_repo_file, pack_repository
├── types/
│   └── schema.ts    # Zod schemas for all data types (Finding, AnalysisResult, etc.)
├── ui/              # Terminal display (chalk, ora spinners, themed output)
└── utils/
    └── sanitizer.ts # Security: prompt injection detection in file content
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
});

session.on((event: SessionEvent) => {
  // Handle: assistant.message_delta, tool.execution_start, session.idle
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

> ⚠️ **Planned for future versions** — Test suite not yet implemented.

### Current Testing Approach

- Manual testing: `npm run dev -- <repo>` with various repositories
- Test edge cases: archived repos, empty repos, rate limits, private repos

### Recommended Test Cases for Future Implementation

| Test Case | Input | Expected |
|-----------|-------|----------|
| Healthy repo | `vercel/next.js` | Score > 80%, few P2s |
| Missing LICENSE | Repo without LICENSE | P0 finding |
| No CI | Repo without workflows | P0 finding |
| Rate limited | Simulate 403 | Partial report with warning |
| Private repo | Private without token | Auth error message |
| Archived repo | Archived repository | Note in summary, adjusted expectations |
| Empty repo | Empty repository | P0: "Repository appears empty" |

### Test Framework Considerations

When implementing tests, consider:
- **Unit tests**: Tool handlers in `repoTools.ts` with mocked Octokit
- **Integration tests**: Full analysis flow with test repositories
- **Snapshot tests**: Report output consistency

## Files to Read First

When understanding this codebase, read in order:
1. [agent.ts](src/core/agent.ts) — Core SDK integration and SYSTEM_PROMPT
2. [repoTools.ts](src/tools/repoTools.ts) — Available tools for analysis
3. [cli.ts](src/cli.ts) — Command handling and chat loop
4. [schema.ts](src/types/schema.ts) — Type definitions
