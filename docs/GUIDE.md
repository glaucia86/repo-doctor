# 📖 Repo Doctor User Guide

Complete guide for using Repo Doctor CLI.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Interactive Chat Mode](#interactive-chat-mode)
- [Slash Commands](#slash-commands)
- [Analysis Modes](#analysis-modes)
- [Export Options](#export-options)
- [Command Line Options](#command-line-options)
- [Private Repositories](#private-repositories)
- [Priority Levels](#priority-levels)

---

## Quick Start

```bash
# Start interactive mode - will prompt for repository and model
repo-doctor

# Analyze a specific repository directly
repo-doctor vercel/next.js

# Analyze with a specific model
repo-doctor vercel/next.js --model gpt-4o
```

---

## Interactive Chat Mode

When you run `repo-doctor`, you enter an interactive chat interface:

```
╭─────────────────────────────────────────╮
│  🩺 REPO DOCTOR v2.0                    │
│     GitHub Repository Health Analyzer   │
╰─────────────────────────────────────────╯

  ✨ Welcome to Repo Doctor!
  
  Enter repository (owner/repo): vercel/next.js
  
  Select AI Model:
  ❯ claude-sonnet-4 (Premium)
    gpt-4o (Free)
    gpt-4.1 (Free)
    ...

  🔍 Analyzing repository...
```

After analysis, you'll see options to copy, export, or analyze another repository.

---

## Slash Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/analyze <repo>` | Quick analysis (metadata + key files) | `/analyze vercel/next.js` |
| `/deep <repo>` | **Deep analysis** with full repo scan via Repomix | `/deep facebook/react` |
| `/summary` | Show condensed summary of last analysis | `/summary` |
| `/last` | Show last analysis result | `/last` |
| `/history` | Show recent analyses | `/history` |
| `/copy` | Copy analysis to clipboard | `/copy` |
| `/export [path] [format]` | Export report to file | `/export ~/Desktop` |
| `/model [name]` | Switch AI model | `/model gpt-4o` |
| `/clear` | Clear the screen | `/clear` |
| `/help` | Show available commands | `/help` |
| `/quit` | Exit Repo Doctor | `/quit` |

> 💡 **Tip:** Use `/deep` for comprehensive analysis of complex repositories. It reads all source files and provides more detailed evidence.

---

## Analysis Modes

### Comparison

| Feature | `/analyze` (Quick) | `/deep` (Comprehensive) |
|---------|-------------------|------------------------|
| **Speed** | ⚡ Fast (10-30s) | 🐢 Slower (30-60s) |
| **API Quota** | Low usage | Higher usage |
| **Files Read** | Key files only | All source files |
| **Evidence Detail** | Summary level | Full extraction |
| **Best For** | Quick health check | Detailed audit |
| **Requires** | GitHub API only | Repomix (auto-installed) |

### Quick Analysis (`/analyze`)

Standard analysis that reads repository metadata and key files (README, LICENSE, package.json, workflows, etc.) via GitHub API.

```bash
/analyze vercel/next.js
```

### Deep Analysis (`/deep`)

The `/deep` command uses [Repomix](https://github.com/yamadashy/repomix) to perform a comprehensive repository scan:

```bash
# Deep analysis of a repository
/deep vercel/next.js

# What it does:
# 1. Clones and packs the entire repository
# 2. Reads all source files (not just metadata)
# 3. Analyzes code patterns, dependencies, and structure
# 4. Generates detailed evidence extraction
# 5. Produces a comprehensive health report
```

**Deep Analysis provides:**
- 📂 Full file tree analysis
- 📦 Complete dependency review
- 🔍 Source code pattern detection
- 📊 Detailed evidence extraction section
- 🎯 More accurate health scoring

> ⚠️ **Note:** Deep analysis takes longer (30-60 seconds) and uses more API quota. Use `/analyze` for quick checks.

---

## Export Options

The `/export` command supports flexible paths:

```bash
# Save to default location: ~/repo-doctor/reports/
/export

# Save to Desktop
/export ~/Desktop

# Save with custom filename
/export ./my-report.md

# Save as JSON
/export ~/Documents json

# Save to specific path as JSON
/export ~/Desktop/analysis.json
```

Reports are saved with UTF-8 encoding (with BOM) to preserve emojis correctly.

---

## Command Line Options

```bash
repo-doctor [repository] [options]

Options:
  --token <TOKEN>     GitHub token for private repos (or set GITHUB_TOKEN env)
  --model <name>      AI model to use (default: claude-sonnet-4)
  --issue             Publish analysis as GitHub issue(s)
  --max-files <N>     Maximum files to analyze (default: 800)
  --max-bytes <N>     Maximum bytes per file (default: 200KB)
  --timeout <ms>      Analysis timeout (default: 120000)
  --export            Export report after analysis
  --help              Show help
```

### Examples

```bash
# Analyze a public repository
repo-doctor microsoft/typescript

# Analyze with full URL
repo-doctor https://github.com/facebook/react

# Analyze a private repository
export GITHUB_TOKEN=ghp_xxxxx
repo-doctor owner/private-repo

# Use a free model
repo-doctor vercel/next.js --model gpt-4o

# Auto-export after analysis
repo-doctor vercel/next.js --export
```

---

## Private Repositories

To analyze private repositories, you need to provide a GitHub Personal Access Token (PAT) with `repo` scope.

### Option 1: Environment Variable (Recommended)

```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Now analyze any private repo
repo-doctor my-org/private-repo
```

### Option 2: Command Line Argument

```bash
repo-doctor my-org/private-repo --token ghp_xxxxxxxxxxxxxxxxxxxx
```

### Creating a GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select the `repo` scope (Full control of private repositories)
4. Copy the generated token and use it as shown above

> ⚠️ **Security Tip:** Never commit your token to version control. Use environment variables or a secrets manager.

---

## Publishing Issues (`--issue`)

Use `--issue` to create GitHub issues with the analysis output. This requires a PAT with issue write access and Copilot SDK auth for model access.

```bash
# Copilot SDK auth (recommended)
export GH_TOKEN="$(gh auth token)"

# Create issues during analysis
repo-doctor analyze owner/repo --issue --token ghp_your_pat_here
```

For a full step-by-step guide and 401 troubleshooting, see [issue-publishing.md](issue-publishing.md).

---

## Priority Levels

Repo Doctor classifies findings into three priority levels:

| Priority | Meaning | Examples |
|----------|---------|----------|
| **P0** | Critical blocker | No LICENSE, no README, no CI |
| **P1** | High impact | CI without tests, no CONTRIBUTING guide |
| **P2** | Nice to have | Badges, refined templates |

### What Gets Analyzed?

| Category | What's Checked |
|----------|----------------|
| 📚 **Docs & Onboarding** | README quality, setup instructions, contributing guidelines |
| ⚡ **Developer Experience** | npm scripts, Node version, TypeScript, monorepo setup |
| 🔄 **CI/CD** | GitHub Actions, test automation, build pipelines |
| 🧪 **Quality & Tests** | Test framework, linting, formatting, code coverage |
| 📋 **Governance** | LICENSE, CODE_OF_CONDUCT, SECURITY policy, templates |
| 🔐 **Security** | Dependabot/Renovate, security policy, secret management |

---

## Need More Help?

- 📖 [AI Models Reference](./AI-MODELS.md)
- 🤝 [Contributing Guide](./CONTRIBUTING.md)
- 🐛 [Report an Issue](https://github.com/glaucia86/repo-doctor/issues)
