# AGENTS.md — Repo Doctor

Agentic CLI that analyzes GitHub repository health using the GitHub Copilot SDK.

## Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Interactive mode
npm test           # Run tests (100+ Vitest)
npm run build      # Production build
```

## Tools

4 custom tools for repository analysis:

| Tool | Purpose |
|------|---------|
| `get_repo_meta` | Fetch repo metadata via GitHub API |
| `list_repo_files` | List file tree (filters noise) |
| `read_repo_file` | Read file content with sanitization |
| `pack_repository` | Pack repo with Repomix (deep analysis) |

For tool implementation details, see [docs/ai/TOOLS.md](docs/ai/TOOLS.md).

## Analysis Modes

| Mode | Command | Scope |
|------|---------|-------|
| Quick | `/analyze` | Governance files (~20 reads) |
| Deep | `/deep` | Full source via Repomix |

## Scoring

6 categories weighted: Docs 20%, DX 20%, CI 20%, Tests 15%, Governance 15%, Security 10%.

Findings: P0 (critical), P1 (high), P2 (suggestions).

## Key Conventions

- **ES Modules**: imports use `.js` extension
- **UI**: Use `src/ui/` helpers, never raw `console.log`
- **Errors**: Tools return error objects (don't throw)
- **Security**: Content sanitized via `utils/sanitizer.ts`

## Documentation

| Topic | File |
|-------|------|
| Custom Tools | [docs/ai/TOOLS.md](docs/ai/TOOLS.md) |
| Prompt System | [docs/ai/PROMPTS.md](docs/ai/PROMPTS.md) |
| Session Config | [docs/ai/SESSION.md](docs/ai/SESSION.md) |
| Security | [docs/ai/SECURITY.md](docs/ai/SECURITY.md) |
| Testing | [docs/ai/TESTING.md](docs/ai/TESTING.md) |
| Issue Publishing and 401 Troubleshooting | [docs/issue-publishing.md](docs/issue-publishing.md) |
