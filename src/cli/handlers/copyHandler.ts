/**
 * Copy Handler
 * Single Responsibility: Handle /copy command (clipboard)
 */

import { appState } from "../state/appState.js";
import { extractReportOnly } from "../parsers/reportExtractor.js";
import { printSuccess, printWarning } from "../../ui/index.js";

// ════════════════════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle /copy command - Copy analysis to clipboard
 */
export async function handleCopy(): Promise<void> {
  if (!appState.lastAnalysis) {
    printWarning("No analysis to copy. Run /analyze first.");
    return;
  }

  // Extract only the final report (without phase logs)
  const content = extractReportOnly(appState.lastAnalysis.content);
  const isWindows = process.platform === "win32";
  const isMac = process.platform === "darwin";

  if (isWindows) {
    return copyOnWindows(content);
  }

  if (isMac) {
    return copyOnMac(content);
  }

  // Linux
  return copyOnLinux(content);
}

// ════════════════════════════════════════════════════════════════════════════
// PLATFORM-SPECIFIC IMPLEMENTATIONS
// ════════════════════════════════════════════════════════════════════════════

async function copyOnWindows(content: string): Promise<void> {
  // Windows: clip.exe doesn't handle UTF-8 via stdin properly
  // Use a temp file with BOM to preserve emojis
  const fs = await import("fs");
  const os = await import("os");
  const path = await import("path");
  const { exec } = await import("child_process");

  const tempFile = path.join(
    os.tmpdir(),
    `repo-doctor-clipboard-${Date.now()}.txt`
  );
  const BOM = "\uFEFF";

  fs.writeFileSync(tempFile, BOM + content, { encoding: "utf8" });

  // Use PowerShell to read UTF-8 file and set clipboard
  const psCommand = `Get-Content -Path "${tempFile}" -Encoding UTF8 -Raw | Set-Clipboard`;

  return new Promise((resolve) => {
    exec(`powershell -Command "${psCommand}"`, (error) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch {}

      if (error) {
        printWarning("Could not copy to clipboard. Use /export instead.");
      } else {
        console.log();
        printSuccess("Analysis copied to clipboard!");
        console.log();
      }
      resolve();
    });
  });
}

async function copyOnMac(content: string): Promise<void> {
  const { spawn } = await import("child_process");

  return new Promise((resolve) => {
    const proc = spawn("pbcopy", [], { stdio: ["pipe", "ignore", "ignore"] });

    proc.stdin?.write(content);
    proc.stdin?.end();

    proc.on("close", (code) => {
      if (code === 0) {
        console.log();
        printSuccess("Analysis copied to clipboard!");
        console.log();
      } else {
        printWarning("Could not copy to clipboard.");
      }
      resolve();
    });

    proc.on("error", () => {
      printWarning("Clipboard not available. Use /export to save to file.");
      resolve();
    });
  });
}

async function copyOnLinux(content: string): Promise<void> {
  const { spawn } = await import("child_process");

  return new Promise((resolve) => {
    const proc = spawn("xclip", ["-selection", "clipboard"], {
      stdio: ["pipe", "ignore", "ignore"],
    });

    proc.stdin?.write(content);
    proc.stdin?.end();

    proc.on("close", (code) => {
      if (code === 0) {
        console.log();
        printSuccess("Analysis copied to clipboard!");
        console.log();
      } else {
        printWarning("Could not copy to clipboard.");
      }
      resolve();
    });

    proc.on("error", () => {
      printWarning("Clipboard not available. Use /export to save to file.");
      resolve();
    });
  });
}
