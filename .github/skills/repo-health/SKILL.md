---
name: repo-health
description: Analisa o perfil do repositório e extrai um modelo estruturado com evidências para orientar outras análises.
---

# Skill: Repo Health

## Quando usar
Execute esta skill quando estiver começando a análise de um repositório e precisar:
- Determinar tipo de projeto (app, lib, monorepo)
- Identificar stack tecnológica
- Construir um modelo de contexto reutilizável por outras skills

## Escopo da skill
Inclui:
- Modelagem da estrutura de arquivos
- Identificação de linguagens/frameworks
- Detectar presença de configurações importantes (`package.json`, configs)

Não inclui:
- Análises de qualidade profundas (essas são outras skills)

## Entradas esperadas
- Árvore completa de arquivos do repositório
- Conteúdo de:
  - `package.json`
  - Possíveis configs (`.eslintrc`, `tsconfig.json`, `vite.config.js`)

## Como analisar
1) Percorrer todos os diretórios principais.
2) Identificar:
   - Linguagens dominantes
   - Scripts importantes (`lint`, `test`, `build`)
   - Estruturas comuns (`src/`, `apps/`, `packages/`)
3) Classificar o repo (monorepo vs simples)
4) Construir mapa de “pontos de interesse” para outras skills

## Saída esperada
Resultado deve incluir:
- Tipo de projeto
- Lista de linguagens + frameworks
- Scripts principais
- Mapa de pastas relevantes

## Regras obrigatórias
- Deve usar conteúdo real (arquivo + corpo)
- Não deve fazer suposições sem evidência
- Deve retornar JSON/natureza de dados legível por outros agentes

## Limitações
- Não detecta qualidade de código
- Não faz recomendações por si só
