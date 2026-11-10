# Instruções para o GitHub Copilot

Siga o arquivo `AGENTS.md` da raiz e as skills em `.agents/skills/` (abra a que corresponde à tarefa).

Resumo das regras:
- A API é a fonte da verdade para vencimento, status e permissões; o app nunca recalcula.
- Datas civis são texto AAAA-MM-DD; exiba DD/MM/AAAA dividindo o texto, sem `new Date`.
- Nenhuma URL, chave ou senha do Supabase de produção no app; modo curso usa só o projeto de exercício, com dados fictícios.
- Nunca imprima `.env` nem registre senha, token ou dados pessoais em log.
- Não escreva a palavra `any` em arquivos `.ts` ou `.tsx`, nem em comentários.
- Estados de tela: `tipo: 'carregando' | 'erro' | 'pronto'`.
- Rodar `npm run typecheck` e `npm run test:unit` antes de concluir; `git add .` depois de criar arquivos; sem push.
