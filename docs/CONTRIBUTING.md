# 🤝 Contributing to Repo Doctor

Thank you for your interest in contributing to Repo Doctor! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Coding Standards](#coding-standards)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be kind and considerate in all interactions.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/repo-doctor.git
   cd repo-doctor
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/glaucia86/repo-doctor.git
   ```

---

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or pnpm
- GitHub Copilot subscription (for testing AI features)
- Git

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link

# Run in development mode (with watch)
npm run dev:cli
```

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run integration tests (requires network)
npm run test:integration
```

---

## Project Structure

```
repo-doctor/
├── site/                       # Static website (GitHub Pages)
├── src/
│   ├── index.ts                # Package entrypoint
│   ├── cli.ts                  # Compatibility entrypoint -> presentation/cli.ts
│   ├── presentation/           # CLI, API, Web UI, terminal UI
│   ├── application/            # Use cases and orchestration
│   ├── infrastructure/         # Providers and tool adapters
│   ├── domain/                 # Contracts, schemas, interfaces
│   └── utils/                  # Cross-cutting utilities
├── tests/                      # Vitest test files
├── docs/                       # Documentation
├── resources/                  # Images and assets
├── ai-documents/               # AI agent documentation
├── package.json
├── tsconfig.json
└── README.md
```

### Key Files

| File | Purpose |
|------|---------|
| `src/presentation/cli.ts` | CLI composition root |
| `src/presentation/cli/chatLoop.ts` | Interactive REPL |
| `src/application/core/agent.ts` | Copilot SDK session orchestration |
| `src/application/core/agent/prompts/composers/systemPromptComposer.ts` | Modular prompt composition |
| `src/application/core/agent/guardrails.ts` | Safety mechanisms (loop prevention) |
| `src/infrastructure/tools/` | Copilot tool adapters |
| `src/presentation/ui/themes/` | Terminal colors and styling |

---

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-command` - New features
- `fix/clipboard-issue` - Bug fixes
- `docs/update-guide` - Documentation updates
- `refactor/improve-parser` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add /summary command for condensed reports
fix: resolve clipboard copy on Windows
docs: update installation instructions
refactor: simplify command parsing logic
chore: update dependencies
```

### Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes** and test locally:
   ```bash
   npm run build
   repo-doctor  # Test your changes
   ```

3. **Commit** your changes:
   ```bash
   git add .
   git commit -m "feat: description of your change"
   ```

4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature
   ```

---

## Submitting a Pull Request

1. **Update your branch** with latest changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push** your changes:
   ```bash
   git push origin feature/your-feature
   ```

3. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changes you made and why

4. **Wait for review** - maintainers will review your PR and may request changes

---

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Export types from `src/domain/types/schema.ts`

### Code Style

- Use 2-space indentation
- Use semicolons
- Use single quotes for strings
- Keep lines under 100 characters

### File Organization

- One component/module per file
- Use barrel exports (`index.ts`)
- Keep related code together

### Comments

- Document complex logic
- Use JSDoc for public functions
- Avoid obvious comments

---

## Need Help?

- 💬 Open a [Discussion](https://github.com/glaucia86/repo-doctor/discussions)
- 🐛 Report a [Bug](https://github.com/glaucia86/repo-doctor/issues/new?template=bug_report.md)
- 💡 Request a [Feature](https://github.com/glaucia86/repo-doctor/issues/new?template=feature_request.md)

---

Thank you for contributing! 💚
