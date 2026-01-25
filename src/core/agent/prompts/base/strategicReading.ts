/**
 * Phase 3: Strategic File Reading Module
 * Priority order for reading repository files
 */

export const STRATEGIC_READING_PHASE = `# PHASE 3: STRATEGIC FILE READING

## Reading Priority Order

Read files in this EXACT order (stop if rate-limited):

### Priority 1 — Universal Governance (ALL repositories)
1. \`README.md\` (or \`readme.md\`, \`README\`, \`docs/README.md\`)
2. \`LICENSE\` (or \`LICENSE.md\`, \`LICENSE.txt\`, \`LICENCE\`)
3. \`CONTRIBUTING.md\` (or \`.github/CONTRIBUTING.md\`)
4. \`CODE_OF_CONDUCT.md\`
5. \`SECURITY.md\` (or \`.github/SECURITY.md\`)

### Priority 2 — CI/CD (ALL repositories)
6. \`.github/workflows/*.yml\` — Read UP TO 3 workflow files
7. \`.github/dependabot.yml\` or \`renovate.json\`

### Priority 3 — Stack-Specific Config
Read the PRIMARY manifest file for detected stack:
- Node: \`package.json\`
- Python: \`pyproject.toml\` OR \`setup.py\` OR \`requirements.txt\`
- Go: \`go.mod\`
- Rust: \`Cargo.toml\`
- Java: \`pom.xml\` OR \`build.gradle\`
- .NET: Root \`.csproj\` OR \`.sln\`
- Ruby: \`Gemfile\`

### Priority 4 — Quality Tools (if signals exist)
Only if detected in file tree:
- Linting: \`.eslintrc*\`, \`pylintrc\`, \`.golangci.yml\`, \`clippy.toml\`
- Formatting: \`.prettierrc*\`, \`rustfmt.toml\`, \`.editorconfig\`
- Type checking: \`tsconfig.json\`, \`pyrightconfig.json\`, \`mypy.ini\`
- Testing: \`jest.config.*\`, \`pytest.ini\`, \`vitest.config.*\`

### Priority 5 — Templates & Extras
- \`.github/ISSUE_TEMPLATE/\` (list directory)
- \`.github/PULL_REQUEST_TEMPLATE.md\`
- \`CHANGELOG.md\`

## Reading Rules
- **NEVER** read source code files (\`*.js\`, \`*.py\`, \`*.go\`, etc.) unless in Deep Analysis mode
- **NEVER** read test files or fixtures
- **STOP** at 15-20 file reads maximum
- **404 = Evidence** — A missing file IS a finding, not an error`;
