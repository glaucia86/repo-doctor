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
    // Remove Repomix failure messages (may appear multiple times)
    .replace(/Repomix failed\..*?(?:analysis|read_repo_file)\.?\n?/gi, "")
    .replace(/Falling back to reading source files.*\n?/gi, "")
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
  // IMPORTANT: For deep analysis, we need to capture BOTH the health report AND the deep analysis section
  // Priority: Start from the Health Report header (which should include Deep Analysis section at the end)
  const reportStartPatterns = [
    // Standard report patterns (prioritized - start from the beginning of the full report)
    /^##?\s*🩺\s*Repository Health Report/m,
    /^##?\s*Repository Health Report/mi,
    /^##?\s*Health Report/mi,
    /^##\s*📊\s*Health Score/m,
    /^---\s*\n+##?\s*🩺/m,
    // Evidence sections (if report starts with evidence extraction)
    /^##?\s*Evidence Extraction/mi,
    /^##?\s*Evidence Collection Summary/mi,
    // Deep analysis section (fallback if no health report header found)
    // This should only match if there's no health report section
    /^##?\s*🔬\s*Deep Analysis/mi,
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

  // Fallback: if no report header found, try to find the first significant section
  // This handles cases where content before the main report header is orphaned
  const firstSectionMatch = cleaned.match(/^(##\s+[^\n]+)/m);
  if (firstSectionMatch && firstSectionMatch.index !== undefined) {
    // Check if there's orphaned content before this section (tables, partial text)
    const beforeSection = cleaned.slice(0, firstSectionMatch.index).trim();
    // If the content before is short or looks like a fragment, skip it
    if (beforeSection.length < 500 && !beforeSection.includes("## ")) {
      const report = cleaned.slice(firstSectionMatch.index).trim();
      return removeDuplicateSections(report);
    }
  }

  // Final fallback: just clean and return
  return removeDuplicateSections(cleaned.trim());
}

// ════════════════════════════════════════════════════════════════════════════
// DUPLICATE REMOVAL
// ════════════════════════════════════════════════════════════════════════════

/**
 * Remove duplicate sections in markdown content
 * Keeps the last (most complete) occurrence of each major section
 * 
 * Strategy:
 * 1. First pass: identify all sections and their positions
 * 2. For duplicates, keep the one with more content
 * 3. Rebuild in original document order (by first occurrence position)
 */
export function removeDuplicateSections(content: string): string {
  const lines = content.split("\n");
  
  interface SectionInfo {
    normalizedHeader: string;
    originalHeader: string;
    firstStart: number;    // Position of FIRST occurrence (for ordering)
    lastStart: number;     // Position of LAST occurrence (for content)
    content: string[];
    occurrenceCount: number;
  }
  
  const sections: Map<string, SectionInfo> = new Map();
  
  let currentHeader = "__intro__";
  let currentStart = 0;
  let currentLines: string[] = [];

  /**
   * Calculate total content size (characters) in a section
   */
  function getContentSize(lines: string[]): number {
    return lines.reduce((sum, line) => sum + line.length, 0);
  }

  function saveSection(endIndex: number) {
    if (currentLines.length === 0) return;
    
    const normalizedHeader = currentHeader.toLowerCase().replace(/[^a-z0-9]/g, "");
    const existing = sections.get(normalizedHeader);
    
    if (existing) {
      // Duplicate found - keep the one with more content (by character count)
      existing.occurrenceCount++;
      const currentSize = getContentSize(currentLines);
      const existingSize = getContentSize(existing.content);
      if (currentSize > existingSize) {
        existing.content = [...currentLines];
        existing.lastStart = currentStart;
      }
      // Keep firstStart unchanged (for ordering)
    } else {
      sections.set(normalizedHeader, {
        normalizedHeader,
        originalHeader: currentHeader,
        firstStart: currentStart,
        lastStart: currentStart,
        content: [...currentLines],
        occurrenceCount: 1,
      });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section
      saveSection(i);
      
      currentHeader = headerMatch[2] || "__section__";
      currentStart = i;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }
  
  // Save last section
  saveSection(lines.length);

  // Rebuild content - order by FIRST occurrence position (preserves document structure)
  const sortedSections = Array.from(sections.values())
    .sort((a, b) => a.firstStart - b.firstStart);

  return sortedSections
    .map(section => section.content.join("\n"))
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
