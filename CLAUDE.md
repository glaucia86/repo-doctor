# CLAUDE.md — Repo Doctor

## Project Context

Repo Doctor is an **Agentic CLI Tool** built with the [GitHub Copilot SDK](https://github.com/github/copilot-sdk). It analyzes GitHub repositories for health issues across 6 categories: docs, DX, CI/CD, tests, governance, and security.

## Quick Reference

```bash
npm install          # Install dependencies
npm run dev          # Development mode (tsx)
npm run build        # Compile to dist/
npm link             # Link globally for testing
```

## Architecture Summary

```
src/
├── cli.ts              # Commander setup, chat loop, commands
├── core/
│   ├── agent.ts        # Copilot SDK session, SYSTEM_PROMPT
│   ├── repoPacker.ts   # Repomix integration for deep analysis
│   └── markdownReporter.ts
├── providers/github.ts # Octokit factory, token resolution
├── tools/repoTools.ts  # defineTool() implementations
├── types/schema.ts     # Zod schemas
└── ui/                 # Terminal display (chalk, ora)
```

## Key Files to Read First

1. **[src/core/agent.ts](src/core/agent.ts)** — Core SDK integration and SYSTEM_PROMPT
2. **[src/tools/repoTools.ts](src/tools/repoTools.ts)** — Tool definitions
3. **[src/cli.ts](src/cli.ts)** — Command handling
4. **[src/types/schema.ts](src/types/schema.ts)** — Type definitions

## Code Conventions

- **ES Modules**: Use `.js` extension in imports (e.g., `import { x } from "./file.js"`)
- **UI Output**: Use helpers from `src/ui/` — never raw `console.log` for user-facing output
- **Error Handling**: Tools return error objects (not throw) so the agent can use errors as evidence
- **Streaming**: Agent output streams via `assistant.message_delta` events

## Claude-Specific Guidance

### When Analyzing This Codebase

1. **Understand the tool pattern**: Each tool in `repoTools.ts` uses `defineTool()` with Zod-style parameters
2. **Security is critical**: File content from repos is sanitized via `utils/sanitizer.ts` — always check for prompt injection
3. **The agent is agentic**: It makes autonomous decisions based on SYSTEM_PROMPT guidance

### When Writing Code

- Keep tools focused and single-purpose
- Return structured JSON from tool handlers
- Use the existing UI helpers for consistent terminal output
- Follow the existing error handling pattern (return errors, don't throw)

### Common Tasks

| Task | Where to Look |
|------|---------------|
| Add a new analysis category | Update `SYSTEM_PROMPT` in `agent.ts`, add checks |
| Add a new CLI command | `cli.ts` — add to Commander setup |
| Add a new tool | `repoTools.ts` — use `defineTool()` pattern |
| Change output format | `ui/display.ts` and `markdownReporter.ts` |

## Testing Approach

> ⚠️ Test suite planned for future — currently manual testing only

Test with various repositories:
```bash
npm run dev -- vercel/next.js      # Large, healthy repo
npm run dev -- <user>/<empty-repo> # Edge case: empty repo
npm run dev -- <archived-repo>     # Edge case: archived
```

## AI Models Available

| Model | Type | Notes |
|-------|------|-------|
| `gpt-4o` | Free | Good default |
| `claude-sonnet-4` | Premium ⚡ | **Recommended** — Excellent for analysis |
| `claude-sonnet-4.5` | Premium ⚡ | Enhanced reasoning |
| `claude-opus-4.5` | Premium ⚡ | Most capable (3x rate limit) |

---

*For detailed system prompt and tool schemas, see [AGENTS.md](AGENTS.md).*
