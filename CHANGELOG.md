# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [2.1.2] - 2026-02-13

### Added

- **CLI**: Support for `/model` command in onboarding phase

### Fixed

- **CLI**: Fixed `/model` command requiring double input in onboarding phase

---

## 🗺️ Roadmap

### v2.2.0 (Planned)
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

## [2.3.0] - 2026-02-04

### Changed

- **Issue Publishing**: Improved priority label handling in `publishReport.ts` (removed unnecessary `.toLowerCase()`)
- **Documentation**: Enhanced `--issue` feature documentation with setup instructions and 401 troubleshooting
- **Documentation**: Updated AI model recommendations, highlighting Claude Sonnet 4.5 for best report quality with `--issue`
- **Documentation**: Improved token handling instructions for security best practices
- **Documentation**: Updated interactive mode instructions for secure token handling

### Fixed

- **Priority Labels**: Ensured consistent case handling for issue priority labels

---

### Added

- **Infinite Sessions Support** (Copilot SDK v0.1.18)
  - Automatic context compaction for long-running analyses
  - Background compaction triggers at 80% buffer usage
  - Buffer exhaustion threshold at 95% for blocking protection
  - New events: `session.compaction_start`, `session.compaction_complete`
  - Verbose mode shows compaction progress and tokens freed

- **Modular Theme System** (`src/ui/themes/`)
  - `colors.ts`: COLORS palette & chalk helpers
  - `icons.ts`: ICON, category/priority mappings
  - `box.ts`: Box drawing utilities
  - `badges.ts`: Progress bars, health scores
  - `logo.ts`: Logo renderers
  - Reduced `src/ui/themes.ts` from monolithic to re-exports

- **Modular Repomix Integration** (`src/core/repoPacker/`)
  - `packer.ts`: Main `packRemoteRepository` function
  - `executor.ts`: Repomix process execution
  - `errors.ts`: Error categorization & sanitization
  - `patterns.ts`: Include/exclude patterns (governance vs deep)
  - `cleaner.ts`: Temp directory cleanup
  - `availability.ts`: npx/repomix availability check
  - `types.ts`: PackOptions, PackResult, PackErrorReason

- **Modular Prompt System** (`src/core/agent/prompts/`)
  - Base modules: securityDirective, expertiseProfile, reconnaissance, languageDetection, strategicReading, analysisCriteria, scoring, evidenceRules, outputFormat, constraints, errorHandling
  - Mode-specific extensions: `modes/quick.ts`, `modes/deep.ts`
  - Prompt composition: `composers/systemPromptComposer.ts`
  - Follows Open/Closed Principle (OCP) for easy extension

- **Integration Tests**: `tests/tools/repoPacker.integration.test.ts`
- **Unit Tests**: `tests/tools/repoPacker.test.ts` (598 lines)

### Changed

- **Copilot SDK**: Upgraded from v0.1.15 to v0.1.18
- **Guardrails**: Increased limits for more reliable agent execution
  - `maxToolCalls`: 30 → 50 (standard), 40 → 80 (deep)
  - `maxConsecutiveRepeats`: 3 → 5
  - `minSequenceLength`: 2 → 3 (reduces false positives)
  - `timeWindowMs`: 60s → 120s
  - Fixed sequence matching to compare tool name AND args hash
- **Architecture**: Major refactoring following SOLID principles
  - `src/ui/themes.ts`: Monolithic → modular re-exports
  - `src/core/repoPacker.ts`: Monolithic → modular re-exports
  - `src/core/agent/prompts/systemPrompt.ts`: Simplified to legacy exports

### Fixed

- **Repomix Integration**: Windows/Node.js v25+ shell compatibility
- **Regex Patterns**: Escaped square brackets in character classes
- **Unused Variables**: Removed stdout collection in repoPacker.ts

---

## [2.1.0] - 2026-01-23

### Added

- **Agent Guardrails**: Loop prevention with `ToolCallTracker` and `AgentGuardrails`
  - Step limit enforcement (30 standard / 40 deep)
  - Consecutive identical call detection
  - Sequence loop detection (A→B→A→B patterns)
  - Progressive response: warn → inject replan message → abort
- **Testing Infrastructure**: 86 unit tests across 7 test files
  - `tests/cli/parsers/repoParser.test.ts` (12 tests)
  - `tests/cli/parsers/reportExtractor.test.ts` (9 tests)
  - `tests/cli/state/appState.test.ts` (16 tests)
  - `tests/core/agent/analysisPrompt.test.ts` (8 tests)
  - `tests/core/agent/eventHandler.test.ts` (17 tests)
  - `tests/core/agent/toolCallTracker.test.ts` (13 tests)
  - `tests/core/agent/guardrails.test.ts` (11 tests)
- **Vitest Configuration**: `vitest.config.ts` with proper TypeScript support
- **Deep Analysis Improvements**: Enhanced PHASE 6 instructions with comprehensive checklist

### Changed

- **Major Refactoring (SOLID Principles)**:
  - `src/cli.ts`: 1165 → 186 lines (-84%)
  - Extracted `src/cli/chatLoop.ts` — Interactive REPL
  - Extracted `src/cli/handlers/` — One file per command (SRP)
  - Extracted `src/cli/parsers/` — URL parsing, report extraction
  - Extracted `src/cli/state/appState.ts` — Centralized state management
  - Extracted `src/core/agent/prompts/` — Isolated system and analysis prompts (OCP)
  - Extracted `src/tools/` — Individual tool files (DIP)
  - Extracted `src/ui/display/` — Modular UI components
- **Interfaces**: Added `src/types/interfaces.ts` with shared interfaces (ISP)

### Fixed

- `/copy` command now captures full report (not just Deep Analysis section)

---

## [2.0.0] - 2026-01-23

### Added

- **Deep Analysis Mode**: New `/deep` command with Repomix integration for comprehensive source code analysis
- **Security**: Content sanitization utilities to prevent prompt injection attacks
- **Documentation**: Comprehensive Copilot instructions (`.github/copilot-instructions.md`)
- **Documentation**: AGENTS.md with improved clarity and detail for agent configuration

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

[2.3.0]: https://github.com/glaucia86/repo-doctor/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/glaucia86/repo-doctor/compare/v2.1.0...v2.2.0
[2.1.2]: https://github.com/glaucia86/repo-doctor/compare/v2.1.1...v2.1.2
[2.1.0]: https://github.com/glaucia86/repo-doctor/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/glaucia86/repo-doctor/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/glaucia86/repo-doctor/releases/tag/v1.0.0
[Unreleased]: https://github.com/glaucia86/repo-doctor/compare/v2.1.2...HEAD
