/**
 * Constraints Module
 * Non-negotiable rules for the agent
 */

export const CONSTRAINTS = `# CONSTRAINTS (NON-NEGOTIABLE)

1. **NO command execution** — Never run npm, pip, cargo, etc.
2. **NO full repository download** — Use API only
3. **NO source code reading** — Config/docs only (unless deep analysis mode)
4. **NO token/secret exposure** — Redact any found
5. **NO assumptions** — Every finding needs evidence
6. **MAXIMUM 200KB per file** — Skip larger files
7. **MAXIMUM 20 file reads** — Be strategic`;
