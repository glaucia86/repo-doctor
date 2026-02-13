# CLAUDE.md — Repo Doctor

## Project Context

Repo Doctor is an **Agentic CLI Tool** built with the [GitHub Copilot SDK](https://github.com/github/copilot-sdk). It analyzes GitHub repositories for health issues across 6 categories: docs, DX, CI/CD, tests, governance, and security.

## Quick Reference

```bash
npm install          # Install dependencies
npm run dev          # Development mode (tsx)
npm run build        # Compile to dist/
npm run test         # Run unit tests (Vitest)
npm link             # Link globally for testing
```

## Architecture Summary

The project follows **SOLID principles** with a modular architecture:

```
src/
├── cli.ts                 # CLI entry point (Commander setup only)
├── cli/                   # 🆕 CLI layer (modular)
│   ├── chatLoop.ts        # Interactive REPL
│   ├── handlers/          # Command handlers (/analyze, /export, etc.)
│   ├── state/             # AppState class + IAppState interface
│   └── parsers/           # URL parsing, report extraction
│
├── core/
│   ├── agent.ts           # Copilot SDK session management
│   ├── agent/             # 🆕 Agent modules
│   │   ├── prompts/       # SYSTEM_PROMPT, analysisPrompt
│   │   └── eventHandler.ts # Session event handling
│   ├── repoPacker.ts      # Repomix integration
│   └── markdownReporter.ts
│
├── tools/
│   ├── repoTools.ts       # Tool factory (re-exports)
│   ├── getRepoMeta.ts     # 🆕 Individual tool
│   ├── listRepoFiles.ts   # 🆕 Individual tool
│   ├── readRepoFile.ts    # 🆕 Individual tool
│   └── packRepository.ts  # 🆕 Individual tool
│
├── ui/
│   ├── display.ts         # Re-exports from display/
│   └── display/           # 🆕 Display modules
│       ├── spinner.ts     # Spinner management
│       ├── messages.ts    # printSuccess, printError, etc.
│       ├── menus.ts       # Command menus
│       └── ...
│
├── types/
│   ├── schema.ts          # Zod schemas
│   └── interfaces.ts      # 🆕 Shared interfaces (IAppState, etc.)
│
└── utils/
    ├── sanitizer.ts       # Prompt injection protection
    └── clipboard.ts       # 🆕 Cross-platform clipboard
```

## Key Files to Read First

1. **[src/core/agent/prompts/systemPrompt.ts](src/core/agent/prompts/systemPrompt.ts)** — SYSTEM_PROMPT (~500 lines)
2. **[src/core/agent.ts](src/core/agent.ts)** — SDK session management
3. **[src/tools/](src/tools/)** — Tool definitions (individual files)
4. **[src/cli/handlers/](src/cli/handlers/)** — Command handlers
5. **[src/types/schema.ts](src/types/schema.ts)** — Type definitions

## Code Conventions

- **ES Modules**: Use `.js` extension in imports (e.g., `import { x } from "./file.js"`)
- **UI Output**: Use helpers from `src/ui/` — never raw `console.log` for user-facing output
- **Error Handling**: Tools return error objects (not throw) so the agent can use errors as evidence
- **Streaming**: Agent output streams via `assistant.message_delta` events
- **State Management**: Use `appState.setModel()` instead of direct property assignment

## SOLID Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | Each handler, tool, and display module in its own file |
| **Open/Closed** | `buildSystemPrompt()` allows extension without modification |
| **Interface Segregation** | `IAppState`, `IClipboardService` define minimal contracts |
| **Dependency Inversion** | State accessed via interface, tools created via factories |

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Test files are in `tests/` mirroring the `src/` structure:
- `tests/cli/state/appState.test.ts` — 16 tests
- `tests/cli/parsers/*.test.ts` — 21 tests
- `tests/core/agent/*.test.ts` — 25 tests

## Common Tasks

| Task | Where to Look |
|------|---------------|
| Add a CLI command handler | Create in `src/cli/handlers/`, export from `index.ts` |
| Add a new tool | Create `src/tools/newTool.ts`, add to `repoTools.ts` |
| Modify system prompt | Edit `src/core/agent/prompts/systemPrompt.ts` |
| Change output format | Edit files in `src/ui/display/` |
| Add app state | Extend `IAppState` in `src/cli/state/appState.ts` |

## AI Models Available

| Model | Type | Notes |
|-------|------|-------|
| `gpt-4o` | Free | Good default |
| `gpt-5.3-codex` | Premium ⚡ | Advanced coding tasks |
| `claude-sonnet-4` | Premium ⚡ | **Recommended** — Excellent for analysis |
| `claude-sonnet-4.5` | Premium ⚡ | Enhanced reasoning |
| `claude-opus-4.5` | Premium ⚡ | Most capable (3x rate limit) |

---

*For detailed system prompt and tool schemas, see [AGENTS.md](AGENTS.md).*
