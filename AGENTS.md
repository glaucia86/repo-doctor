# AGENTS.md — Repo Doctor

## Agent Configuration & Custom Tools

Este documento define a configuração do agente do Copilot SDK para o Repo Doctor, incluindo system prompts, custom tools e estratégias de análise.

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    REPO DOCTOR AGENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ CopilotClient│───►│   Session    │───►│ Custom Tools │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         │                   │                   ▼               │
│         │                   │          ┌──────────────┐         │
│         │                   │          │ get_repo_meta│         │
│         │                   │          │ list_tree    │         │
│         │                   │          │ read_file    │         │
│         │                   │          │ analyze      │         │
│         │                   │          └──────────────┘         │
│         │                   │                                   │
│         ▼                   ▼                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              System Prompt + Instructions             │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. System Prompt

O system prompt define o comportamento e as restrições do agente:

```typescript
const SYSTEM_PROMPT = `You are Repo Doctor, an AI-powered GitHub repository health analyzer.

## Your Role
You analyze GitHub repositories to diagnose issues and provide actionable recommendations.
You are methodical, thorough, and always provide evidence for your findings.

## Core Principles

1. **Minimal Reading**: Only read files that are essential for diagnosis.
   - Start with metadata and file tree
   - Prioritize governance files (README, LICENSE, CONTRIBUTING)
   - Read config files (package.json, tsconfig, workflows)
   - Never read source code files unless absolutely necessary

2. **Evidence-Based**: Every finding must have evidence.
   - Reference specific files or configurations
   - Quote relevant content when helpful
   - Explain why something matters

3. **Prioritization**: Classify findings by priority.
   - P0: Critical blockers (missing LICENSE, no CI, no README)
   - P1: High impact issues (CI without tests, no contributing guide)
   - P2: Nice-to-have improvements (badges, templates)

4. **Resilience**: Handle errors gracefully.
   - 404 means file is missing (evidence of absence)
   - Rate limits mean reduce scope, not fail
   - Timeout means generate partial report

5. **Actionability**: Recommendations must be specific.
   - Tell exactly what to create/change
   - Provide examples when helpful
   - Estimate effort/impact when possible

## Analysis Categories

1. **Docs & Onboarding**
   - README quality and completeness
   - Setup instructions
   - Contributing guidelines

2. **Developer Experience (DX)**
   - npm scripts (dev, build, test, lint)
   - Node version management
   - Monorepo configuration

3. **CI/CD**
   - Workflow presence and quality
   - Test automation
   - Deployment automation

4. **Quality & Tests**
   - Test framework configuration
   - Linting and formatting
   - Type checking

5. **Governance**
   - LICENSE
   - CODE_OF_CONDUCT
   - SECURITY policy
   - Issue/PR templates

6. **Security Basics**
   - Dependabot/Renovate
   - Security policy
   - Secret management hints

## Output Format

Always structure your final report as:

### Health Score
A percentage reflecting overall repository health.

