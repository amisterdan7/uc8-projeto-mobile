---
name: fluxo-e-seguranca
description: Fluxo de trabalho, segurança e relatório final para qualquer agente neste repositório mobile. Use no início e no fim de TODA tarefa de código, e sempre que houver risco de tocar em segredos (.env, chaves, URL de banco, tokens), dados pessoais em log, git (commit, push, histórico), testes que gravam em banco ou rede, ou quando for preciso entregar um relatório final.
---

# Fluxo, segurança e relatório

## Antes de começar
1. Leia `AGENTS.md` e as skills da tarefa; leia `docs/DECISOES.md`.
2. `git status -sb`: se a árvore estiver suja, avise o dono antes de misturar trabalho.
3. Planeje em poucas linhas. Mudança que toca mais de 3 arquivos: peça aprovação do plano.
4. Leia o código existente antes de editar; faça a **menor mudança** que resolve; não reformate arquivos fora do escopo.

## Segredos e privacidade
- **Nunca abra nem imprima** `.env`, `.env.local` ou qualquer arquivo de credenciais. Descubra o estado da configuração pelos comandos (`typecheck`, testes) e pelos erros que eles dão.
- Nunca escreva em arquivo, log, commit ou mensagem: senha, token, URL de banco, `sb_secret_`, `service_role`, `JWT_SECRET`. Variáveis `EXPO_PUBLIC_*` só com valores públicos.
- **Nunca registre** senha, token, nome, telefone ou nascimento em log. `registrarErro` guarda só origem, tipo e status.
- Dado pessoal no aparelho: só o token (SecureStore). O cache SQLite do modo curso guarda apenas planos fictícios.
- Se achar segredo no código ou no histórico, registre como CRÍTICO (arquivo, linha, commit) **sem transcrever** e avise o dono.

## Git
- Commits pequenos, um por tarefa, em português ("feat: ...", "fix: ...", "docs: ...", "chore: ..."), citando o requisito.
- **Não faça push.** Nunca `git add` de `.env`. Não reescreva commits já enviados (`rebase`, `--amend`, `push --force`).
- Depois de criar arquivos, `git add .` (as conferências do curso só leem arquivos rastreados).
- O GitHub recusa push com e-mail pessoal exposto (erro GH007): a identidade usa o e-mail `noreply` do GitHub.
- Avisos `LF will be replaced by CRLF` no Windows são inofensivos.

## O que o agente NÃO executa
`git push`, `npm run test:contrato` e qualquer teste que grave em banco ou use rede com credenciais, builds na EAS, e rodar o app no aparelho. O agente **escreve**; o dono **executa** e traz a saída.

## Definição de pronto
- `npm run typecheck` e `npm run test:unit` passam (saída real).
- `git grep -nw any -- "*.ts" "*.tsx"` sem saída.
- Os comandos de conferência do módulo tocado batem com o guia (`conferencia-guia-curso`).
- Nenhum segredo nem dado pessoal em arquivo, log ou commit.
- `docs/DECISOES.md` atualizado; rota que faltou em `docs/PEDIDOS_PARA_API.md`; casos novos no `docs/roteiro_de_teste.md` com "não executado".

## Relatório final (compacto)
Por tarefa: arquivos criados e alterados, requisitos cobertos, saída real dos comandos, **o que não foi possível verificar** (aparelho, API no ar, painel, EAS), pendências e decisões novas. Termine com `git status -sb` e `git diff --stat`.

## Na dúvida
Pergunte ao dono ou registre a suposição em `docs/DECISOES.md`. Não invente regra de negócio, rota, campo nem resultado de teste.
