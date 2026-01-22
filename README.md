# 🩺 Repo Doctor

AI-Powered GitHub Repository Health Analyzer using the GitHub Copilot SDK.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)

```
██████╗ ███████╗██████╗  ██████╗     ██████╗  ██████╗  ██████╗████████╗ ██████╗ ██████╗ 
██╔══██╗██╔════╝██╔══██╗██╔═══██╗    ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
██████╔╝█████╗  ██████╔╝██║   ██║    ██║  ██║██║   ██║██║        ██║   ██║   ██║██████╔╝
██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║    ██║  ██║██║   ██║██║        ██║   ██║   ██║██╔══██╗
██║  ██║███████╗██║     ╚██████╔╝    ██████╔╝╚██████╔╝╚██████╗   ██║   ╚██████╔╝██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝     ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
```

## ✨ Features

- **📊 Health Score** - Get an overall health percentage for your repository
- **🔍 Smart Analysis** - AI-powered diagnosis across 6 key categories:
  - 📚 Docs & Onboarding
  - ⚡ Developer Experience (DX)
  - 🔄 CI/CD
  - 🧪 Quality & Tests
  - 📋 Governance
  - 🔐 Security Basics
- **🎯 Prioritized Findings** - Issues classified as P0 (critical), P1 (high), P2 (nice-to-have)
- **💡 Actionable Recommendations** - Specific steps to improve your repository
- **🎨 Beautiful CLI** - Modern terminal interface with colors and progress indicators

## 📋 Prerequisites

1. **GitHub Copilot** - Active subscription (individual, business, or enterprise)
2. **Copilot CLI** - Install globally:
   ```bash
   npm install -g @anthropic-ai/copilot
   ```
3. **Node.js** - Version 18.0.0 or higher

## 🚀 Installation

```bash
# From npm (coming soon)
npm install -g repo-doctor

# From source
git clone https://github.com/glaucia86/repo-doctor.git
cd repo-doctor
npm install
npm run build
npm link
```

## 📖 Usage

```bash
# Analyze a public repository
repo-doctor analyze vercel/next.js

# Analyze with full URL
repo-doctor analyze https://github.com/microsoft/typescript

# Analyze a private repository (requires token)
repo-doctor analyze owner/private-repo --token ghp_xxxxx

# Use environment variable for token
export GITHUB_TOKEN=ghp_xxxxx
repo-doctor analyze owner/private-repo

# Show help
repo-doctor help
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--token <TOKEN>` | GitHub token for private repos | `GITHUB_TOKEN` env |
| `--max-files <N>` | Maximum files to list | 800 |
| `--max-bytes <N>` | Maximum bytes per file | 200KB |
| `--timeout <ms>` | Analysis timeout | 120000 |
| `--verbosity <level>` | Output verbosity (`silent` \| `normal` \| `verbose`) | `normal` |
| `--format <type>` | Output format (`pretty` \| `json` \| `minimal`) | `pretty` |

### Output Formats

```bash
# Pretty output (default) - colorful terminal UI
repo-doctor analyze vercel/next.js

# JSON output - structured data for scripting
repo-doctor analyze vercel/next.js --format json

# Minimal output - one-line summary
repo-doctor analyze vercel/next.js --format minimal

# Verbose output - show all tool calls and evidence
repo-doctor analyze vercel/next.js --verbosity verbose
```

## 📊 Analysis Categories

### 📚 Docs & Onboarding
- README presence and quality
- Setup instructions
- Contributing guidelines

### ⚡ Developer Experience
- npm scripts (dev, build, test, lint)
- Node version management
- Monorepo configuration
- TypeScript setup

### 🔄 CI/CD
- GitHub Actions workflows
- Test automation
- Build pipelines

### 🧪 Quality & Tests
- Test framework configuration
- Linting and formatting
- Code coverage

### 📋 Governance
- LICENSE file
- CODE_OF_CONDUCT
- SECURITY policy
- Issue/PR templates

### 🔐 Security
- Dependabot/Renovate
- Security policy
- Secret management hints

## 🎯 Priority Levels

| Priority | Meaning | Examples |
|----------|---------|----------|
| **P0** | Critical blocker | No LICENSE, no README, no CI |
| **P1** | High impact | CI without tests, no CONTRIBUTING |
| **P2** | Nice to have | Badges, refined templates |

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- analyze owner/repo

# Build for production
npm run build

# Run tests
npm test
```

## 🏗️ Architecture

```
repo-doctor/
├── src/
│   ├── index.ts              # Entry point
│   ├── cli.ts                # Commander setup
│   ├── core/
│   │   ├── agent.ts          # Copilot SDK integration
│   │   ├── analyzer.ts       # Analysis engine
│   │   └── reporter.ts       # Output formatting
│   ├── providers/
│   │   └── github.ts         # GitHub API client
│   ├── tools/
│   │   └── repoTools.ts      # Custom tools for the agent
│   ├── ui/
│   │   ├── themes.ts         # Color palette, icons
│   │   ├── display.ts        # Screen rendering
│   │   └── prompts.ts        # Interactive prompts
│   └── types/
│       └── schema.ts         # Type definitions
└── ai-documents/
    ├── spec.md
    ├── PRD.md
    └── AGENTS.md
```

## 🏗️ Tech Stack

- **[@github/copilot-sdk](https://github.com/github/copilot-sdk)** - AI orchestration
- **[@octokit/rest](https://github.com/octokit/rest.js)** - GitHub API client
- **[commander](https://github.com/tj/commander.js)** - CLI framework
- **[chalk](https://github.com/chalk/chalk)** - Terminal styling
- **[ora](https://github.com/sindresorhus/ora)** - Terminal spinners
- **[zod](https://github.com/colinhacks/zod)** - Schema validation

## 📄 License

MIT © [Glaucia Lemos](https://github.com/glaucia86)

---

Made with 💚 using the GitHub Copilot SDK

