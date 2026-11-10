---
name: conferencia-guia-curso
description: Conferência do projeto mobile contra o material do curso UC8 (guias dos módulos 5 a 9 em docs/guia_modulo_txt). Use ao terminar qualquer tarefa que toque tema, estados de tela, contexto, serviço com fetch, Supabase, SQLite, cache, fila, tratamento de erro, roteiro de teste, eas.json, app.json, README, commits ou entrega final, e sempre que o dono pedir para conferir, auditar ou validar contra o professor. Traz os comandos de conferência, as palavras exatas que eles procuram e o que fazer com conflitos.
---

# Conferir contra o material do curso

O projeto é avaliado pelos guias do professor. A conferência é feita com comandos de leitura (`git grep`, `tsc`) que procuram **palavras e pastas exatas**; por isso nomes e literais importam.

## Onde está o material
`docs/guia_modulo_txt/modulo_5` até `modulo_9` (texto extraído dos PDFs de `docs/guia_modulo/`). Esses caminhos ficam fora do git. **Se não existirem, não deduza o conteúdo:** peça ao dono para rodar `python converter_guias.py` ou enviar os arquivos.

Tipos de arquivo em cada pasta `modulo_N`:
- `guia_conferencia_do_modulo_NN`: checklist do módulo (**prioridade máxima**; traz os comandos).
- `guia_*`: guias de prática do tema. `mNN_aXX_*`: aulas. `mNN_aXX_fechamento_do_modulo`: fechamento.
- Módulo 9: `guia_apresentacao_e_entrega_final` (grade de avaliação e conferência da entrega), `guia_expo_router_e_build_com_eas`, `guia_publicacao_em_loja_ciclo_de_vida_e_ensaio`.
- Um `guia_X` e a aula `mNN_aXX_X` de mesmo tema tratam do mesmo assunto: unifique os requisitos.

## Como proceder
1. Identifique os módulos que a tarefa toca e **leia o checklist** deles antes de implementar.
2. Os exemplos do guia usam "livros" e "Acervo": **adapte os nomes** ao nosso domínio (alunos, planos), mantendo a **forma** e as palavras que os comandos procuram.
3. Implemente; rode `git add .` (os comandos só leem arquivos rastreados).
4. Rode os comandos de `references/comandos-de-conferencia.md` (todos de leitura) e anote a **saída real**.
5. Relate: o que o guia espera, o que apareceu, o que falta. Nunca marque "atende" sem evidência.

## Palavras e nomes que a conferência procura
- Estados: `tipo: 'carregando'`, `tipo: 'erro'`, `tipo: 'pronto'` (aspas simples, espaço depois dos dois-pontos).
- Contexto: `createContext`, `useContext`, `...Provedor` e o hook `use...` usado nas telas.
- Serviço com fetch (`src/servicos`): `apikey` e `unknown`.
- Banco (`src/banco`): `openDatabaseAsync`, `CREATE TABLE IF NOT EXISTS`, `getAllAsync<`, `getFirstAsync<`, `runAsync(`.
- Cache e fila: `guardarLocal`, `listarLocal`, `origem: 'aparelho'`, `listarPendentes`, `guardarPendente`, `removerPendente`, textos "A enviar" e "Guardados no aparelho".
- Erros: `classificarErro`, `registrarErro`, `ErroDoBanco`, `ErroDeValidacao`.
- Esquema do exercício (`supabase/`): `revoke`.
- **A palavra `any`** (conferida com `git grep -nw any`): não pode aparecer em nenhum `.ts` ou `.tsx`, nem em comentário ou texto.

## Entregas e apresentação
Roteiro de teste, `eas.json`, `app.json`, README, histórico de commits e a grade dos 5 minutos: `references/entregas-e-apresentacao.md`.

## Conflitos entre o guia e o projeto
**Não resolva em silêncio.** Registre em `docs/DECISOES.md`: o que o guia exige, o que o código faz, as opções e o impacto. A decisão vigente é a de dois modos (`equipe` com API v1; `curso` com Supabase de exercício, SQLite e fila). Se o guia pedir algo que nenhum dos dois modos cobre, é conflito novo: pare e pergunte ao dono.

## Relatório de conferência (modelo)
| Item do guia | Comando | Esperado | Saída real | Situação |
| --- | --- | --- | --- | --- |
Situações: ATENDE (com evidência), PARCIAL, NÃO ATENDE, NÃO VERIFICÁVEL (precisa de aparelho, rede ou painel), CONFLITO.
