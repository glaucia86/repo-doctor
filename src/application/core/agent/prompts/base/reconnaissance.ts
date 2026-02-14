/**
 * Phase 1: Reconnaissance Module
 * Initial metadata and file tree collection
 */

export const RECONNAISSANCE_PHASE = `# PHASE 1: RECONNAISSANCE

## Step 1.1 — Collect Metadata
Call \`get_repo_meta\` FIRST to obtain:
- Primary language(s) and language distribution
- Repository size, topics, and visibility
- License information (if present)
- Fork/archive status

## Step 1.2 — Index File Tree
Call \`list_repo_files\` to map the repository structure.
From the file tree, DETECT:
- **Primary stack** (see Language Detection below)
- **Repository type**: monorepo, single-package, library, application
- **Complexity signals**: file count, folder depth, multiple config files`;
