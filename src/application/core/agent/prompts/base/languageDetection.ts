/**
 * Phase 2: Language Detection Module
 * Stack detection and adaptation rules
 */

export const LANGUAGE_DETECTION_PHASE = `# PHASE 2: LANGUAGE DETECTION & ADAPTATION

Detect the primary technology stack from metadata + file tree.
Adapt your analysis strategy based on what you find:

## Stack Detection Rules

| Signal Files | Stack Detected | Governance Files to Check |
|--------------|----------------|---------------------------|
| \`package.json\`, \`tsconfig.json\`, \`.nvmrc\` | Node.js/TypeScript | \`package.json\` scripts, \`.npmrc\`, lockfiles |
| \`pyproject.toml\`, \`setup.py\`, \`requirements.txt\`, \`Pipfile\` | Python | \`tox.ini\`, \`pytest.ini\`, \`.python-version\`, \`pyproject.toml\` |
| \`go.mod\`, \`go.sum\` | Go | \`Makefile\`, \`go.mod\` |
| \`Cargo.toml\`, \`Cargo.lock\` | Rust | \`Cargo.toml\`, \`clippy.toml\`, \`rustfmt.toml\` |
| \`pom.xml\`, \`build.gradle\`, \`build.gradle.kts\` | Java/Kotlin | \`pom.xml\`, \`build.gradle\`, Maven/Gradle wrappers |
| \`*.csproj\`, \`*.sln\`, \`Directory.Build.props\` | .NET/C# | \`.csproj\`, \`global.json\`, \`nuget.config\` |
| \`Gemfile\`, \`*.gemspec\` | Ruby | \`Gemfile\`, \`.ruby-version\`, \`Rakefile\` |
| \`composer.json\` | PHP | \`composer.json\`, \`phpunit.xml\` |
| \`mix.exs\` | Elixir | \`mix.exs\`, \`.formatter.exs\` |
| \`pubspec.yaml\` | Dart/Flutter | \`pubspec.yaml\`, \`analysis_options.yaml\` |
| \`CMakeLists.txt\`, \`Makefile\` only | C/C++ | \`CMakeLists.txt\`, \`Makefile\`, \`.clang-format\` |
| \`Dockerfile\`, \`docker-compose.yml\` | Container-based | \`Dockerfile\`, \`docker-compose.yml\` |
| \`terraform/*.tf\`, \`*.tf\` | Infrastructure (Terraform) | \`.terraform-version\`, \`*.tf\` |

If multiple stacks detected, analyze ALL relevant configurations.

## Monorepo Detection

| Signal | Type | Strategy |
|--------|------|----------|
| \`pnpm-workspace.yaml\`, \`packages/*/package.json\` | Node monorepo | Check root + key packages |
| \`turbo.json\`, \`nx.json\`, \`lerna.json\` | Node monorepo (orchestrated) | Verify orchestrator config |
| \`apps/\`, \`packages/\`, \`libs/\` folders | Generic monorepo | Sample 2-3 subprojects |
| \`go.work\` | Go workspace | Check workspace config |
| \`Cargo.toml\` with \`[workspace]\` | Rust workspace | Check workspace members |`;
