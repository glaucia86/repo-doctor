# LinkedIn Post - Repo Doctor

---

🩺 **Construí uma ferramenta CLI que "diagnostica" a saúde de repositórios no GitHub**

E fiz isso por um único motivo: **aprender na prática o GitHub Copilot SDK**.

---

Não existe forma melhor de aprender uma tecnologia nova do que construir algo real com ela.

O **Repo Doctor** é uma CLI Agentic que:

→ Analisa qualquer repositório público do GitHub  
→ Verifica **6 categorias críticas**: Docs, DX, CI/CD, Testes, Governança e Segurança  
→ Gera um "Health Score" com findings priorizados (P0, P1, P2)  
→ Sugere ações específicas com código pronto para copiar/colar  

E tudo isso acontece através de uma **conversa com IA** no terminal.

---

**O que eu aprendi construindo isso:**

1️⃣ Como o Copilot SDK funciona por baixo dos panos  
2️⃣ Como criar **custom tools** que a IA pode chamar automaticamente  
3️⃣ O poder do streaming de eventos para UX em tempo real  
4️⃣ Técnicas de segurança contra prompt injection  
5️⃣ Integração com 10+ modelos (GPT-4o, Claude Sonnet 4, o3...)  

---

**Tech Stack:**

• @github/copilot-sdk — orquestração do agente  
• Repomix — para análise profunda de código  
• TypeScript + Commander + Chalk  

---

📹 **Em breve no meu canal do YouTube:**  
Vou gravar um vídeo explicando em detalhes como funciona o **GitHub Copilot SDK** e como você pode criar suas próprias ferramentas agentic.

🔗 **Quer testar agora?**  
https://github.com/glaucia86/repo-doctor

Clone, rode `npm install && npm link` e execute:

```bash
repo-doctor vercel/next.js
```

---

A melhor forma de aprender é construindo. A segunda melhor é compartilhando.

O que vocês estão construindo com IA ultimamente? 👇

---

#GitHubCopilot #OpenSource #DevTools #AI #TypeScript #CLI #DeveloperExperience #GitHub #CopilotSDK
