import { analyzeRepositoryWithCopilot } from "./core/agent.js";

function printHelp() {
  console.log(`
Repo Doctor (Copilot SDK)

Uso:
  npm run dev -- analyze <repoUrl>
Exemplos:
  npm run dev -- analyze https://github.com/vercel/next.js
  npm run dev -- analyze ORG/REPO

Requisitos:
  - copilot CLI instalado e autenticado
  - gh auth login (recomendado para privados)
  - (opcional) GITHUB_TOKEN para CI
`.trim());
}

async function main() {
  const [, , cmd, repoUrl] = process.argv;

  if (!cmd || cmd === "--help" || cmd === "-h") {
    printHelp();
    process.exit(0);
  }

  if (cmd !== "analyze") {
    console.error(`Comando inválido: ${cmd}`);
    printHelp();
    process.exit(1);
  }

  if (!repoUrl) {
    console.error("Você precisa informar o repoUrl.");
    printHelp();
    process.exit(1);
  }

  await analyzeRepositoryWithCopilot({ repoUrl });
}

main().catch((err) => {
  console.error("Erro:", err?.message ?? err);
  process.exit(1);
});
