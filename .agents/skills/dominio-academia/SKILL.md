---
name: dominio-academia
description: Regras de negócio da Academia MisterFit (alunos, planos e matrículas). Use SEMPRE que a tarefa envolver cadastro de aluno, plano ou matrícula, cálculo de vencimento ou da data de fim, status (ativa, inativa, vencida, sem matrícula), renovação, arquivar ou excluir aluno ou matrícula, ou permissões de administrador e recepção, mesmo que o pedido não use esses termos exatos. Define o que o app mostra e o que só a API decide.
---

# Domínio da academia

O sistema controla **alunos**, **planos** e **matrículas** de uma academia. Quem matricula um aluno escolhe um plano; a matrícula vale por um número de meses definido pelo plano e depois vence.

## Quem decide o quê
- **A API decide** a data de fim, o status "vencida", o status do aluno, as permissões e as validações finais.
- **O app exibe** o que a API devolve, antecipa validações só para dar resposta rápida e esconde botões que o perfil não pode usar.
- Nunca implemente cálculo de vencimento, derivação de status ou regra de permissão no app. Se precisar de um número que a API não entrega, peça em `docs/PEDIDOS_PARA_API.md`.

## Vencimento (a regra do dono)
**Data de fim = data de início + duração do plano em meses de calendário.**
- Mesmo dia do mês; se o mês de destino não tem esse dia, vale o último dia do mês.
- Calculada no servidor, no SQL (`make_interval`), nunca no app.
- Início padrão = hoje no fuso `America/Sao_Paulo`.
- Exemplo: plano Fit de 1 mês, cadastro em 20/10/2026, vence em 20/11/2026. Plano Mister de 3 meses, mesmo dia, vence em 20/01/2027.
- Mais exemplos, inclusive fim de mês e ano bissexto: `references/vencimento-exemplos.md`. Use-os como casos de teste e de fixture; não os reimplemente.

## Status
**Matrícula.** O banco guarda só `ativa` ou `inativa`. `vencida` é **calculada pela API**: matrícula `ativa` cuja data de fim já passou (`data_fim_estimada < hoje`). No próprio dia do vencimento ela ainda está ativa. O app nunca envia `vencida`.

**Aluno** (`status_matricula`, calculado pela API a partir da matrícula **mais recente**, por início e depois por id):

| Matrícula mais recente | Status do aluno |
| --- | --- |
| nenhuma | `sem_matricula` |
| `inativa` | `inativa` |
| `ativa` com fim anterior a hoje | `vencida` |
| `ativa` vigente | `ativa` |

`ativo = false` é outra coisa: o cadastro está **arquivado**. A tela mostra "Arquivado" (linha esmaecida) independentemente do status da matrícula.

## Uma matrícula vigente por aluno, cadastro com plano e renovação
- **Aluno novo pela interface sempre nasce com plano (cadastro e matrícula numa transação):** o formulário "Cadastrar e matricular" envia `POST /alunos` com `id_plano` obrigatório e `data_inicio` opcional. A API cria o aluno e a matrícula juntos e devolve `data_fim_estimada`. A edição do aluno (`PUT /alunos/:id`) altera apenas os dados cadastrais; o plano muda em Matrículas, com Renovar.
- **Renovar é uma NOVA matrícula e o histórico é preservado:** renovar nunca sobrescreve a matrícula anterior.
- **A lista de matrículas agrupa por aluno:** exibe um cartão por aluno com a matrícula atual em destaque (a primeira devolvida pela API) e um botão `"Histórico (n)"` que abre as anteriores em modo somente leitura. Não há botões de `"Inativar"`, `"Reativar"` ou `"Excluir"` na lista de matrículas.
- **Só alunos ativos com matrícula vencida, inativa ou sem plano recebem nova matrícula:** a tela de "Nova matrícula" (renovação) filtra apenas alunos elegíveis (`ativo = true` e `status_matricula` em `vencida`, `inativa` ou `sem_matricula`) e exige a permissão `matriculas:criar`. Se não houver alunos elegíveis, o modal exibe apenas `"Nenhum aluno precisa de matrícula agora."` com botões `"Cadastrar aluno novo"` e `"Fechar"`.
- A API recusa (409) uma segunda matrícula ativa não vencida para o mesmo aluno, e recusa (409) matricular aluno arquivado.

