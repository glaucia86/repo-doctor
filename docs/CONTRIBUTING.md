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
npm run dev
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
├── src/
│   ├── index.ts                # Entry point (shebang for CLI)
│   ├── cli.ts                  # Commander setup (~186 lines)
│   ├── cli/                    # CLI Layer (SRP)
│   │   ├── chatLoop.ts         # Interactive REPL
│   │   ├── handlers/           # Command handlers (one per command)
│   │   ├── parsers/            # Input parsing utilities
│   │   └── state/              # Application state
│   ├── core/
│   │   ├── agent.ts            # GitHub Copilot SDK integration
│   │   ├── analyzer.ts         # Repository analysis engine
│   │   ├── markdownReporter.ts # Markdown report generation
│   │   ├── repoPacker.ts       # Re-exports from repoPacker/
│   │   ├── repoPacker/         # Repomix integration (modular)
│   │   │   ├── packer.ts       # Main pack function
│   │   │   ├── errors.ts       # Error categorization
│   │   │   └── patterns.ts     # Include/exclude patterns
│   │   ├── reporter.ts         # Output formatting utilities
│   │   └── agent/              # Agent modules
│   │       ├── prompts/        # Modular prompt system
│   │       │   ├── base/       # Base prompt modules (11 files)
│   │       │   ├── modes/      # quick.ts, deep.ts
│   │       │   └── composers/  # systemPromptComposer.ts
│   │       ├── eventHandler.ts # Session event handling
│   │       ├── guardrails.ts   # Safety mechanisms
│   │       └── toolCallTracker.ts # Loop detection
│   ├── providers/
│   │   └── github.ts           # GitHub API client (Octokit)
│   ├── tools/                  # Individual tool files
│   │   ├── repoTools.ts        # Tool factory
│   │   ├── getRepoMeta.ts      # get_repo_meta tool
│   │   ├── listRepoFiles.ts    # list_repo_files tool
│   │   ├── readRepoFile.ts     # read_repo_file tool
│   │   └── packRepository.ts   # pack_repository tool
│   ├── types/
│   │   ├── schema.ts           # TypeScript type definitions
│   │   └── interfaces.ts       # Shared interfaces
│   └── ui/
│       ├── commands.ts         # Slash command parsing
│       ├── display.ts          # Re-exports from display/
│       ├── display/            # Modular UI components
│       ├── index.ts            # UI exports barrel
│       ├── prompts.ts          # Interactive prompts (readline)
│       ├── themes.ts           # Re-exports from themes/
│       └── themes/             # Theme system (modular)
│           ├── colors.ts       # Color palette
│           ├── icons.ts        # Category/priority icons
│           ├── box.ts          # Box drawing utilities
│           ├── badges.ts       # Progress bars
│           └── logo.ts         # Logo renderers
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
| `src/cli.ts` | Commander setup (entry point) |
| `src/cli/chatLoop.ts` | Interactive REPL |
| `src/core/agent.ts` | Copilot SDK session management |
| `src/core/agent/prompts/composers/systemPromptComposer.ts` | Modular prompt composition |
| `src/core/agent/guardrails.ts` | Safety mechanisms (loop prevention) |
| `src/core/repoPacker/` | Repomix integration for `/deep` command |
| `src/ui/themes/` | Terminal colors and styling |

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
- Export types from `types/schema.ts`

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
