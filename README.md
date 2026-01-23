# 🩺 Repo Doctor

<div align="center">

[![Star this repo](https://img.shields.io/github/stars/glaucia86/repo-doctor?style=social)](https://github.com/glaucia86/repo-doctor/stargazers)
[![Fork this repo](https://img.shields.io/github/forks/glaucia86/repo-doctor?style=social)](https://github.com/glaucia86/repo-doctor/fork)

⭐ **Star** and 🍴 **Fork** to support and contribute!

</div>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-SDK-000000?logo=github&logoColor=white)](https://github.com/github/copilot-sdk)
[![Version](https://img.shields.io/badge/version-2.0.0-green)](package.json)

</div>

![Repo Doctor Demo](resources/image.png)

<div align="center">

**Agentic CLI Tool for GitHub Repository Health Analysis**

Built with the [GitHub Copilot SDK](https://github.com/github/copilot-sdk) — the same AI agent runtime that powers Copilot CLI.

</div>

Your repository's AI doctor that diagnoses issues and prescribes solutions. **Repo Doctor** performs comprehensive health checks across 6 critical areas — documentation, developer experience, CI/CD, testing, governance, and security — delivering a detailed diagnosis with prioritized findings (P0/P1/P2) and actionable remediation steps.

**Two analysis modes:** 

- Quick scan via GitHub API or 
- Deep analysis using [Repomix](https://github.com/yamadashy/repomix) for full source code inspection. 

Get a health score, evidence-based findings, and ready-to-use code snippets to fix issues — all through an interactive CLI with 10+ AI models.

---

## ✨ Features

- **💬 Interactive Chat Interface** - Modern CLI with slash commands
- **🤖 10 AI Models** - Choose between free and premium models
- **🔬 Deep Analysis** - Full repository scan using [Repomix](https://github.com/yamadashy/repomix)
- **📊 Health Score** - Overall health percentage for your repository
- **🎯 Prioritized Findings** - Issues classified as P0 (critical), P1 (high), P2 (nice-to-have)
- **💡 Actionable Recommendations** - Specific steps with code snippets
- **📋 Clipboard & Export** - Copy or save reports in Markdown/JSON

## 🔍 What Gets Analyzed?

| Category | What's Checked |
|----------|----------------|
| 📚 **Docs & Onboarding** | README, setup instructions, contributing guidelines |
| ⚡ **Developer Experience** | Build scripts, language version, project structure, monorepo configs |
| 🔄 **CI/CD** | GitHub Actions, test automation, build pipelines |
| 🧪 **Quality & Tests** | Test framework, linting, formatting, coverage |
| 📋 **Governance** | LICENSE, CODE_OF_CONDUCT, SECURITY policy |
| 🔐 **Security** | Dependabot/Renovate, security policy |

---

## 🚀 Quick Start

### Prerequisites

- **GitHub Copilot** - Active subscription
- **Node.js** - Version 18.0.0 or higher

### Installation

```bash
git clone https://github.com/glaucia86/repo-doctor.git
cd repo-doctor
npm install
npm run build
npm link
```

### Usage

```bash
# Interactive mode
repo-doctor

# Direct analysis
repo-doctor vercel/next.js

# With specific model
repo-doctor vercel/next.js --model gpt-4o
```

---

## 📖 Commands

| Command | Description |
|---------|-------------|
| `/analyze <repo>` | Quick analysis via GitHub API |
| `/deep <repo>` | Deep analysis with full source scan |
| `/copy` | Copy report to clipboard |
| `/export [path]` | Save report to file |
| `/model [name]` | Switch AI model |
| `/help` | Show all commands |

> 💡 See the [User Guide](docs/GUIDE.md) for complete command reference.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 User Guide](docs/GUIDE.md) | Complete usage guide, commands, and examples |
| [🤖 AI Models](docs/AI-MODELS.md) | Available models and recommendations |
| [🤝 Contributing](docs/CONTRIBUTING.md) | How to contribute to Repo Doctor |

---

## 🏗️ Tech Stack

- **[@github/copilot-sdk](https://github.com/github/copilot-sdk)** - AI orchestration
- **[@octokit/rest](https://github.com/octokit/rest.js)** - GitHub API
- **[Repomix](https://github.com/yamadashy/repomix)** - Repository packing
- **[Commander](https://github.com/tj/commander.js)** - CLI framework
- **[Chalk](https://github.com/chalk/chalk)** - Terminal styling
- **[Zod](https://github.com/colinhacks/zod)** - Schema validation

---

## ⭐ Support This Project

If you find Repo Doctor useful:

- **⭐ Star** this repository
- **🐛 Report** issues you encounter
- **💡 Suggest** new features
- **🔀 Contribute** via pull requests

[![GitHub issues](https://img.shields.io/github/issues/glaucia86/repo-doctor)](https://github.com/glaucia86/repo-doctor/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/glaucia86/repo-doctor)](https://github.com/glaucia86/repo-doctor/pulls)

---

## 📄 License

MIT © [Glaucia Lemos](https://github.com/glaucia86)

---

## 👩‍💻 Author

<div align="center">
  <a href="https://github.com/glaucia86">
    <img src="https://github.com/glaucia86.png" width="100px;" alt="Glaucia Lemos" style="border-radius: 50%;"/>
  </a>
  <br />
  <strong>Glaucia Lemos</strong>
  <br />
  <sub>A.I Developer at Zup Innovation/Itaú</sub>
  <br /><br />
  <a href="https://mvp.microsoft.com/pt-BR/MVP/profile/d3200941-395d-423b-a0ec-eb0577d3bb86">
    <img src="https://img.shields.io/badge/Microsoft%20MVP-Web%20Technologies-blue?logo=microsoft&logoColor=white" alt="Microsoft MVP"/>
  </a>
  <br /><br />
  <a href="https://twitter.com/glaucia_lemos86">🐦 Twitter</a> •
  <a href="https://www.linkedin.com/in/glaucialemos/">💼 LinkedIn</a> •
  <a href="https://github.com/glaucia86">🐙 GitHub</a>
</div>

---

<p align="center">
  Made with 💚 using the GitHub Copilot SDK
</p>

<p align="center">
  <a href="https://github.com/glaucia86/repo-doctor/stargazers">
    <img src="https://img.shields.io/github/stars/glaucia86/repo-doctor?style=for-the-badge&logo=github&color=yellow" alt="Stars"/>
  </a>
</p>