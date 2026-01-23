# 🩺 Repo Doctor Documentation

<p align="center">
  <strong>AI-powered GitHub Repository Health Analyzer</strong>
</p>

---

Welcome to the official documentation for **Repo Doctor** — an agentic CLI tool that performs comprehensive health checks on GitHub repositories using AI.

## What is Repo Doctor?

Repo Doctor is your repository's AI doctor that diagnoses issues and prescribes solutions. Built with the [GitHub Copilot SDK](https://github.com/github/copilot-sdk), it analyzes repositories across **6 critical areas**:

- 📚 **Documentation & Onboarding**
- ⚡ **Developer Experience**
- 🔄 **CI/CD Pipelines**
- 🧪 **Quality & Testing**
- 📋 **Governance**
- 🔐 **Security**

## Quick Navigation

### Getting Started

| Document | Description |
|----------|-------------|
| [🚀 Getting Started](getting-started.md) | Installation, setup, and your first analysis |
| [📖 User Guide](GUIDE.md) | Complete usage guide with examples |
| [🤖 AI Models](AI-MODELS.md) | Available models and recommendations |

### Reference

| Document | Description |
|----------|-------------|
| [💻 Commands Reference](commands.md) | All CLI commands and options |
| [📊 Analysis Categories](analysis-categories.md) | What gets analyzed in each category |
| [🏗️ Architecture](architecture.md) | Technical architecture and design |

### Help & Support

| Document | Description |
|----------|-------------|
| [❓ FAQ](faq.md) | Frequently asked questions |
| [🔧 Troubleshooting](troubleshooting.md) | Common issues and solutions |
| [🤝 Contributing](CONTRIBUTING.md) | How to contribute to the project |

---

## Key Features

### 🔍 Two Analysis Modes

| Mode | Command | Description |
|------|---------|-------------|
| **Quick Scan** | `/analyze <repo>` | Fast analysis via GitHub API (10-30s) |
| **Deep Analysis** | `/deep <repo>` | Full source scan with Repomix (30-60s) |

### 🎯 Prioritized Findings

All issues are classified by priority:

| Priority | Level | Description |
|----------|-------|-------------|
| **P0** | 🔴 Critical | Blockers that must be fixed immediately |
| **P1** | 🟠 High | Important issues affecting project health |
| **P2** | 🟡 Suggestions | Nice-to-have improvements |

### 📊 Health Score

Get an overall health percentage (0-100%) based on weighted category scores:

```
📊 Health Score: 78%

| Category              | Score | Issues |
|-----------------------|-------|--------|
| 📚 Docs & Onboarding  | 85%   | 1 P2   |
| ⚡ Developer Experience| 90%   | 0      |
| 🔄 CI/CD              | 70%   | 1 P1   |
| 🧪 Quality & Tests    | 65%   | 1 P1   |
| 📋 Governance         | 80%   | 1 P2   |
| 🔐 Security           | 75%   | 1 P1   |
```

---

## Quick Start

```bash
# Install
git clone https://github.com/glaucia86/repo-doctor.git
cd repo-doctor && npm install && npm run build && npm link

# Run interactive mode
repo-doctor

# Or analyze directly
repo-doctor vercel/next.js
```

See the [Getting Started Guide](getting-started.md) for detailed instructions.

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 18.0.0 or higher |
| GitHub Copilot | Active subscription |
| Git | Any recent version |

---

## Support

- 🐛 **Found a bug?** [Open an issue](https://github.com/glaucia86/repo-doctor/issues/new)
- 💡 **Have an idea?** [Start a discussion](https://github.com/glaucia86/repo-doctor/discussions)
- 🤝 **Want to contribute?** Read our [Contributing Guide](CONTRIBUTING.md)

---

<p align="center">
  Made with 💚 by <a href="https://github.com/glaucia86">Glaucia Lemos</a>
</p>
