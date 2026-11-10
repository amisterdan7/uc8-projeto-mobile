---
name: contrato-api-v1
description: Contrato da API v1 da Academia MisterFit (rotas, corpos, respostas, formato de erro, permissões) e como o app mobile deve chamá-la e mapeá-la. Use quando a tarefa envolver chamar a API, criar ou alterar funções em src/api, mapeadores, tratamento de erro HTTP (400, 401, 403, 409, 429, 503), login e sessão por token, permissões por rota ou testes de contrato. Use também antes de inventar qualquer rota ou campo novo.
---

# Contrato da API v1

A API única (`academia-fit-api`) é Node/Express com PostgreSQL no Supabase. O app mobile, em **modo equipe**, fala só com ela. Tabela completa de rotas: `references/rotas.md`.

## Base e autenticação
- URL base: `EXPO_PUBLIC_API_URL`. Rotas sob `/v1`. JSON nos dois sentidos.
- Login por **usuário** (não e-mail): `POST /auth/login { login, senha }` devolve `{ token, usuario, permissoes[] }`. O token vai em `Authorization: Bearer <token>`, vale 8 horas e fica no `expo-secure-store` (na web, só em memória).
- Ao abrir o app: ler o token e chamar `GET /auth/eu`; se falhar, limpar e voltar ao login.
- Após 5 senhas erradas do mesmo login, a API bloqueia por 60 s (429 `LIMITE_EXCEDIDO`).

## Formato de erro
`{ "error": { "code": string, "message": string (pt-BR), "details"?: [{ "campo": string, "mensagem": string }] } }`

| Status | code | O que o app faz |
| --- | --- | --- |
| 400 | `VALIDACAO` | Mostra a mensagem e liga cada `details[].campo` ao `Campo` do formulário |
| 401 | `NAO_AUTENTICADO` | Em rota autenticada: encerra a sessão e volta ao login com aviso. No login: "usuário ou senha incorretos" |
| 403 | `SEM_PERMISSAO` | "Você não tem permissão para esta ação." e relê `/auth/eu` |
| 403 | `USUARIO_DESATIVADO` | Encerra a sessão com aviso |
| 404 | `NAO_ENCONTRADO` | Mensagem e recarrega a lista |
| 409 | `CONFLITO` | Mensagem própria por caso (duplicado, aluno com histórico, matrícula vigente, aluno arquivado, plano com matrículas) |
| 429 | `LIMITE_EXCEDIDO` | Mostra a mensagem da API |
| 503 | `BANCO_INDISPONIVEL` | "Servidor indisponível" com "Tentar de novo" |
| 500 | `ERRO_INTERNO` | Mensagem genérica; não expõe detalhe |
| (rede) | — | "Sem conexão com o servidor" |

## Regras de mapeamento
- Corpo de resposta entra como `unknown` e é conferido por type guard ou mapeador. Nada de cast direto de DTO remoto.
- DTOs ficam em `snake_case` (`src/api/tipos.ts`); os modelos da interface em `camelCase`; `src/api/mapeadores.ts` converte.
- **Aceite `null`** em `telefone`, `plano_nome` e `descricao`, e **ignore campos a mais** (a API pode acrescentar campos).
- `preco` é número. Datas são texto `AAAA-MM-DD`.
- Status válidos: matrícula `ativa | inativa | vencida` (leitura); envio só `ativa | inativa`. Aluno `ativa | inativa | vencida | sem_matricula`.
- `src/api` não importa `react-native`: precisa rodar no Node para os testes de contrato.

## Permissões
Admin tem `*`. Recepção: `alunos:listar`, `alunos:criar`, `alunos:atualizar`, `planos:listar`, `matriculas:listar`, `matriculas:criar`. A interface esconde o que falta; a API barra de verdade.

## Antes de criar algo novo
1. A rota existe em `references/rotas.md`? Se não, **não invente**: registre em `docs/PEDIDOS_PARA_API.md`.
2. Existe a API local ao lado (`../academia-fit-api`)? Pode **ler** `src/rotas` e `src/validacao.ts` para conferir (somente leitura). Se divergir deste arquivo, a API vence; atualize este arquivo e `docs/DECISOES.md`.
3. Todas as rotas de equipe têm que aparecer em `docs/INTEGRACAO_API.md` com a tela e a função que as usam.

## Testes de contrato
`npm run test:contrato` roda as funções de `src/api` contra a API real. Só executa com `API_URL`, `TESTE_ADMIN_LOGIN`, `TESTE_ADMIN_SENHA`, `TESTE_RECEPCAO_LOGIN`, `TESTE_RECEPCAO_SENHA` e `CONFIRMO_ESCREVER=sim`, e **grava dados** (prefixo `TESTE-CONTRATO`, apagados no fim). O agente escreve esses testes; **o dono é quem os executa**.
