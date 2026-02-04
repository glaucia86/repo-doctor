---
name: code-quality-audit
description: Analisa padrões de qualidade de código e detecta code smells, complexidade elevada e duplicação.
---

# Skill: Code Quality Audit

## Quando usar
Sempre que for necessário:
- Avaliar qualidade de código
- Sugerir pontos de refatoração
- Entregar evidências precisas

## Escopo da skill
Inclui:
- Complexidade heurística (linhas, níveis de aninhamento)
- Duplicação aparente
- Nomenclatura inconsistente

Não inclui:
- Testes de execução ou profiling

## Entradas esperadas
- Lista de arquivos relevantes (JS/TS)
- Possível configuração de lint (se houver)

## Como analisar
1) Calcular métricas de tamanho/complexidade.
2) Detectar estruturas repetidas.
3) Verificar padrões de nome.
4) Classificar achados por severidade.

## Saída esperada
Lista de achados com:
- Arquivo + linhas
- Tipo de problema
- Severidade

## Regras obrigatórias
- Evidência real (arquivo + linhas)
- Recomendação concisa
- Impacto claro (S1–S3)

## Limitações
- Não tenta corrigir automaticamente
