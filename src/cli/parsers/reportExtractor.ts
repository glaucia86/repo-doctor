/**
 * Report Extractor
 * Single Responsibility: Extract and clean analysis reports from raw output
 */

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTOR
// ════════════════════════════════════════════════════════════════════════════

/**
 * Extract only the final report from analysis output
 * Removes phase logs, debug messages, and keeps only the health report
 */
export function extractReportOnly(content: string): string {
  // Step 1: Remove common debug/noise patterns
  let cleaned = content
    // Remove npm/repomix warnings and deprecation notices
    .replace(/npm warn.*\n?/gi, "")
    .replace(/npm notice.*\n?/gi, "")
    .replace(/npm WARN.*\n?/gi, "")
    .replace(/\(node:\d+\).*Warning:.*\n?/gi, "")
    .replace(/ExperimentalWarning:.*\n?/gi, "")
    .replace(/DeprecationWarning:.*\n?/gi, "")
    // Remove repomix progress/info messages
    .replace(/Repomix.*processing.*\n?/gi, "")
    .replace(/Packing repository.*\n?/gi, "")
    .replace(/Successfully packed.*\n?/gi, "")
    .replace(/\[repomix\].*\n?/gi, "")
    // Remove phase markers from streaming output
    .replace(/^\*\*PHASE \d+.*\*\*\s*$/gm, "")
    // Remove tool call annotations
    .replace(/^Calling tool:.*\n?/gm, "")
    .replace(/^Tool result:.*\n?/gm, "")
    // Remove duplicate blank lines
    .replace(/\n{4,}/g, "\n\n\n")
    // Trim leading/trailing whitespace from lines
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n");

  // Step 2: Find the start of the report content
  // For deep analysis, include Evidence sections
  // For standard analysis, start at Health Report
  const reportStartPatterns = [
    // Deep analysis patterns (include evidence sections)
    /^##?\s*Evidence Extraction/mi,
    /^##?\s*Evidence Collection Summary/mi,
    /^##?\s*🔬\s*Deep Analysis/mi,
    // Standard report patterns
    /^##?\s*🩺\s*Repository Health Report/m,
    /^##?\s*Repository Health Report/mi,
    /^##?\s*Health Report/mi,
    /^##\s*📊\s*Health Score/m,
    /^---\s*\n+##?\s*🩺/m,
  ];

  for (const pattern of reportStartPatterns) {
    const match = cleaned.match(pattern);
    if (match && match.index !== undefined) {
      // Include content from the match onwards
      // If there's a "---" before, include it for proper markdown formatting
      let startIndex = match.index;
      const beforeMatch = cleaned.slice(Math.max(0, startIndex - 10), startIndex);
      if (beforeMatch.includes("---")) {
        startIndex = cleaned.lastIndexOf("---", startIndex);
      }
      const report = cleaned.slice(startIndex).trim();
      
      // Step 3: Remove duplicate sections (keep only last occurrence)
      return removeDuplicateSections(report);
    }
  }

  // Fallback: if no report header found, clean and return
  return removeDuplicateSections(cleaned.trim());
}

// ════════════════════════════════════════════════════════════════════════════
// DUPLICATE REMOVAL
// ════════════════════════════════════════════════════════════════════════════

/**
 * Remove duplicate sections in markdown content
 * Keeps the last (most complete) occurrence of each major section
 */
export function removeDuplicateSections(content: string): string {
  // Split into major sections by ## headers
  const lines = content.split("\n");
  const sections: Map<string, { start: number; end: number; content: string[] }> = new Map();
  
  let currentHeader = "__intro__";
  let currentStart = 0;
  let currentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section (keep last occurrence)
      if (currentLines.length > 0) {
        const normalizedHeader = currentHeader.toLowerCase().replace(/[^a-z0-9]/g, "");
        sections.set(normalizedHeader, {
          start: currentStart,
          end: i,
          content: [...currentLines],
        });
      }
      
      currentHeader = headerMatch[2] || "__section__";
      currentStart = i;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }
  
  // Save last section
  if (currentLines.length > 0) {
    const normalizedHeader = currentHeader.toLowerCase().replace(/[^a-z0-9]/g, "");
    sections.set(normalizedHeader, {
      start: currentStart,
      end: lines.length,
      content: [...currentLines],
    });
  }

  // Rebuild content from unique sections, preserving order of last occurrence
  const sortedSections = Array.from(sections.entries())
    .sort((a, b) => a[1].start - b[1].start);

  return sortedSections
    .map(([_, section]) => section.content.join("\n"))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY GENERATOR
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generate a condensed summary from a full analysis report
 */
export function generateCondensedSummary(content: string, repoName: string): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`## 📋 Quick Summary: ${repoName}`);
  lines.push("");
  
  // Extract health score
  const scoreMatch = content.match(/Health Score[:\s]*(\d+)%/i) 
    || content.match(/Score[:\s]*(\d+)%/i)
    || content.match(/(\d+)%\s*(?:health|score)/i);
  
  if (scoreMatch) {
    const score = parseInt(scoreMatch[1]!, 10);
    const emoji = score >= 80 ? "🌟" : score >= 60 ? "👍" : score >= 40 ? "⚠️" : "🚨";
    lines.push(`**Health Score:** ${emoji} ${score}%`);
  }
  lines.push("");
  
  // Count issues by priority
  const p0Count = (content.match(/🚨|P0|Critical/gi) || []).length;
  const p1Count = (content.match(/⚠️|P1|High Priority/gi) || []).length;
  const p2Count = (content.match(/💡|P2|Suggestion/gi) || []).length;
  
  lines.push("### Issues Found");
  lines.push(`- 🚨 Critical (P0): ${Math.max(0, Math.floor(p0Count / 2))}`);
  lines.push(`- ⚠️ High Priority (P1): ${Math.max(0, Math.floor(p1Count / 2))}`);
  lines.push(`- 💡 Suggestions (P2): ${Math.max(0, Math.floor(p2Count / 2))}`);
  lines.push("");
  
  // Extract key issues (first 5 issue titles)
  const issuePatterns = [
    /#{2,4}\s*(?:🚨|⚠️|💡)?\s*(?:P[012][:\s-]*)?\s*(.+)/gm,
    /[-*]\s*\*\*(.+?)\*\*/gm,
  ];
  
  const issues: string[] = [];
  for (const pattern of issuePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null && issues.length < 5) {
      const title = match[1]?.trim();
      if (title && 
          title.length > 10 && 
          title.length < 100 &&
          !title.includes("Health") &&
          !title.includes("Score") &&
          !title.includes("Category")) {
        issues.push(title);
      }
    }
  }
  
  if (issues.length > 0) {
    lines.push("### Top Issues");
    issues.forEach((issue, i) => {
      lines.push(`${i + 1}. ${issue}`);
    });
    lines.push("");
  }
  
  // Extract next steps if available
  const nextStepsMatch = content.match(/(?:Next Steps|Recommended).+?(?=#{1,3}|$)/is);
  if (nextStepsMatch) {
    const stepsContent = nextStepsMatch[0];
    const steps = stepsContent.match(/\d+\.\s*(.+)/g)?.slice(0, 3);
    if (steps && steps.length > 0) {
      lines.push("### Priority Actions");
      steps.forEach(step => {
        lines.push(step);
      });
      lines.push("");
    }
  }
  
  lines.push("---");
  lines.push("*Use `/export` for full report or `/copy` to clipboard*");
  
  return lines.join("\n");
}
