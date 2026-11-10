---
name: modos-e-arquitetura-mobile
description: Arquitetura do app mobile da Academia MisterFit e seus dois modos de operação (equipe com API v1 e login; curso com Supabase de exercício, cache SQLite e fila de sincronização). Use quando a tarefa envolver estrutura de pastas, a variável EXPO_PUBLIC_MODO, estados de tela em união discriminada, contextos, FonteDados, Supabase, expo-sqlite, cache offline, fila de sincronização, variáveis de ambiente ou build na EAS.
---

# Arquitetura do app e modos

O app tem **dois modos**, escolhidos por `EXPO_PUBLIC_MODO` (`equipe` por padrão, `curso`). Um modo **nunca** usa a fonte de dados do outro. Esta separação resolve o choque entre o produto real e o que o curso exige.

| | Modo `equipe` (produto) | Modo `curso` (exercício) |
| --- | --- | --- |
| Para quê | Equipe da academia (admin e recepção) | Cumprir os guias do curso (módulos 6 a 9) |
| Dados | API v1 (`academia-fit-api`) | Supabase **de exercício**, por `fetch` + `apikey` |
| Entidade | Alunos, planos, matrículas, usuários | **Planos** (nome, preço, duração, descrição) |
| Login | Sim (JWT no SecureStore) | Não |
| Abas | 5 abas: **Início** (inicial), **Alunos**, **Planos**, **Matrículas**, **Conta** (`Usuários` empilhada a partir de `Conta > Equipe` com `usuarios:listar`) | **Planos**, **Busca**, **Sobre** |
| Offline | Não. Nenhum dado pessoal fica no aparelho (só o token) | Sim: cache SQLite + fila de pendentes |
| Dados | Reais | **Fictícios** |

## Os dois Supabase
1. **Produção:** usado só pela API, com RLS ligado e Data API desligada. **O app nunca conhece essa URL nem essas chaves.**
2. **Exercício:** projeto separado (`uc8-projeto-mobile`) com a tabela `planos` aberta à chave pública para leitura e inclusão (sem alterar nem excluir: `revoke update, delete`). A URL e a chave publicável **dele** são públicas por desenho e entram em `.env.local` e no README.
- Nunca use `sb_secret_` nem `service_role` no repositório, no app ou em variável `EXPO_PUBLIC_*`. Achar isso é achado **crítico**.
- `supabase/esquema.sql` carrega no topo o aviso "somente para o projeto de exercício"; nunca execute no de produção.

## Estrutura de pastas
```
src/api/         cliente HTTP da API v1, tipos (snake_case), mapeadores, uma função por rota
src/auth/        armazenamento do token e SessaoContext (login, restauração, podeFazer)
src/contexto/    AcademiaContexto (equipe) e PlanosContexto (curso)
src/servicos/    FonteDados + fonteApi (equipe) e planosSupabase (curso, fetch + apikey)
src/erros/       classificarErro, registrarErro, ErroDeValidacao, ErroDoBanco
src/banco/       expo-sqlite (somente modo curso)
src/config/      modo.ts
src/conteudo/    academia.ts (textos institucionais editáveis da tela Início)
src/tema/        tema.ts (cores, espaços, larguraLarga)
src/components/  Botao, Campo, selos, estados de tela
src/telas/       telas do modo equipe; src/telas/curso/ as do modo curso
src/navegacao/   navegação por modo
supabase/        esquema.sql do projeto de exercício
docs/            DECISOES.md, INTEGRACAO_API.md, PEDIDOS_PARA_API.md, roteiro_de_teste.md
```

## Estado de tela (união discriminada)
Use os literais **exatos** (a conferência do curso procura essas linhas):
```ts
type EstadoTela<T> =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; dados: T }
```
Cada tela desenha os três ramos num `switch` exaustivo, com "Tentar de novo" no erro. Sem booleanos soltos de carregando ou erro, e sem chamar `src/api` direto nas telas: tudo passa pelo contexto.

## Contextos e FonteDados
- `FonteDados` (interface) é o ponto de encaixe; `fonteApi` a implementa sobre `src/api`. O contexto depende só da interface.
- Após cada mutação, recarregue a entidade afetada. Ao sair, zere todo o estado.
- Em Plano de curso, o provedor segue o fluxo: **sincronizar pendentes → carregar da nuvem → guardar no aparelho**; se a nuvem falhar, lê o aparelho (`origem: 'aparelho'` com `motivo`); se também estiver vazio, `erro`.

## Modo curso: peças
- `planosSupabase.ts`: `configuracao()` confere as variáveis e lança mensagem clara; `requisitar()` envia `apikey` e `Prefer: return=representation`, confere `resposta.ok` **antes** de ler o corpo e lança `ErroDaApi`; o corpo entra como `unknown` e passa por type guards.
- `banco.ts`: banco aberto uma vez; `CREATE TABLE IF NOT EXISTS` para `planos` (cache) e `pendentes`; leituras tipadas (`getAllAsync<...>`), escritas com `runAsync` e parâmetros; falha do SQLite vira `ErroDoBanco`.
- Fila: cadastro sem rede grava em `pendentes`; ao iniciar, envia e só remove o pendente **depois** de a API aceitar; recusa da API (`ErroDaApi`) descarta o item; falha de rede mantém.
- Telas avisam "Sem conexão: mostrando os planos guardados no aparelho" e "A enviar (n): nomes"; a tela Sobre mostra "Guardados no aparelho: n".
- Limite conhecido: se o app fechar entre o envio e a remoção do pendente, o item pode duplicar (aceitável com dados fictícios).

## Variáveis de ambiente (só valores públicos)
| Variável | Uso |
| --- | --- |
| `EXPO_PUBLIC_MODO` | `equipe` ou `curso` |
| `EXPO_PUBLIC_API_URL` | Modo equipe. Celular físico: IP do computador; emulador Android: `10.0.2.2`; produção: HTTPS |
| `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_KEY` | Modo curso: **projeto de exercício** |

Valores locais vão em `.env.local` (ignorado). `.env.example` só com nomes e exemplos. Toda `EXPO_PUBLIC_*` vai para dentro do código do app: nada secreto.

## Build na EAS
A EAS não enxerga `.env.local` (ele é ignorado pelo git). Para o APK do modo curso, defina o modo e as chaves públicas do exercício no perfil `preview` do `eas.json` (campo `env`) ou nas variáveis de ambiente da EAS. Confira o passo exato em `docs/guia_modulo_txt/modulo_9/guia_expo_router_e_build_com_eas.txt`.

## Ao acrescentar uma funcionalidade
1. Qual modo? 2. A fonte já existe (`FonteDados` ou serviço do curso)? 3. O estado usa a união com os literais? 4. O erro passa por `classificarErro` e `registrarErro`? 5. Respeita o tema e os componentes? 6. Atualizei `docs/DECISOES.md` e o roteiro de teste?
