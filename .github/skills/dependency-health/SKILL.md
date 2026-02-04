---
name: dependency-health
description: Analisa dependências para identificar falta de uso, versões permissivas ou riscos.
---

# Skill: Dependency Health

## Quando usar
Sempre que desejar:
- Verificar saúde das dependências
- Detectar versões permissivas
- Indicar remoção de dependências não usadas

## Escopo da skill
Inclui:
- `package.json`
- Lockfiles

Não inclui:
- Auditoria CVE profunda (scan externo)

## Entradas esperadas
- `package.json`
- Lockfile (se houver)

## Como analisar
1) Identificar dependências vs devDependencies.
2) Detectar possíveis não usadas
3) Avaliar ranges de versão

## Saída esperada
Achados com:
- Severidade
- Recomendações

## Regras obrigatórias
- Deve acompanhar evidência
- Indicar impacto

## Limitações
- Não acessa serviços externos por padrão
