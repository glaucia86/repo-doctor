# Copilot Instructions — Repo Doctor

## Quick Reference

**Repo Doctor** is an Agentic CLI (GitHub Copilot SDK) that analyzes GitHub repo health across 6 categories: docs, DX, CI/CD, tests, governance, security.

## Project Structure

```
src/
├── cli.ts              # Entry point (Commander)
├── cli/                # handlers/, parsers/, state/
├── core/
│   ├── agent.ts        # Copilot SDK session
│   ├── agent/prompts/  # Modular prompt system (base/, modes/, composers/)
│   └── repoPacker/     # Repomix integration
├── tools/              # get_repo_meta, list_repo_files, read_repo_file, pack_repository
├── ui/                 # display/, themes/
└── utils/              # sanitizer.ts, clipboard.ts
```

## Commands

```bash
npm run dev              # Dev mode
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
- **UI**: Use `src/ui/` helpers, never raw console.log
- **Errors**: Tools return error objects (don't throw)
- **Tests**: Vitest with 100+ tests

## Key Files (read in order)

1. `src/core/agent/prompts/composers/systemPromptComposer.ts`
2. `src/core/agent.ts`
3. `src/tools/repoTools.ts`
4. `src/cli.ts`

## Detailed Documentation

For architecture details, tool definitions, and agent configuration, read `AGENTS.md` when needed.
