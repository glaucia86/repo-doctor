---
name: ci-workflow-audit
description: Avalia pipelines CI/CD, detectando gaps e oportunidades de melhoria.
---

# Skill: CI Workflow Audit

## Quando usar
Quando for necessário:
- Verificar se o CI roda checks adequados (lint/test/build)
- Identificar workflows redundantes ou incompletos

## Escopo da skill
Inclui:
- GitHub Actions
- Outros arquivos CI
- Scripts relacionados

Não inclui:
- Execução de pipelines reais

## Entradas esperadas
- Arquivos `.github/workflows/*`
- Scripts no `package.json`

## Como analisar
1) Listar todos os workflows.
2) Verificar integridade dos passos.
3) Detectar lógicas duplicadas
4) Avaliar checks faltantes

## Saída esperada
Achados com:
- Workflow analisado
- Severidade
- Recomendações

## Regras obrigatórias
- Evidência (arquivos + runs)
- Recomendações práticas

## Limitações
- Não simula execução de jobs
