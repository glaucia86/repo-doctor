# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 🗺️ Roadmap

### v2.1.0 (Planned)
- 🔍 **Dependency Audit Integration** — `npm audit`, `pip-audit`, `cargo audit`
- 🔑 **Secrets Scanning** — Detect exposed API keys, tokens via regex patterns

### v3.0.0 (Future)
- 🛡️ **Gitleaks Integration** — Advanced secrets detection
- 📦 **SBOM Generation** — Software Bill of Materials with Syft/CycloneDX
- 🔗 **Snyk/Trivy Integration** — Optional vulnerability scanning
- 🔬 **CodeQL Support** — Static analysis integration

### v4.0.0 (Vision)
- 🌐 **Web UI** — Browser-based interface for non-CLI users
- 📊 **Dashboard** — Visual health reports with charts and trends
- 🔄 **Scheduled Scans** — Automated periodic repository health checks
- 📈 **Historical Tracking** — Track repository health over time
- 🏢 **Organization View** — Analyze multiple repositories at once

---

## [2.0.0] - 2026-01-23

### Added

- **Deep Analysis Mode**: New `/deep` command with Repomix integration for comprehensive source code analysis
- **Security**: Content sanitization utilities to prevent prompt injection attacks
- **Documentation**: Comprehensive Copilot instructions (`.github/copilot-instructions.md`)
- **Documentation**: AGENTS.md with improved clarity and detail for agent configuration
- **Documentation**: CLAUDE.md for project context and guidance

### Changed

- Enhanced README with improved structure, clarity, and visual formatting
- Updated demo image for better visual representation
- Reorganized README structure for better project description

### Fixed

- License section header for improved clarity

## [1.0.0] - 2026-01-22

### Added

- Initial release of Repo Doctor
- **Core Features**:
  - CLI with interactive chat mode using Commander.js
  - GitHub repository analysis via Octokit REST API
  - Integration with GitHub Copilot SDK
- **Analysis Tools**:
  - `get_repo_meta`: Fetch repository metadata
  - `list_repo_files`: List repository file structure
  - `read_repo_file`: Read individual file contents
- **AI Integration**:
  - Claude Sonnet 4.5 as default AI model
  - Verbose logging for tool events
  - Streaming responses with real-time output
- **UI Components**:
  - Display module with themed output
  - Interactive prompts using Inquirer.js
  - Terminal themes with Chalk styling
  - Loading spinners with Ora
- **Documentation**:
  - AGENTS.md with agent configuration and custom tools documentation
  - Comprehensive README with usage instructions
- **Developer Experience**:
  - EditorConfig for consistent code formatting
  - TypeScript configuration with ES2022 target
  - Zod schemas for type validation

### Technical

- GitHub provider with Octokit factory and token resolution
- Markdown reporter for analysis output
- Type definitions with Zod schemas

---

[2.0.0]: https://github.com/glaucia86/repo-doctor/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/glaucia86/repo-doctor/releases/tag/v1.0.0
