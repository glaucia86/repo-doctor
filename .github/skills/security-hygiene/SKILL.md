---
name: security-hygiene
description: Detecta riscos básicos de segurança em repositórios (segredos expostos, configurações perigosas, padrões inseguros) e gera recomendações com evidências.
---

# Skill: Security Hygiene (Repo Doctor)

## Quando usar esta skill
Use esta skill quando o objetivo for:
- Encontrar **segredos expostos** (tokens, chaves, credenciais) no repositório
- Identificar **configurações inseguras** em CI/CD (GitHub Actions) e scripts
- Detectar **padrões de código potencialmente perigosos** (ex.: eval, child_process sem validação)
- Gerar recomendações **curtas e acionáveis**, sempre com evidência

## Escopo (o que está dentro)
✅ Inclui:
- Procura de segredos versionados e arquivos suspeitos (.env, credentials, dumps)
- Revisão de workflows do GitHub Actions (permissões, uso de secrets, ações não pinadas)
- Heurísticas de risco em Node.js/TypeScript (exec, eval, deserialização insegura)

❌ Não inclui:
- Pentest, exploração, ou prova de conceito
- Auditoria completa de dependências por CVE (a menos que o projeto já integre scanners)

## Entradas esperadas
- Árvore de arquivos do repo
- Conteúdo de:
  - `.github/workflows/*`
  - `package.json` (+ lockfile se existir)
  - arquivos `.env*` (se existirem)
  - código-fonte relevante (TS/JS)

## Como analisar (passo a passo)
1) **Identifique sinais de segredos**
   - Procure por padrões comuns de tokens (ex.: `ghp_`, `xoxb-`, `AIza`, `sk-`, etc.)
   - Verifique commits/arquivos com nomes suspeitos: `.env`, `secrets`, `credentials`, `id_rsa`

2) **Revise GitHub Actions**
   - Verifique permissões (`permissions:`) e prefira mínimo privilégio
   - Sinalize ações não pinadas por SHA
   - Verifique `pull_request_target` e contextos perigosos
   - Avalie exposição de secrets em steps/logs

3) **Revise código de risco**
   - `eval`, `Function()`, `child_process.exec`, `spawn` com input externo
   - `JSON.parse` em payloads não confiáveis sem validação
   - URLs/redirects sem allowlist

## Regras obrigatórias (qualidade)
- Cada achado deve incluir:
  - **arquivo + range de linhas**
  - **explicação do risco** (clara e curta)
  - **recomendação prática** (com passos)
  - **severidade**: S0/S1/S2/S3
  - **prioridade**: P0/P1/P2/P3

- Não faça suposições sobre intenção do autor.
- Evite “corrigir tudo”: foque no que é mais provável e mais impactante.

## Formato de saída (achados)
Use este template por achado:

### [Sx/Py] Título curto do risco
- **Arquivo:** `path/to/file.ts:L10-L42`
- **Evidência:** (1–3 linhas relevantes, sem despejar arquivos longos)
- **Risco:** explicação objetiva (1 parágrafo)
- **Recomendação:** passos acionáveis (bullets)
- **Critérios de aceite:** como validar que foi resolvido

## Sugestões de remediação (padrões)
- Secrets:
  - Remover do histórico (se necessário)
  - Rotacionar credenciais
  - Introduzir `.env.example` e secrets via CI/Actions
- GitHub Actions:
  - Pin por SHA
  - `permissions: read-all` → mínimo necessário
  - Revisar `pull_request_target`
- Código:
  - Validar input com schema (ex.: zod)
  - Allowlist de comandos/paths
  - Evitar `eval`

## Limites e cuidado
- Se houver achado de segredo real: trate como **S0/P0** e recomende rotação imediata.
- Não exponha tokens completos no relatório: mascare (ex.: `ghp_****`).