## Arquivar x excluir
- **Arquivar** (`PATCH /alunos/:id/ativo` com `ativo=false`) é reversível ("restaurar"). Exige `alunos:desativar` (admin).
- **Excluir** aluno é definitivo e a API só aceita se ele **não tem matrículas** (senão 409). A interface oferece excluir só para aluno arquivado e confirma antes; no 409, orienta a arquivar.
- **Matrícula (no detalhe do aluno, via `mostraAcoesMatricula`):** `"Encerrar matrícula"` exige `matriculas:atualizar-status` (admin) e só aparece quando a matrícula atual está `'ativa'`, confirmando em `ConfirmacaoModal` e enviando `PATCH /matriculas/:id/status` com `'inativa'`. `"Excluir matrícula"` exige `matriculas:excluir` (admin) e fica apenas em `TelaDetalheAluno` com `ConfirmacaoModal` alertando que o histórico será apagado. Pausar matrícula não é suportado pelo app (exigiria recurso novo na API para estender `data_fim_estimada`).
- Há índice único por nome + data de nascimento: criar ou editar aluno repetido dá 409.

## Planos
- Vêm do banco: `nome`, `preco` (número), `duracao_meses`, `descricao` (pode ser `null`), `destaque` e `recursos[{descricao}]`.
- Os nomes **Basic, Fit e Mister** são exemplos do projeto (Mister é o destaque). **Nunca fixe nome, preço, duração ou benefício no app.**
- O desktop escreve "R$ 0,00 no 1º mês, depois R$ X" no código. **Não replique isso**: só mostre promoção se a API entregar um campo para isso.
- Preço em reais (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`); duração "1 mês" ou "N meses".
- Criar, editar e excluir plano: `planos:criar`, `planos:atualizar`, `planos:excluir` (admin). Excluir dá 409 se houver matrículas no plano.

## Datas e validações
- Datas civis chegam e vão como texto `AAAA-MM-DD`. Exiba `DD/MM/AAAA` **dividindo o texto**; nunca `new Date('AAAA-MM-DD')`. O usuário digita `DD/MM/AAAA` com máscara e o app converte antes de enviar.
- Espelho das validações da API (a API decide): aluno com nome de 3 a 100 caracteres, nascimento real, anterior a hoje e a partir de 1900, telefone opcional com DDD (10 a 13 dígitos, até 20 caracteres, aceita máscara); plano com nome de 2 a 50, preço de 0 a 100000 e duração inteira de 1 a 60 meses.

## Permissões
- Administrador: tudo (`*`).
- Recepção: `alunos:listar`, `alunos:criar`, `alunos:atualizar`, `planos:listar`, `matriculas:listar`, `matriculas:criar`. Não arquiva, não exclui, não inativa matrícula, não mexe em planos nem em usuários.
- O app guarda a lista de permissões do login e usa `podeFazer(acao)` (verdadeiro se tiver `*` ou a ação). Em 403, mostre mensagem clara e releia `/auth/eu`.

## Checklist ao mexer nessas regras
1. A regra é do servidor? Então o app só exibe.
2. Algum texto, preço ou prazo está fixo no código? Tire.
3. Alguma data passou por `new Date` com texto civil? Troque pela divisão do texto.
4. O botão respeita a permissão **e** o estado (renovar só sem vigente; excluir só arquivado ou sem matrícula)?
5. Os 409 têm mensagem própria?
6. Há teste com fixture que inclui valores `null` (telefone, plano, descrição)?
