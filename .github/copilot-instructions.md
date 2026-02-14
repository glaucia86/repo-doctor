# Copilot Instructions — Repo Doctor

## Quick Reference

**Repo Doctor** is an Agentic CLI (GitHub Copilot SDK) that analyzes GitHub repo health across 6 categories: docs, DX, CI/CD, tests, governance, security.

## Project Structure

```
src/
├── cli.ts                  # Compatibility entrypoint
├── presentation/           # cli/, api/, web/, ui/
├── application/            # core/
├── infrastructure/         # tools/, providers/
├── domain/                 # types/, shared/
└── utils/                  # sanitizer.ts, clipboard.ts
```

## Commands

```bash
npm run dev:cli          # Dev mode (CLI)
npm run dev:web-ui:api   # Local Web UI API
npm run dev:web-ui       # Local Web UI server
npm test                 # Run tests
npm run build            # Production build
```

| CLI Command | Description |
|-------------|-------------|
| `/analyze <repo>` | Quick analysis (GitHub API) |
| `/deep <repo>` | Deep analysis (Repomix) |
| `/copy` | Copy report to clipboard |
| `/export` | Save as markdown |
| `/model` | Switch AI model |

## Conventions

- **ES Modules**: imports use `.js` extension
- **UI**: Use `src/presentation/ui/` helpers, never raw console.log
- **Errors**: Tools return error objects (don't throw)
- **Tests**: Vitest with 100+ tests

## Key Files (read in order)

1. `src/application/core/agent/prompts/composers/systemPromptComposer.ts`
2. `src/application/core/agent.ts`
3. `src/infrastructure/tools/repoTools.ts`
4. `src/presentation/cli.ts`

## Detailed Documentation

For architecture details, tool definitions, and agent configuration, read `AGENTS.md` when needed.
