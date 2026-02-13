/**
 * Include/Exclude Patterns for Repository Packing
 * Single Responsibility: Pattern configuration for Repomix
 */

// ─────────────────────────────────────────────────────────────
// Default Include Patterns (Governance Analysis)
// ─────────────────────────────────────────────────────────────

/** Default patterns for governance and config analysis */
export const DEFAULT_INCLUDE_PATTERNS = [
  // Documentation
  "README*",
  "*.md",
  "docs/**/*.md",
  // Governance
  "LICENSE*",
  "CONTRIBUTING*",
  "CODE_OF_CONDUCT*",
  "SECURITY*",
  "CHANGELOG*",
  // GitHub
  ".github/**",
  // Config files
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "package-lock.json",
  "tsconfig*.json",
  ".eslintrc*",
  ".prettierrc*",
  "turbo.json",
  "nx.json",
  "lerna.json",
  ".nvmrc",
  ".node-version",
  // Python
  "pyproject.toml",
  "setup.py",
  "setup.cfg",
  "requirements*.txt",
  "Pipfile*",
  "poetry.lock",
  // Rust
  "Cargo.toml",
  "Cargo.lock",
  // Go
  "go.mod",
  "go.sum",
  // Java/Kotlin
  "pom.xml",
  "build.gradle*",
  "settings.gradle*",
  // Ruby
  "Gemfile*",
  // .NET
  "*.csproj",
  "*.sln",
  "nuget.config",
  // Docker
  "Dockerfile*",
  "docker-compose*.yml",
  "docker-compose*.yaml",
  // CI/CD
  ".travis.yml",
  ".circleci/**",
  "azure-pipelines.yml",
  ".gitlab-ci.yml",
  "Jenkinsfile",
  // Test configs
  "jest.config*",
  "vitest.config*",
  "playwright.config*",
  "cypress.config*",
  ".mocharc*",
  // Misc configs
  ".editorconfig",
  ".gitignore",
  ".gitattributes",
  ".env.example",
];

// ─────────────────────────────────────────────────────────────
// Deep Include Patterns (Full Source Analysis)
// ─────────────────────────────────────────────────────────────

/** Extended patterns for deep source code analysis */
export const DEEP_INCLUDE_PATTERNS = [
  ...DEFAULT_INCLUDE_PATTERNS,
  // Source code (top-level and src/)
  "src/**",
  "lib/**",
  "app/**",
  "pages/**",
  "components/**",
  // Test files
  "test/**",
  "tests/**",
  "__tests__/**",
  "spec/**",
  // Scripts
  "scripts/**",
  "bin/**",
];

// ─────────────────────────────────────────────────────────────
// Default Exclude Patterns
// ─────────────────────────────────────────────────────────────

export const DEFAULT_EXCLUDE_PATTERNS = [
  // Dependencies
  "node_modules/**",
  "vendor/**",
  ".venv/**",
  "venv/**",
  "__pycache__/**",
  // Build outputs
  "dist/**",
  "build/**",
  "out/**",
  ".next/**",
  ".nuxt/**",
  "target/**",
  // IDE
  ".idea/**",
  ".vscode/**",
  // Misc
  "coverage/**",
  ".git/**",
  "*.min.js",
  "*.min.css",
  "*.bundle.js",
  "*.map",
];

// ─────────────────────────────────────────────────────────────
// Public Getters (Immutable copies)
// ─────────────────────────────────────────────────────────────

/**
 * Get default include patterns for governance analysis.
 */
export function getDefaultIncludePatterns(): string[] {
  return [...DEFAULT_INCLUDE_PATTERNS];
}

/**
 * Get deep include patterns for source code analysis.
 */
export function getDeepIncludePatterns(): string[] {
  return [...DEEP_INCLUDE_PATTERNS];
}
