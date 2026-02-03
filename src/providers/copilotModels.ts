import { execSync } from "node:child_process";
export interface CopilotModelChoice {
  id: string;
  name: string;
}

export function getCopilotCliModels(): CopilotModelChoice[] | null {
  try {
    const help = execSync("copilot --help", { stdio: ["ignore", "pipe", "ignore"] })
      .toString();

    // Updated regex to match new Copilot CLI format: choices: "model1", "model2", ...
    const match = help.match(/--model\s+<model>[\s\S]*?choices:\s*([^)]*)/i);
    if (!match) return null;

    const choicesRaw = match[1] || "";
    // Extract quoted model IDs
    const ids = Array.from(choicesRaw.matchAll(/"([^"]+)"/g)).map((m) => m[1]!);
    if (ids.length === 0) return null;

    return ids.map((id) => ({
      id,
      name: formatModelName(id),
    }));
  } catch {
    return null;
  }
}

function formatModelName(id: string): string {
  const tokens = id.split("-");
  return tokens
    .map((token) => {
      const lower = token.toLowerCase();
      if (lower === "gpt") return "GPT";
      if (lower === "o3") return "o3";
      if (lower === "claude") return "Claude";
      if (lower === "gemini") return "Gemini";
      if (/^\d/.test(token) || token.includes(".")) return token;
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join(" ");
}
