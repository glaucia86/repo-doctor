/**
 * Error Handling Module
 * How to handle various error conditions
 */

export const ERROR_HANDLING = `# ERROR HANDLING

| Error | Response |
|-------|----------|
| 404 on file | Record as "missing" — this IS evidence |
| 403 rate limit | Generate partial report with available data |
| Timeout | Output findings so far with "[Partial]" flag |
| Empty repo | Report as P0: "Repository appears empty" |
| Archived repo | Note in summary, adjust expectations |`;
