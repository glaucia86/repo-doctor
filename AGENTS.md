# AGENTS.md — Repo Doctor

AI-powered GitHub repository health analyzer using the GitHub Copilot SDK.

This project uses pnpm for package management.

## Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Interactive mode
npm test           # Run tests (100+ Vitest)
npm run build      # Production build
```

## Key Conventions

- **ES Modules**: imports use `.js` extension
- **UI**: Use `src/ui/` helpers, never raw `console.log`
- **Errors**: Tools return error objects (don't throw)
- **Security**: Content sanitized via `utils/sanitizer.ts`

For detailed documentation, see [docs/index.md](docs/index.md).
