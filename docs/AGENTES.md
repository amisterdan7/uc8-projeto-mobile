# Como os agentes de IA trabalham neste projeto

Qualquer agente (Claude Code, Codex, Copilot ou outro) deve começar por **`AGENTS.md`**, na raiz. Ele resume as regras e aponta a skill certa para cada tarefa.

## Onde ficam as instruções
| Arquivo | Para quem |
| --- | --- |
| `AGENTS.md` | todos os agentes (Codex e Copilot leem direto) |
| `CLAUDE.md` | Claude Code (importa o `AGENTS.md`) |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.agents/skills/*/SKILL.md` | **fonte única** das skills |
| `.claude/skills/*/SKILL.md` | cópia gerada para o Claude Code |

## Skills
| Skill | Assunto |
| --- | --- |
| `dominio-academia` | alunos, planos, matrículas, vencimento, status, permissões |
| `contrato-api-v1` | rotas, erros, mapeadores, testes de contrato |
| `modos-e-arquitetura-mobile` | modos equipe e curso, pastas, estados, Supabase, SQLite, fila |
| `identidade-visual-misterfit` | tema, cores, componentes, textos |
| `conferencia-guia-curso` | conferência contra os guias do professor |
| `fluxo-e-seguranca` | git, segredos, testes, relatório final |

## Manutenção
1. Edite sempre em `.agents/skills/`.
2. Rode `npm run skills:sincronizar` para copiar para `.claude/skills/`.
3. `npm run skills:verificar` falha se as duas pastas divergirem (bom para conferir antes de um commit).
4. Mudou uma regra de negócio ou o contrato da API? Atualize a skill **no mesmo commit** que muda o código.

## Como saber se o agente leu as regras
Peça, sem deixar ele abrir o código: "Como a data de vencimento é calculada, e quem calcula?" A resposta certa: início mais a duração do plano em meses de calendário, ajustada ao último dia do mês, **calculada pela API**; o app só exibe.
