import { CopilotClient, type SessionEvent } from "@github/copilot-sdk";
import { repoTools } from "../tools/repoTools.js";

export type AnalyzeOptions = {
  repoUrl: string;
};

export async function analyzeRepositoryWithCopilot({ repoUrl }: AnalyzeOptions) {
  const client = new CopilotClient();

  // Modelo: o tutorial oficial usa "gpt-4.1" como exemplo. :contentReference[oaicite:3]{index=3}
  const session = await client.createSession({
    model: "gpt-5.2",
    streaming: true,
    tools: repoTools(),
  });

  session.on((event: SessionEvent) => {
    if (event.type === "assistant.message_delta") {
      process.stdout.write(event.data.deltaContent);
    }
    
    if (event.type === "session.idle") {
      process.stdout.write("\n");
    }
  });

  const prompt = `
Você é o Repo Doctor, um assistente de diagnóstico de repositórios no GitHub.
Analise o repositório: ${repoUrl}

Objetivos:
1) Identificar problemas de DX (Developer Experience) e manutenção: README, scripts, CI, lint/test, docs, versionamento.
2) Sugerir melhorias rápidas (quick wins) e melhorias estruturais.
3) Apontar riscos comuns: segredos, workflows frágeis, ausência de templates (issues/PR), falta de changelog.
4) Sempre que precisar de dados, use as tools:
   - get_repo_meta
   - list_repo_files
   - read_repo_file

Restrições:
- Evite ler muitos arquivos inteiros. Leia apenas os essenciais (README, package.json, workflows).
- Retorne no final uma lista priorizada: P0 (crítico), P1, P2 com justificativa e ação recomendada.
`;

  await session.sendAndWait({ prompt });

  await client.stop();
  process.exit(0);
}
