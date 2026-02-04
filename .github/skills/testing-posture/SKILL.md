---
name: testing-posture
description: Faz análise de postura de testes (presença, estrutura, camadas).
---

# Skill: Testing Posture

## Quando usar
Quando a análise precisa determinar:
- Se existem testes
- Estrutura de teste
- Falta de cobertura por tipo

## Escopo da skill
Inclui:
- Presença de diretórios de teste
- Framework detectado
- Gaps (unit vs integration)

Não inclui:
- Execução de testes reais

## Entradas esperadas
- Pastas de teste
- Scripts

## Como analisar
1) Verificar presença de arquivos de teste.
2) Detectar frameworks (Jest/Vitest/etc.)
3) Determinar gaps por heurística

## Saída esperada
Achados com:
- Severidade
- Recomendações

## Regras obrigatórias
- Evidência bestand
