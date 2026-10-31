# Pedidos e Recomendações para a Equipe de Backend (API v1)

Este documento registra oportunidades de melhoria, necessidades identificadas durante a integração do aplicativo mobile e solicitações para a evolução dos contratos da API `/v1`.

---

## 1. Busca Server-Side em Alunos e Matrículas

- **Endpoint afetado:** `GET /v1/alunos` e `GET /v1/matriculas`
- **Situação atual:** A API retorna a listagem completa e a filtragem por texto (nome do aluno, telefone) é realizada localmente no cliente móvel.
- **Solicitação:** Suportar parâmetros de busca via query string, como `GET /v1/alunos?busca=carlos` e `GET /v1/matriculas?status=ativa`.
- **Benefício:** Redução de tráfego de dados e ganho expressivo de performance quando a base de alunos e matrículas crescer.

---

## 2. Paginação em Listagens Densas

- **Endpoint afetado:** `GET /v1/alunos` e `GET /v1/matriculas`
- **Situação atual:** As listagens retornam um array contendo todos os registros cadastrados no banco.
- **Solicitação:** Introduzir suporte a paginação baseada em cursor ou `limit`/`offset` (ex.: `?pagina=1&limite=20`), incluindo metadados no header ou no corpo (`total`, `tem_mais`).
- **Benefício:** Evita consumo excessivo de memória em aparelhos móveis de entrada.

---

## 3. Endpoint Específico para Seleção de Alunos Aptos à Matrícula

- **Endpoint afetado:** Fluxo de criação de matrícula (`POST /v1/matriculas`)
- **Situação atual:** O aplicativo precisa carregar a lista completa de alunos via `GET /v1/alunos` e filtrar no app apenas aqueles com `ativo === true` para disponibilizar no seletor de matrícula.
- **Solicitação:** Disponibilizar um filtro `GET /v1/alunos?ativo=true&resumo=true` (retornando apenas `id` e `nome`).
- **Benefício:** Reduz o payload transferido durante o preenchimento do formulário de matrícula.

---

## 4. Retorno Detalhado de Matrícula Criada

- **Endpoint afetado:** `POST /v1/matriculas`
- **Situação atual:** A resposta de sucesso (201) devolve `{ id, id_aluno, id_plano, data_inicio, data_fim_estimada, status }`.
- **Solicitação:** Incluir opcionalmente os nomes `aluno_nome` e `plano_nome` no retorno do 201, facilitando a exibição imediata do cartão sem necessidade de releitura de toda a lista.
