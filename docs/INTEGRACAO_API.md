# Mapeamento da Integração Completa com a API v1 (Modo Equipe)

Este documento apresenta a matriz de cobertura de 100% das rotas de equipe da API v1 no aplicativo mobile da **Academia MisterFit**, detalhando permissões exigidas, telas e pontos exatos de invocação no código-fonte.

---

## 1. Matriz de Cobertura de Rotas

| Método | Rota | Permissão | Tela e Ação | Arquivo e Linha |
|---|---|---|---|---|
| `POST` | `/auth/login` | Nenhuma (Pública) | `TelaLogin`: Autenticação e obtenção do token JWT | [`src/telas/TelaLogin.tsx:59`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaLogin.tsx#L59) |
| `GET` | `/auth/eu` | JWT Obrigatório | `SessaoContext`: Inicialização de sessão e revalidação de permissões no retorno ao primeiro plano (foreground) | [`src/auth/SessaoContext.tsx:60`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/auth/SessaoContext.tsx#L60), [`src/auth/SessaoContext.tsx:113`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/auth/SessaoContext.tsx#L113) |
| `POST` | `/auth/trocar-senha` | JWT Obrigatório | `TelaConta`: Formulário de troca de senha da própria conta conectada (validação de 8 a 128 caracteres) | [`src/telas/TelaConta.tsx:88`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaConta.tsx#L88) |
| `GET` | `/planos` | Nenhuma (Pública) | `TelaPlanos`: Listagem e grade responsiva dos planos de treino | [`src/telas/TelaPlanos.tsx:55`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaPlanos.tsx#L55) |
| `POST` | `/planos` | `planos:criar` | `TelaPlanos`: Modal de criação de novo plano com recursos descritivos dinâmicos | [`src/telas/TelaPlanos.tsx:151`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaPlanos.tsx#L151) |
| `PUT` | `/planos/:id` | `planos:atualizar` | `TelaPlanos`: Modal de edição de dados e recursos de plano existente | [`src/telas/TelaPlanos.tsx:148`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaPlanos.tsx#L148) |
| `DELETE` | `/planos/:id` | `planos:excluir` | `TelaPlanos`: Exclusão de plano (com tratamento de conflito 409 caso existam matrículas) | [`src/telas/TelaPlanos.tsx:180`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaPlanos.tsx#L180) |
| `GET` | `/alunos` | `alunos:listar` | `TelaAlunos` e `TelaBusca`: Listagem com pull-to-refresh e filtragem de alunos em tempo real | [`src/telas/TelaAlunos.tsx:42`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaAlunos.tsx#L42), [`src/telas/TelaBusca.tsx:29`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaBusca.tsx#L29) |
| `POST` | `/alunos` | `alunos:criar` | `TelaAlunos`: Modal de cadastro de novo aluno com validação de dados | [`src/telas/TelaAlunos.tsx:102`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaAlunos.tsx#L102) |
| `PUT` | `/alunos/:id` | `alunos:atualizar` | `TelaAlunos` e `TelaDetalheAluno`: Edição de dados cadastrais do aluno | [`src/telas/TelaAlunos.tsx:99`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaAlunos.tsx#L99), [`src/telas/TelaDetalheAluno.tsx:97`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaDetalheAluno.tsx#L97) |
| `PATCH` | `/alunos/:id/ativo` | `alunos:desativar` | `TelaAlunos` e `TelaDetalheAluno`: Arquivamento ou restauração do aluno | [`src/telas/TelaAlunos.tsx:144`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaAlunos.tsx#L144), [`src/telas/TelaDetalheAluno.tsx:137`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaDetalheAluno.tsx#L137) |
| `DELETE` | `/alunos/:id` | `alunos:excluir` | `TelaAlunos` e `TelaDetalheAluno`: Exclusão permanente de aluno (tratamento 409 com orientação de arquivamento se houver matrículas) | [`src/telas/TelaAlunos.tsx:170`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaAlunos.tsx#L170), [`src/telas/TelaDetalheAluno.tsx:162`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaDetalheAluno.tsx#L162) |
| `GET` | `/matriculas` | `matriculas:listar` | `TelaMatriculas` e `TelaDetalheAluno`: Listagem geral e histórico detalhado por aluno | [`src/telas/TelaMatriculas.tsx:46`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaMatriculas.tsx#L46), [`src/telas/TelaDetalheAluno.tsx:85`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaDetalheAluno.tsx#L85) |
| `POST` | `/matriculas` | `matriculas:criar` | `TelaMatriculas`: Modal de criação e fluxo de renovação rápida de matrícula vencida | [`src/telas/TelaMatriculas.tsx:126`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaMatriculas.tsx#L126) |
| `PATCH` | `/matriculas/:id/status` | `matriculas:atualizar-status` | `TelaMatriculas`: Alternância de status entre ativa e inativa | [`src/telas/TelaMatriculas.tsx:178`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaMatriculas.tsx#L178) |
| `DELETE` | `/matriculas/:id` | `matriculas:excluir` | `TelaMatriculas`: Exclusão permanente de matrícula cancelada/inativa | [`src/telas/TelaMatriculas.tsx:208`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaMatriculas.tsx#L208) |
| `GET` | `/usuarios` | `usuarios:listar` | `TelaUsuarios`: Listagem de colaboradores (aba visível apenas para usuários autorizados) | [`src/telas/TelaUsuarios.tsx:49`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaUsuarios.tsx#L49) |
| `POST` | `/usuarios` | `usuarios:criar` | `TelaUsuarios`: Modal de criação de colaborador com perfil admin ou recepção | [`src/telas/TelaUsuarios.tsx:118`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaUsuarios.tsx#L118) |
| `PATCH` | `/usuarios/:id/ativo` | `usuarios:desativar` | `TelaUsuarios`: Ativação ou desativação de usuário (com trava no próprio usuário conectado) | [`src/telas/TelaUsuarios.tsx:187`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaUsuarios.tsx#L187) |
| `PATCH` | `/usuarios/:id/senha` | `usuarios:redefinir-senha` | `TelaUsuarios`: Modal administrativo para redefinição de senha de colaboradores | [`src/telas/TelaUsuarios.tsx:153`](file:///home/amisterdan/Dev/uc8-projeto-mobile/src/telas/TelaUsuarios.tsx#L153) |

---

## 2. Inversão de Dependência e Camadas

Nenhuma tela acessa diretamente a camada de rede do cliente HTTP (`src/api`). A arquitetura adota estritamente o padrão de inversão de dependência:

```
[ Telas (React Native) ]
          │
          ▼
[ useDados() / DadosContext ]
          │
          ▼
[ Interface FonteDados ]
          │
          ▼
[ Implementação FonteApi ]
          │
          ▼
[ Cliente HTTP e Mapeadores (src/api) ]
          │
          ▼
[ API v1 (Servidor Backend) ]
```

- **Mapeadores Tolerantes (`src/api/mapeadores.ts`):** Convertem notação `snake_case` da API para `camelCase` das entidades TypeScript, ignoram propriedades adicionais desconhecidas e aceitam valores `null` em campos opcionais (`telefone`, `plano_nome`, `descricao`).
- **Estados de Tela (`src/tipos/estadoTela.ts`):** Toda comunicação assíncrona é refletida em uniões discriminadas `{ tipo: 'carregando' } | { tipo: 'erro'; mensagem: string } | { tipo: 'sucesso'; dados: T }`.

---

## 3. Tratamento Centralizado de Erros HTTP

Todos os erros retornados pela API são padronizados através da classe `ErroDaApi` e categorizados no módulo `src/erros/erros.ts`:

- **HTTP 400 (Validação):** Detalhes da API no formato `{ error: { details: [{ campo, mensagem }] } }` são mapeados pelo helper `extrairErrosCampos` e exibidos sob os campos exatos dos formulários.
- **HTTP 401 (Não Autenticado / Sessão Expirada):** O cliente HTTP dispara o callback registrado no `SessaoContext`, limpando o token seguro e redirecionando para a tela de login.
- **HTTP 403 (Sem Permissão / Usuário Desativado):** O cliente HTTP emite a mensagem *"Você não tem permissão para realizar esta ação"* e dispara o recarregamento transparente de permissões via `/auth/eu`.
- **HTTP 409 (Conflito):** Tratamento contextual na interface (aluno duplicado, exclusão de aluno com matrículas, aluno inativo recebendo matrícula, desativação da própria conta).
- **HTTP 429 (Muitas Requisições):** Respeita a mensagem da API orientando o tempo de espera antes de nova tentativa.
- **HTTP 503 (Banco Indisponível):** Exibe *"Serviço temporariamente indisponível. Tente novamente em instantes."* sem travar o aplicativo.
- **Falha de Rede / Timeout:** Detectado via `AbortController` (10 segundos) e exibido amigavelmente com botão *"Tentar de novo"*.

---

## 4. Garantia de Tipagem Estrita e Testes

- **Zero Ocorrências de `any`:** `git grep -nw any -- "*.ts" "*.tsx"` retorna 0 resultados.
- **Bateria de Testes Unitários:** `npm run test:unit` executa 64 testes automatizados cobrindo mapeadores, validações, responsividade e manipulação de datas.
- **Bateria de Testes de Contrato:** `npm run test:contrato` disponível para validação ao vivo contra o servidor real, com saltos automáticos e seguros quando as credenciais não forem injetadas no ambiente.
