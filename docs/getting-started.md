# 🚀 Getting Started

This guide will help you install Repo Doctor and run your first repository health analysis.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Your First Analysis](#your-first-analysis)
- [Understanding the Report](#understanding-the-report)
- [Next Steps](#next-steps)

---

## Prerequisites

Before installing Repo Doctor, ensure you have:

### 1. Node.js (v18+)

Check your Node.js version:

```bash
node --version
# Should be v18.0.0 or higher
```

If you need to install or update Node.js:
- **Windows/macOS**: Download from [nodejs.org](https://nodejs.org/)
- **Linux**: Use [nvm](https://github.com/nvm-sh/nvm) or your package manager

### 2. GitHub Copilot Subscription

Repo Doctor uses the GitHub Copilot SDK, which requires an active subscription:

- **GitHub Copilot Individual** - Works with free models (GPT-4o, GPT-4.1)
- **GitHub Copilot Pro/Business/Enterprise** - Full access to premium models

> **Note:** If you don't have GitHub Copilot, you can [sign up here](https://github.com/features/copilot).

### 3. GitHub Copilot CLI (Required)

Repo Doctor uses the GitHub Copilot SDK, which requires the **Copilot CLI** installed:

```bash
# Install Copilot CLI
# Visit: https://github.com/github/copilot-cli
# Or use the direct install command for your OS
```

**Installation by OS:**

| OS | Installation |
|----|--------------|
| **macOS** | `brew install github/copilot-cli/copilot` |
| **Windows** | Download from [github.com/github/copilot-cli/releases](https://github.com/github/copilot-cli/releases) |
| **Linux** | Download from [github.com/github/copilot-cli/releases](https://github.com/github/copilot-cli/releases) |

```bash
# Verify installation
copilot --version
```

> ⚠️ **Important:** The Copilot CLI is required for the SDK to authenticate and communicate with GitHub Copilot services.
>
> 📖 Learn more: [github.com/features/copilot/cli](https://github.com/features/copilot/cli/)

### 4. GitHub CLI (Optional)

For additional GitHub authentication options, you can also install the GitHub CLI:

```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
sudo apt install gh  # Debian/Ubuntu
```

Then authenticate:

```bash
gh auth login
```

---

## Installation

### Option 1: Clone and Build (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/glaucia86/repo-doctor.git

# 2. Navigate to the directory
cd repo-doctor

# 3. Install dependencies
npm install

# 4. Build the project
npm run build

# 5. Link globally
npm link
```

After installation, the `repo-doctor` command will be available globally.

### Option 2: Development Mode

If you want to contribute or modify the code:

```bash
# Clone and install
git clone https://github.com/glaucia86/repo-doctor.git
cd repo-doctor
npm install

# Run in development mode (with hot reload)
npm run dev
```

### Verify Installation

```bash
repo-doctor --version
# Should display: repo-doctor v2.x.x
```

---

## Your First Analysis

### Interactive Mode

The easiest way to start is with interactive mode:

```bash
repo-doctor
```

You'll see a welcome screen:

<p align="center">
  <img src="../resources/image.png" alt="Repo Doctor Welcome Screen" width="700">
</p>

1. **Enter a repository** — Type `vercel/next.js` or any public repository
2. **Select an AI model** — Choose from the list (use arrow keys)
3. **Wait for analysis** — The AI will analyze the repository
4. **Review the report** — See findings, health score, and recommendations

### Direct Analysis

You can also analyze directly from the command line:

```bash
# Analyze a public repository
repo-doctor vercel/next.js

# With a specific model
repo-doctor facebook/react --model gpt-4o

# Deep analysis (comprehensive scan)
repo-doctor microsoft/typescript --deep
```

### Quick vs Deep Analysis

| Mode | Command | Speed | Detail |
|------|---------|-------|--------|
| **Quick** | `repo-doctor <repo>` | 10-30s | Key files only |
| **Deep** | `repo-doctor <repo> --deep` | 30-60s | Full source scan |

> 💡 **Tip:** Start with quick analysis. Use deep analysis for detailed audits.

---

## Understanding the Report

After analysis, you'll receive a health report like this:

### Health Score

```
📊 Repository Health Score: 78%

| Category              | Score | Issues |
|-----------------------|-------|--------|
| 📚 Docs & Onboarding  | 85%   | 1 P2   |
| ⚡ Developer Experience| 90%   | 0      |
| 🔄 CI/CD              | 70%   | 1 P1   |
| 🧪 Quality & Tests    | 65%   | 1 P1   |
| 📋 Governance         | 80%   | 1 P2   |
| 🔐 Security           | 75%   | 1 P1   |
```

### Priority Levels

| Priority | Meaning | Action Required |
|----------|---------|-----------------|
| **P0** 🔴 | Critical blocker | Fix immediately |
| **P1** 🟠 | High impact | Fix soon |
| **P2** 🟡 | Nice to have | Consider improving |

### Sample Finding

```
🔴 P0 — Missing LICENSE File

📍 Evidence: No LICENSE file found in repository root
💥 Impact: Users cannot legally use or contribute to this project
✅ Action: Add a LICENSE file. Recommended: MIT for open source projects

   # Create MIT License
   curl -o LICENSE https://opensource.org/licenses/MIT
```

### Saving Your Report

After analysis, you can:

```bash
/copy          # Copy to clipboard
/export        # Save as markdown file
/export json   # Save as JSON
```

---

## Next Steps

Now that you've run your first analysis:

### Learn More

- 📖 [User Guide](GUIDE.md) — Complete command reference
- 🤖 [AI Models](AI-MODELS.md) — Choose the right model for your needs
- 📊 [Analysis Categories](analysis-categories.md) — What gets analyzed

### Analyze Your Repositories

```bash
# Your organization's repos
repo-doctor your-org/your-repo

# Private repositories (requires token)
export GITHUB_TOKEN=ghp_xxxxx
repo-doctor your-org/private-repo
```

### Integrate into Workflow

- Run Repo Doctor before major releases
- Use it in CI/CD for automated health checks
- Share reports with your team

### Join the Community

- ⭐ [Star the repository](https://github.com/glaucia86/repo-doctor)
- 🐛 [Report issues](https://github.com/glaucia86/repo-doctor/issues)
- 💡 [Suggest features](https://github.com/glaucia86/repo-doctor/discussions)
- 🤝 [Contribute](CONTRIBUTING.md)

---

## Troubleshooting Installation

### "command not found: repo-doctor"

The global link wasn't created properly:

```bash
# Try relinking
npm unlink repo-doctor
npm link

# Or run directly
npx repo-doctor
```

### "Cannot find module" errors

Dependencies might be missing:

```bash
rm -rf node_modules
npm install
npm run build
```

### Authentication issues

If you see authentication errors:

```bash
# Option 1: Use GitHub CLI
gh auth login

# Option 2: Set token manually
export GITHUB_TOKEN=ghp_xxxxx
```

See [Troubleshooting](troubleshooting.md) for more solutions.

---

<p align="center">
  <a href="index.md">← Back to Documentation</a> •
  <a href="GUIDE.md">User Guide →</a>
</p>