### Findings by Priority
Group findings by P0, P1, P2 with:
- Issue title
- Evidence (what you found or didn't find)
- Impact (why this matters)
- Action (specific recommendation)

### Summary
Brief overview and next steps.

## Constraints

- Do NOT execute any commands
- Do NOT download the entire repository
- Do NOT read more than 200KB per file
- Do NOT expose tokens or sensitive data
- Do NOT make assumptions without evidence

Begin each analysis by stating your plan, then execute step by step.`;
```

---

## 3. Custom Tools

### 3.1. Tool: get_repo_meta

Coleta metadados do repositório via GitHub API.

```typescript
import { defineTool, ToolResultObject } from "@github/copilot-sdk";
import { z } from "zod";

const getRepoMetaTool = defineTool<{
  owner: string;
  repo: string;
}>({
  name: "get_repo_meta",
  description: `Fetches repository metadata from GitHub API.
Returns: owner, name, description, default_branch, visibility, size, 
archived, disabled, fork, open_issues_count, topics, languages, 
created_at, updated_at, pushed_at.`,
  parameters: z.object({
    owner: z.string().describe("Repository owner/organization"),
    repo: z.string().describe("Repository name"),
  }),
  handler: async ({ owner, repo }): Promise<ToolResultObject> => {
    const client = getGitHubClient();
    
    try {
      const metadata = await client.getRepoMeta(owner, repo);
      
      return {
        textResultForLlm: JSON.stringify(metadata, null, 2),
        resultType: "success",
      };
    } catch (error) {
      return {
        textResultForLlm: `Error fetching metadata: ${error.message}`,
        resultType: "error",
      };
    }
  },
});
```

**Schema de Retorno:**

```typescript
interface RepoMetadata {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  visibility: "public" | "private";
  size: number; // KB
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  openIssuesCount: number;
  topics: string[];
  languages: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  hasIssues: boolean;
  hasWiki: boolean;
  hasPages: boolean;
  license: { key: string; name: string } | null;
}
```

---

### 3.2. Tool: list_tree

Lista a estrutura de arquivos do repositório.

```typescript
const listTreeTool = defineTool<{
  owner: string;
  repo: string;
  branch?: string;
  maxFiles?: number;
}>({
  name: "list_tree",
  description: `Lists repository file tree structure.
Returns array of file paths with sizes.
Use maxFiles to limit results (default 800).
Filters out common noise (node_modules, dist, etc).`,
  parameters: z.object({
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
    branch: z.string().optional().describe("Branch name (uses default if omitted)"),
    maxFiles: z.number().optional().describe("Max files to list (default 800)"),
  }),
  handler: async ({ owner, repo, branch, maxFiles = 800 }): Promise<ToolResultObject> => {
    const client = getGitHubClient();
    
    try {
      const tree = await client.listTree(owner, repo, branch, maxFiles);
      
      // Filter out noise
      const filtered = tree.filter(file => 
        !file.path.includes("node_modules/") &&
        !file.path.includes("dist/") &&
        !file.path.includes(".git/") &&
        !file.path.match(/\.(min|bundle)\.(js|css)$/)
      );
      
      return {
        textResultForLlm: JSON.stringify({
          totalFiles: filtered.length,
          truncated: tree.length >= maxFiles,
          files: filtered.map(f => ({
            path: f.path,
            type: f.type,
            size: f.size,
          })),
        }, null, 2),
        resultType: "success",
      };
    } catch (error) {
      return {
        textResultForLlm: `Error listing tree: ${error.message}`,
        resultType: "error",
      };
    }
  },
});
```

**Schema de Retorno:**

```typescript
interface TreeResult {
  totalFiles: number;
  truncated: boolean;
  files: Array<{
    path: string;
    type: "blob" | "tree";
    size?: number;
  }>;
}
```

---

### 3.3. Tool: read_file

Lê o conteúdo de um arquivo específico.

```typescript
const readFileTool = defineTool<{
  owner: string;
  repo: string;
  path: string;
  ref?: string;
  maxBytes?: number;
}>({
  name: "read_file",
  description: `Reads file content from repository.
Returns file content as text (or base64 for binary).
Truncates at maxBytes (default 200KB).
Returns 404 info if file not found (use as evidence).`,
  parameters: z.object({
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
    path: z.string().describe("File path (e.g., 'README.md', '.github/workflows/ci.yml')"),
    ref: z.string().optional().describe("Git ref (branch/tag/sha)"),
    maxBytes: z.number().optional().describe("Max bytes to read (default 200KB)"),
  }),
  handler: async ({ owner, repo, path, ref, maxBytes = 204800 }): Promise<ToolResultObject> => {
    const client = getGitHubClient();
    
    try {
      const content = await client.readFile(owner, repo, path, ref);
      
      // Check if content is too large
      const truncated = content.length > maxBytes;
      const result = truncated ? content.slice(0, maxBytes) : content;
      
      return {
        textResultForLlm: JSON.stringify({
          path,
          found: true,
          truncated,
          content: result,
        }, null, 2),
        resultType: "success",
      };
    } catch (error) {
      if (error.status === 404) {
        return {
          textResultForLlm: JSON.stringify({
            path,
            found: false,
            error: "File not found",
          }),
          resultType: "success", // Not a tool error, just evidence
        };
      }
      return {
        textResultForLlm: `Error reading file: ${error.message}`,
        resultType: "error",
      };
    }
  },
});
```

---

### 3.4. Tool: analyze_evidence

Processa evidências coletadas e gera achados estruturados.

```typescript
const analyzeEvidenceTool = defineTool<{
  evidence: string;
  category: string;
}>({
  name: "analyze_evidence",
  description: `Analyzes collected evidence and generates structured findings.
Use after collecting metadata, tree, and file contents.
Returns prioritized findings with recommendations.`,
  parameters: z.object({
    evidence: z.string().describe("JSON string with collected evidence"),
    category: z.enum([
      "docs",
      "dx",
      "ci",
      "tests",
      "governance",
      "security",
      "all",
    ]).describe("Category to analyze (or 'all')"),
  }),
  handler: async ({ evidence, category }): Promise<ToolResultObject> => {
    // This tool helps structure the analysis
    // The actual analysis is done by the LLM based on evidence
    
    const parsed = JSON.parse(evidence);
    const template = getAnalysisTemplate(category);
    
    return {
      textResultForLlm: JSON.stringify({
        category,
        template,
        evidenceReceived: Object.keys(parsed),
        instruction: "Analyze the evidence against the template criteria and generate findings.",
      }),
      resultType: "success",
    };
  },
});

function getAnalysisTemplate(category: string) {
  const templates = {
    docs: {
      checks: [
        "README.md exists and has content",
        "README explains what the project does",
        "README has setup/install instructions",
        "README has usage examples",
        "CONTRIBUTING.md exists",
      ],
      p0Triggers: ["No README at all"],
      p1Triggers: ["README has no setup instructions"],
      p2Triggers: ["README could have better examples"],
    },
    dx: {
      checks: [
        "package.json has scripts: dev, build, test, lint",
        "engines field specifies Node version",
        "lockfile present (package-lock, yarn.lock, pnpm-lock)",
        "tsconfig.json present for TypeScript",
        "eslint/prettier configured",
      ],
      p0Triggers: ["No package.json in Node project"],
      p1Triggers: ["Missing test script", "No lockfile"],
      p2Triggers: ["Missing engines field"],
    },
    ci: {
      checks: [
        "GitHub Actions workflows exist",
        "CI runs on push/PR",
        "CI executes tests",
        "CI runs linting",
        "CI runs type checking",
      ],
      p0Triggers: ["No CI at all for non-trivial project"],
      p1Triggers: ["CI exists but doesn't run tests"],
      p2Triggers: ["CI could add caching"],
    },
    tests: {
      checks: [
        "Test framework configured (jest, vitest, etc)",
        "Test files exist",
        "Test script in package.json",
        "Coverage configuration present",
      ],
      p0Triggers: [],
      p1Triggers: ["No tests in complex project"],
      p2Triggers: ["No coverage reporting"],
    },
    governance: {
      checks: [
        "LICENSE file present",
        "CODE_OF_CONDUCT.md present",
        "SECURITY.md or security policy",
        "Issue templates",
        "PR template",
        "CHANGELOG.md",
      ],
      p0Triggers: ["No LICENSE in OSS project"],
      p1Triggers: ["No CONTRIBUTING for collaborative project"],
      p2Triggers: ["No CHANGELOG", "No templates"],
    },
    security: {
      checks: [
        "dependabot.yml configured",
        "renovate.json configured",
        "SECURITY.md exists",
        ".env.example for environment hints",
      ],
      p0Triggers: [],
      p1Triggers: ["No dependency automation"],
      p2Triggers: ["No security policy"],
    },
  };
  
  if (category === "all") {
    return templates;
  }
  return templates[category] || {};
}
```

---

## 4. Session Configuration

### 4.1. Inicialização

```typescript
import { CopilotClient, type SessionEvent } from "@github/copilot-sdk";

export class RepoDoctorAgent {
  private client: CopilotClient;
  private session: Session;
  private currentModel: ModelId = "gpt-4o";
  
  async initialize(): Promise<void> {
    // Find Copilot CLI
    const copilotPath = await findCopilotCli();
    if (!copilotPath) {
      throw new Error("Copilot CLI not found. Please install it first.");
    }
    
    // Create client
    this.client = new CopilotClient({ cliPath: copilotPath });
    await this.client.start();
    
    // Create session with custom tools
    this.session = await this.client.createSession({
      model: this.currentModel,
      streaming: true,
      tools: [
        getRepoMetaTool,
        listTreeTool,
        readFileTool,
        analyzeEvidenceTool,
      ],
      systemMessage: {
        mode: "append",
        content: SYSTEM_PROMPT,
      },
    });
  }
}
```

### 4.2. Event Handling

```typescript
async analyzeRepository(owner: string, repo: string): Promise<AnalysisResult> {
  const events: SessionEvent[] = [];
  
  // Set up event listener
  this.session.on((event: SessionEvent) => {
    events.push(event);
    
    switch (event.type) {
      case "assistant.message_delta":
        // Update UI with streaming content
        this.ui.appendContent(event.content);
        break;
        
      case "tool.execution_start":
        // Show tool execution in progress
        this.ui.showToolStart(event.tool_name);
        break;
        
      case "tool.execution_end":
        // Show tool completion
        this.ui.showToolEnd(event.tool_name, event.success);
        break;
        
      case "session.idle":
        // Analysis complete
        this.ui.showComplete();
        break;
        
      case "quota.update":
        // Update quota display
        this.ui.updateQuota(event.used, event.total);
        break;
    }
  });
  
  // Start analysis
  const prompt = `Analyze the GitHub repository: ${owner}/${repo}

Follow this plan:
1. First, get repository metadata using get_repo_meta
2. List the file tree using list_tree to understand structure
3. Read essential files: README.md, LICENSE, package.json, .github/workflows/*
4. Check for governance files: CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
5. Analyze evidence and generate prioritized findings
6. Produce a comprehensive health report

Begin now.`;

  await this.session.sendMessage(prompt);
  
  // Wait for completion
  await this.session.waitForIdle();
  
  return this.parseResults(events);
}
```

---

## 5. Error Handling Strategy

### 5.1. Rate Limit Handler

```typescript
async function handleRateLimit(error: any, context: AnalysisContext): Promise<void> {
  if (error.status === 403 && error.message.includes("rate limit")) {
    context.rateLimited = true;
    
    // Reduce scope
    context.maxFiles = Math.floor(context.maxFiles / 2);
    context.skipNonEssential = true;
    
    // Notify UI
    ui.showWarning("Rate limited. Reducing analysis scope.");
    ui.suggestAuth("Use --token for higher rate limits.");
  }
}
```

### 5.2. Timeout Handler

```typescript
async function handleTimeout(context: AnalysisContext): Promise<PartialResult> {
  // Generate partial report
  const collected = context.getCollectedEvidence();
  
  return {
    partial: true,
    reason: "timeout",
    findings: analyzePartial(collected),
    message: "Analysis timed out. Report based on collected evidence only.",
  };
}
```

### 5.3. File Not Found Handler

```typescript
// 404 is not an error - it's evidence!
function handleFileNotFound(path: string, context: AnalysisContext): void {
  context.addEvidence({
    type: "file_missing",
    path,
    timestamp: Date.now(),
  });
  
  // Don't throw, just record
}
```

---

## 6. Model Configuration

### 6.1. Modelos Disponíveis

```typescript
export const AVAILABLE_MODELS = [
  { name: "gpt-4.1", premium: false, description: "Fast and capable" },
  { name: "gpt-4o", premium: false, description: "Balanced performance (default)" },
  { name: "gpt-5", premium: true, description: "Most advanced reasoning" },
  { name: "claude-sonnet-4", premium: true, description: "Excellent at analysis" },
  { name: "o3", premium: true, description: "Deep reasoning" },
  { name: "o4-mini", premium: true, description: "Fast reasoning" },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]["name"];
```

### 6.2. Model Switching

```typescript
async switchModel(newModel: ModelId): Promise<void> {
  if (this.session) {
    await this.session.close();
  }
  
  this.currentModel = newModel;
  
  this.session = await this.client.createSession({
    model: newModel,
    streaming: true,
    tools: this.tools,
    systemMessage: { mode: "append", content: SYSTEM_PROMPT },
  });
}
```

---

## 7. Analysis Templates

### 7.1. Target Files Priority

```typescript
const TARGET_FILES = {
  // Priority 1: Essential governance
  essential: [
    "README.md",
    "readme.md",
    "LICENSE",
    "LICENSE.md",
    "package.json",
  ],
  
  // Priority 2: Important governance
  governance: [
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
    ".github/SECURITY.md",
    "CHANGELOG.md",
    ".github/FUNDING.yml",
  ],
  
  // Priority 3: CI/CD
  ci: [
    ".github/workflows/*.yml",
    ".github/workflows/*.yaml",
    "azure-pipelines.yml",
    ".gitlab-ci.yml",
  ],
  
  // Priority 4: DX configuration
  dx: [
    "tsconfig.json",
    ".eslintrc*",
    ".prettierrc*",
    "turbo.json",
    "nx.json",
    "lerna.json",
    ".nvmrc",
    ".node-version",
  ],
  
  // Priority 5: Test configuration
  tests: [
    "jest.config.*",
    "vitest.config.*",
    "playwright.config.*",
    "cypress.config.*",
  ],
  
  // Priority 6: Dependency automation
  automation: [
    ".github/dependabot.yml",
    ".github/dependabot.yaml",
    "renovate.json",
    ".github/renovate.json",
  ],
  
  // Priority 7: Templates
  templates: [
    ".github/ISSUE_TEMPLATE/*",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/pull_request_template.md",
  ],
};
```

### 7.2. Scoring Weights

```typescript
const CATEGORY_WEIGHTS = {
  docs: 0.20,        // 20%
  dx: 0.20,          // 20%
  ci: 0.20,          // 20%
  tests: 0.15,       // 15%
  governance: 0.15,  // 15%
  security: 0.10,    // 10%
};

function calculateHealthScore(findings: Finding[]): number {
  const categoryScores: Record<string, number> = {};
  
  for (const category of Object.keys(CATEGORY_WEIGHTS)) {
    const categoryFindings = findings.filter(f => f.category === category);
    const p0Count = categoryFindings.filter(f => f.priority === "P0").length;
    const p1Count = categoryFindings.filter(f => f.priority === "P1").length;
    const p2Count = categoryFindings.filter(f => f.priority === "P2").length;
    
    // P0 = -30 points, P1 = -15 points, P2 = -5 points
    const deductions = (p0Count * 30) + (p1Count * 15) + (p2Count * 5);
    categoryScores[category] = Math.max(0, 100 - deductions);
  }
  
  // Weighted average
  let total = 0;
  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    total += (categoryScores[category] || 100) * weight;
  }
  
  return Math.round(total);
}
```

---

## 8. Output Formatting

### 8.1. Finding Structure

```typescript
interface Finding {
  id: string;
  category: "docs" | "dx" | "ci" | "tests" | "governance" | "security";
  priority: "P0" | "P1" | "P2";
  title: string;
  evidence: string;
  impact: string;
  action: string;
  files?: string[];
}
```

### 8.2. Report Structure

```typescript
interface AnalysisReport {
  repository: {
    owner: string;
    name: string;
    url: string;
    analyzedAt: string;
  };
  healthScore: number;
  summary: {
    p0Count: number;
    p1Count: number;
    p2Count: number;
  };
  categoryScores: Record<string, number>;
  findings: Finding[];
  metadata: {
    analysisTime: number;
    filesAnalyzed: number;
    partial: boolean;
    model: string;
  };
}
```

---

## 9. CLI Integration

### 9.1. Progress Events

```typescript
type ProgressEvent = 
  | { type: "phase_start"; phase: string }
  | { type: "phase_end"; phase: string; success: boolean }
  | { type: "tool_start"; tool: string }
  | { type: "tool_end"; tool: string; result: "success" | "error" | "not_found" }
  | { type: "finding"; finding: Finding }
  | { type: "progress"; percent: number }
  | { type: "complete"; report: AnalysisReport };
```

### 9.2. Usage Example

```typescript
const agent = new RepoDoctorAgent();
await agent.initialize();

agent.on("progress", (event) => {
  switch (event.type) {
    case "phase_start":
      spinner.start(`${event.phase}...`);
      break;
    case "phase_end":
      spinner.succeed(event.phase);
      break;
    case "finding":
      if (event.finding.priority === "P0") {
        console.log(chalk.red(`🚨 ${event.finding.title}`));
      }
      break;
    case "complete":
      printReport(event.report);
      break;
  }
});

const report = await agent.analyze("vercel", "next.js");
```

---

## 10. Testing the Agent

### 10.1. Mock Tools for Testing

```typescript
const mockGetRepoMeta = defineTool({
  name: "get_repo_meta",
  // ... same schema
  handler: async () => ({
    textResultForLlm: JSON.stringify(MOCK_METADATA),
    resultType: "success",
  }),
});
```

### 10.2. Test Cases

| Test Case | Input | Expected |
|-----------|-------|----------|
| Healthy repo | `vercel/next.js` | Score > 80%, few P2s |
| Missing LICENSE | Repo without LICENSE | P0 finding |
| No CI | Repo without workflows | P0 finding |
| Rate limited | Simulate 403 | Partial report with warning |
| Private repo | Private without token | Auth error message |

---

*Este documento define a configuração completa do agente para o Repo Doctor.*
