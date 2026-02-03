# 🚀 Getting Started

This guide will help you install Repo Doctor and run your first repository health analysis.

---

## ⚡ Quick Start (5 minutes)

Want to see Repo Doctor in action? Here's how to test the GitHub issue creation feature:

### 1. Get a GitHub Token

```bash
# Go to: https://github.com/settings/tokens
# Generate new token (classic) with repo scope OR granular permissions (metadata, contents, issues)
# Copy the token (starts with ghp_)
```

### 2. Test with Your Repository

```bash
# Replace with your actual token and repository
export GITHUB_TOKEN=ghp_your_token_here

# This will create multiple GitHub issues automatically!
repo-doctor analyze your-username/your-repo --issue
```

### 3. Check the Results

Visit your repository's **Issues** tab - you should see new issues like:
- 🔴 [Repo Doctor] docs: Missing README
- 🟠 [Repo Doctor] ci: No CI/CD Pipeline  
- 🟡 [Repo Doctor] dx: Code Quality Issues

**That's it!** 🎉 Each issue contains detailed analysis, impact assessment, and fix instructions.

---

## Table of Contents

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

### 5. GitHub Personal Access Token (For Publishing Features)

To use advanced features like creating issues or commenting on PRs, you need a GitHub Personal Access Token:

#### How to Generate a Token

1. **Go to GitHub Settings**
   - Visit [GitHub.com](https://github.com)
   - Click your profile photo → **Settings**

2. **Access Developer Settings**
   - Scroll down → **Developer settings**
   - Click **Personal access tokens**
   - Choose **Tokens (classic)**

3. **Generate New Token**
   - Click **Generate new token (classic)**
   - **Name**: `Repo Doctor` (or descriptive name)
   - **Expiration**: Choose appropriate time (30 days recommended)
   - **Scopes**: Select minimal required permissions

#### Required Permissions

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| **Metadata** | Read-only | Repository metadata (required) |
| **Contents** | Read-only | Read repository contents |
| **Issues** | Read and write | Create issues with reports |
| **Pull requests** | Read and write | Comment on PRs |

#### Usage Examples

```bash
# Set token as environment variable (recommended)
export GITHUB_TOKEN=ghp_your_token_here

# Or pass it only for a single command (avoids storing it in shell history)
GITHUB_TOKEN=ghp_your_token_here repo-doctor analyze owner/repo --issue
```

#### Security Notes

- **Never commit tokens** to version control
- Use tokens with short expiration dates
- Revoke unused tokens immediately
- Consider GitHub Apps for production use

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

# 🔥 NEW: Create GitHub issues automatically
export GITHUB_TOKEN=ghp_your_token_here
repo-doctor analyze your-username/your-repo --issue
```

### Publishing Reports to GitHub

**Want to try the publishing features?** Here's how:

#### Quick Test with Issues

```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_your_token_here

# Create issues for each problem found
repo-doctor analyze your-username/your-repo --issue

# Result: Multiple GitHub issues created automatically!
```

#### Interactive Mode

```bash
# Set token securely for the session
export GITHUB_TOKEN=ghp_your_token_here

# Then start interactive mode
repo-doctor chat
# Then type:
/analyze facebook/react --issue
/deep microsoft/vscode
```

---

## 🧪 Testing Publishing Features

Want to try the publishing features? Here's a complete step-by-step guide:

### Step 1: Get Your GitHub Token

1. **Go to GitHub Settings**
   - Visit [github.com](https://github.com) → Your profile → **Settings**

2. **Generate Personal Access Token**
   - **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - Click **"Generate new token (classic)"**
   - **Name**: `Repo Doctor Test`
   - **Expiration**: 7 days (for testing)
   - **Scopes**: Select one of these options:
     - `repo` (full control of private repositories) **OR**
     - Granular permissions:
       - `metadata` — Read repository metadata
       - `contents` — Read repository contents  
       - `issues` — Create and manage issues

3. **Copy the token** (starts with `ghp_`)

### Step 2: Test with Interactive Mode

```bash
# Set your token securely
export GITHUB_TOKEN=ghp_your_token_here

# Start interactive mode
repo-doctor chat
```

### Step 3: Test Issue Creation

```bash
# In the chat, type:
/analyze facebook/react --issue
```

**What happens:**
- ✅ Analyzes the repository
- ✅ Creates a GitHub issue in `facebook/react` (if you have access)
- ✅ Or creates issues in your own repository if you don't have access to facebook/react

### Step 4: Test with Your Own Repository

```bash
# Use your own repository for testing
/analyze your-username/your-repo --issue
```

**Expected Result:**
- Multiple issues created, one for each problem found
- Each issue has detailed description, impact, and fix instructions
- Issues are labeled by category (docs, dx, ci, security, etc.)

### Example Output

After running `/analyze facebook/react --issue`, you should see:

```
✓ Analysis completed successfully!
  Made 25 API calls in 45.2s

  Publishing report as GitHub issue(s)...

✓ Report published: 3 issues created.
  https://github.com/facebook/react/issues/123
  https://github.com/facebook/react/issues/124
  https://github.com/facebook/react/issues/125
```

### Troubleshooting Publishing

**"Repository not found"**
- Check repository name spelling
- Ensure you have access to the repository
- Try with your own repository first

**"Token permission denied"**
- Regenerate token with correct scopes
- Make sure you have `repo` scope OR the granular permissions: `metadata`, `contents`, and `issues`

**"No issues created"**
- The repository might be very healthy (no issues found)
- Check the analysis output for problems

### Security Best Practices

- **Never commit tokens** to code
- Use short-lived tokens for testing
- Revoke tokens after testing
- Consider GitHub Apps for production use

---

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

### Publishing Features

With a GitHub Personal Access Token, you can automatically publish analysis reports:

#### Create Issues with Reports

```bash
# Create a GitHub issue with the complete analysis
GITHUB_TOKEN=ghp_your_token repo-doctor analyze owner/repo --issue

# The issue includes:
# - Title: "Repo Doctor Report: owner/repo"
# - Labels: Based on findings (docs, dx, ci, security, etc.)
# - Body: Full analysis report in Markdown format
```

#### Interactive Mode

```bash
repo-doctor chat
# Then use:
/analyze owner/repo --issue
/deep owner/repo
```

### Integrate into Workflow

- Run Repo Doctor before major releases
- Use it in CI/CD for automated health checks
- Share reports with your team
- **Auto-publish issues** for tracking repository improvements
- **PR comments** for real-time feedback during code reviews

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
