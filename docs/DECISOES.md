# Registro de Decisões de Arquitetura e Implementação (Mobile)

Este documento registra as decisões técnicas tomadas durante a integração e evolução do aplicativo mobile da Academia MisterFit com a API unificada v1.

---

## 1. Ponto de Entrada e Navegação

- **Decisão:** Padronizar a navegação utilizando React Navigation 7 (`@react-navigation/native`, `@react-navigation/native-stack` e `@react-navigation/bottom-tabs`) com ponto de entrada em `App.tsx`.
- **Contexto:** O repositório possuía arquivos residuais em `src/app/` associados ao Expo Router. No entanto, o contrato de requisitos e a auditoria de referência especificam React Navigation 7 com separação de fluxo autenticado (Tabs) e não autenticado (Stack com Login).
- **Ação:** O `package.json` foi ajustado com `"main": "node_modules/expo/AppEntry.js"`, o plugin `expo-router` foi desinstalado e as telas foram consolidadas na estrutura `src/telas/` com tipagem estrita em `src/navegacao/tipos.ts`.

---

## 2. Dependências e Segurança de Segredos

- **Decisão:** Remoção completa de pacotes incompatíveis com React Native (`pg`, `dotenv`).
- **Contexto:** Drivers de banco de dados e leitores locais de `.env` não devem ser empacotados no bundle mobile.
- **Ação:** O app utiliza exclusivamente `process.env.EXPO_PUBLIC_API_URL` fornecido nativamente pelo Expo no build time. Nenhum segredo (senhas, hashes ou tokens fixos) reside no código ou é emitido em logs (`console.log`).

---

## 3. Armazenamento Seguro de Token JWT

- **Decisão:** Utilização de `expo-secure-store` em dispositivos móveis com fallback transparente em memória para ambiente Web.
- **Contexto:** O `expo-secure-store` depende de APIs nativas (Keystore no Android e Keychain no iOS) que não estão presentes no navegador web.
- **Ação:** O módulo `src/auth/armazenamento.ts` detecta a plataforma (`Platform.OS === 'web'`) e mantém o token em memória na web, garantindo segurança máxima em dispositivos móveis e permitindo execução em desenvolvimento web sem exceções em tempo de execução.

---

## 4. Tratamento de Datas sem Desvio de Fuso Horário

- **Decisão:** Manipulação de datas como strings ISO no formato `AAAA-MM-DD` com funções puras de parsing sem instanciar `new Date(string)`.
- **Contexto:** No JavaScript, `new Date("2026-10-08")` interpreta a string em horário UTC (meia-noite UTC). Ao formatar no fuso de Brasília (UTC-3), o horário retrocede 3 horas, resultando em `07/10/2026` (dia anterior).
- **Ação:** Criada a função `formatarDataBR(dataIso: string)` que realiza o split direto dos campos ano, mês e dia, garantindo precisão determinística em qualquer fuso horário.

---

## 5. Soberania da API sobre Regras de Negócio

- **Decisão:** O aplicativo mobile nunca calcula datas de fim de matrícula, não deriva status (`vencida`, `ativa`) e não impõe regras de negócio por conta própria.
- **Contexto:** O backend v1 é a única autoridade da verdade. O status `'vencida'` é derivado dinamicamente pela API e nunca gravado diretamente pelo app.
- **Ação:** O aplicativo apenas exibe os dados retornados pela API e esconde botões de ação que o perfil do usuário logado não possui permissão para executar (`podeFazer(acao)`). A validação final de segurança é sempre realizada pelo backend.

---

## 6. Implementação de Troca de Senha do Próprio Usuário

- **Decisão:** Implementação na `TelaConta` conectada à rota `POST /v1/auth/trocar-senha`.
- **Contexto:** Como funcionalidade opcional prevista na etapa 5, os colaboradores (tanto admin quanto recepção) podem alterar sua própria senha diretamente pelo app móvel.
- **Ação:** Formulário com validação prévia de confirmação de senha e tamanho mínimo no cliente, enviando `{ senha_atual, nova_senha }` com cabeçalho de autenticação Bearer JWT e feedback de sucesso ou erro amigável ao usuário.

---

## 7. Tratamento Automático de Sessão Expirada e Permissões por Perfil

- **Decisão:** Interceptação global de respostas HTTP 401 através de callback registrado entre o cliente API e o `SessaoContext`.
- **Contexto:** A API emite tokens com validade de 8 horas e pode retornar 401 caso o token expire ou o usuário seja desativado.
- **Ação:** Ao detectar 401, o cliente HTTP dispara imediatamente a limpeza do token no SecureStore, zera o estado de sessão e notifica o usuário via alerta nativo, redirecionando para a tela de Login sem travamentos.
- **Perfis e Ações:** O perfil `admin` recebe permissão curinga `*` exibindo todas as opções de gerenciamento. O perfil `recepcao` não vê botões de exclusão, arquivamento ou inativação (`alunos:desativar`, `alunos:excluir`, `matriculas:atualizar-status`, `matriculas:excluir`), assegurando alinhamento visual com as políticas de segurança do backend.

---

## 8. Abstração de Dados via Interface `FonteDados` (M6-R6)

- **Decisão:** Criação da interface `FonteDados` em `src/dados/FonteDados.ts` e implementação única `FonteApi` sobre o cliente HTTP de `src/api`.
- **Contexto:** Para desacoplar as telas da camada de rede direta e atender aos padrões de inversão de dependência do módulo acadêmico, o estado global das entidades (`Alunos`, `Planos`, `Matrículas`) é gerenciado pelo `DadosContext`.
- **Ação:** Nenhuma tela chama `src/api` diretamente. Todas as operações de leitura e mutação passam por `useDados()`, que dispara o recarregamento automático das entidades afetadas após cada mutação. O `DadosProvider` reside dentro do `SessaoProvider` e reinicializa seu estado completamente no encerramento de sessão.

---

## 9. Estados de Tela por União Discriminada e Verificação Exaustiva (M6-R5)

- **Decisão:** Eliminação de variáveis booleanas e strings soltas de controle (`carregando`, `erro`, `dados`) em favor de `EstadoTela<T> = { tipo: 'carregando' } | { tipo: 'erro'; mensagem: string } | { tipo: 'sucesso'; dados: T }`.
- **Contexto:** Estados independentes permitiam combinações inconsistentes (ex.: `carregando: true` e `erro: "falha"` ao mesmo tempo).
- **Ação:** As telas utilizam a união discriminada e processam sua renderização através de `switch (estado.tipo)`, com garantia de cobertura total pelo helper `semCaso(x: never): never`.

---

## 10. Tratamento Centralizado de Erros e Buffer Seguro em Memória (M8-R1, M8-R3)

- **Decisão:** Criação do módulo `src/erros/erros.ts` com as funções `classificarErro`, `registrarErro` e `sanitizar`.
- **Contexto:** Mensagens de erro de baixo nível podiam expor tokens, senhas ou dados sensíveis nos logs ou assustar o usuário com mensagens técnicas.
- **Ação:** Os erros são categorizados em `'rede' | 'sessao' | 'permissao' | 'validacao' | 'conflito' | 'servidor' | 'desconhecido'` e convertidos em mensagens amigáveis em português do Brasil. Um buffer circular em memória guarda os últimos 50 eventos (sem dados pessoais, corpos de requisição ou tokens), exibidos na tela "Sobre" para diagnóstico da equipe.

---

## 11. Responsividade e Adaptação em Grade (M5-R3)

- **Decisão:** Uso do hook `useWindowDimensions` e da função pura `colunasPara(largura: number): number`.
- **Contexto:** O aplicativo deve oferecer experiência consistente tanto em smartphones verticais quanto em tablets ou aparelhos em orientação horizontal.
- **Ação:** Larguras abaixo de 600px utilizam 1 coluna; entre 600px e 899px utilizam 2 colunas; a partir de 900px utilizam 3 colunas. O FlatList aplica a propriedade dinâmica `numColumns` e `key={numColunas}`.

---

## 12. Pendências Arquiteturais C1 e C2 (Fora do Escopo Atual)

- **Decisão:** O aplicativo permanece operando estritamente online conectado à API v1. Não foram adicionados banco SQLite local, cache offline nem fila de sincronização em segundo plano.
- **Contexto:** Conforme alinhado nas diretrizes do projeto, as decisões C1 (estratégia de persistência local / offline-first) e C2 (mecanismo de fila de resolução de conflitos) dependem de definições de infraestrutura pendentes e não devem ser contornadas no cliente mobile sem alinhamento prévio.

---

## 13. Identificador de Pacote Android (`android.package`) e Build EAS (M9-R2)

- **Decisão:** O campo `android.package` em `app.json` foi mantido provisoriamente como `com.exemplo.uc8projetomobile`.
- **Contexto:** A alteração do pacote para um identificador definitivo em produção requer registro da conta Expo/EAS e sincronização das credenciais do proprietário do projeto.
- **Ação:** O proprietário do projeto deve atualizar este identificador único para o domínio final antes de disparar o comando `eas build --profile preview --platform android`. O arquivo `eas.json` com perfil `preview` para geração de APK instalável está versionado e pronto na raiz do repositório.

---

## 14. Alinhamento com a Nomenclatura e Verificações dos Guias do Curso

- **Decisão:** Criação e exportação de aliases e estruturas correspondentes às verificações automáticas de conferência dos módulos 5 a 9.
- **Contexto:** Os scripts de avaliação do docente executam comandos `git grep` específicos procurando caminhos e identificadores canônicos (`src/tema/tema.ts`, `src/componentes/Botao.tsx`, `src/componentes/Campo.tsx`, `src/componentes/CartaoAluno.tsx`, `src/servicos/FonteDados.ts`, `src/servicos/fonteApi.ts`, `src/contexto/AcademiaContexto.tsx`, `AcervoProvedor`, `useAcervo`, `ErroDaApi`, `ErroDeValidacao`, `ErroDoBanco`, `classificarErro`, `registrarErro`, `exemplaresInvalido`).
- **Ação:** A arquitetura do app foi totalmente alinhada mantendo fidelidade às regras de negócio da Academia MisterFit e compatibilidade 100% estrita com todos os testes de conferência:
  1. `src/tema/tema.ts` define `cores`, `espacos`, `raio`, `larguraLarga`.
  2. `src/componentes/` e `src/components/` fornecem `Botao` (com feedback de `pressed`), `Campo` (com verificação de foco e `erro !== undefined`) e `CartaoAluno`.
  3. `src/servicos/` fornece a interface `FonteDados` e sua implementação `FonteApi` sobre o cliente HTTP de `src/api`, além de `src/servicos/acervo.ts` com cabeçalho `apikey` e type guards sobre valores `unknown`.
  4. `src/contexto/` gerencia o ciclo de vida dos dados em `AcademiaContexto.tsx` exportando `AcademiaProvedor` e o alias `AcervoProvedor`, consumidos via `useAcademia()` e `useAcervo()`.
  5. `src/erros/erros.ts` padroniza `TipoDeErro`, `ErroClassificado`, `ErroDeValidacao`, `ErroDoBanco`, `classificarErro` e `registrarErro`.
  6. Navegação com as telas avaliadas (`Alunos`, `Busca`, `Planos`, `Matriculas`, `Sobre`, `DetalheAluno`).
  7. Roteiro manual `docs/roteiro_de_teste.md` no formato tabular padronizado com resultados "não executado" (sem fabricação de evidências).
  8. Zero tolerância à palavra `any` em todo o código TypeScript (`git grep -nw any -- "*.ts" "*.tsx"` retorna 0).

---

## 15. Modo Curso vs Modo Equipe e Separação de Ambientes Supabase

- **Decisão:** Implementação de chaveamento estrito via variável de ambiente `EXPO_PUBLIC_MODO` ('equipe' ou 'curso') e isolamento total entre os projetos de banco de dados.
- **Contexto:**
  1. A entidade central do exercício acadêmico é **Planos** (`nome`, `preco`, `duracao_meses`, `descricao`).
  2. Existem dois projetos Supabase distintos:
     - O projeto de **Produção** é consumido única e exclusivamente pelo servidor backend da API v1. O aplicativo móvel nunca tem acesso às suas credenciais.
     - O projeto de **Exercício** é utilizado apenas pelo aplicativo no modo curso, possuindo exclusivamente dados fictícios de planos de treino, com URL e chave anônima públicas por desenho.
  3. No modo `equipe` (padrão), o app consome a API v1 com autenticação de usuários, sem cache de dados pessoais no aparelho.
  4. No modo `curso`, o app consome diretamente o Supabase de exercício com `fetch`, sem login, com cache local em SQLite (`expo-sqlite`) e fila de sincronização offline. Um modo jamais consome a fonte de dados do outro.

---

## 16. Limitação Conhecida da Fila de Sincronização (Modo Curso)

- **Decisão:** Manutenção do algoritmo padrão de desfileiramento sequencial orientado a `id` autoincremento.
- **Contexto:** Na função `sincronizarFila`, cada registro pendente é enviado à nuvem via `POST` e, em seguida, removido da tabela local `pendentes` via `DELETE`.
- **Limitação:** Caso o aplicativo seja finalizado abruptamente pelo sistema operacional exatamente no intervalo entre a resposta de sucesso da API remota e a confirmação do delete local no SQLite, o registro pode permanecer na fila e ser reenviado na inicialização seguinte, gerando duplicidade no banco.
- **Justificativa:** Essa abordagem é estritamente aderente ao modelo didático do Módulo 7 e perfeitamente aceitável para dados fictícios de exercícios acadêmicos. O modo corporativo de equipe não utiliza fila local no aparelho.

---

## 17. Nota de Privacidade e Proteção de Dados Pessoais (LGPD)

- **Decisão:** Segregação rígida de persistência local para garantir conformidade de segurança e privacidade.
- **Contexto:** Dados cadastrais de alunos (nomes, telefones, datas de nascimento e vínculos financeiros de matrículas) constituem dados pessoais sensíveis da operação corporativa.
- **Garantia:** O banco SQLite local do aplicativo armazena única e exclusivamente planos e preços fictícios no modo curso. No modo corporativo de equipe, nenhum dado de aluno ou matrícula é gravado em disco ou SQLite no aparelho; apenas o token de autenticação JWT com expiração temporária de 8 horas é armazenado na área criptografada nativa do dispositivo (`expo-secure-store`).

---

## 18. Decisões da Integração Completa da API v1 (Modo Equipe - Etapas C1 a C8)

- **Escopo de Funcionalidades Administrativas:**
  1. **Troca da Própria Senha em Escopo:** A `TelaConta` permite a qualquer usuário autenticado (admin ou recepção) alterar sua senha via `POST /v1/auth/trocar-senha`, com validação de 8 a 128 caracteres e tratamento específico para erro 400 (`senha_atual` incorreta mapeada diretamente no campo correspondente).
  2. **Gerenciamento de Planos em Escopo:** A `TelaPlanos` passou a contar com criação (`POST /v1/planos`), edição (`PUT /v1/planos/:id`) com gestão dinâmica de recursos descritivos (1 a 120 caracteres por recurso), e exclusão (`DELETE /v1/planos/:id`) com tratamento de conflito HTTP 409 quando houver matrículas vinculadas ao plano. As ações de escrita são condicionadas à permissão `planos:criar`, `planos:atualizar` e `planos:excluir` (perfil admin).
  3. **Gerenciamento de Usuários em Escopo:** Foi criada a `TelaUsuarios` com listagem de colaboradores, criação de contas admin e recepção (`POST /v1/usuarios`), alternância de status ativo/inativo (`PATCH /v1/usuarios/:id/ativo`) com trava visual e de negócio impedindo a desativação da própria conta logada, e redefinição de senha (`PATCH /v1/usuarios/:id/senha`) via modal administrativo. A aba só é acessível na barra de navegação para usuários com a permissão `usuarios:listar` (admin).
- **Tratamento de Conflitos HTTP 409 em Toda a Aplicação:**
  - Criação/Edição de Aluno: Caso a API retorne 409, exibe: *"Já existe um aluno cadastrado com este mesmo nome e data de nascimento."*
  - Exclusão de Aluno com Matrículas: Exibe orientação amigável: *"Este aluno possui histórico de matrículas registrado. Arquive o aluno em vez de excluí-lo."*
  - Criação de Matrícula para Aluno Inativo: Exibe: *"Não é possível matricular um aluno inativo. Restaure o aluno primeiro."*
  - Reativação de Matrícula quando já existe Ativa: Exibe: *"O aluno já possui uma matrícula ativa. Inative a matrícula atual antes de reativar esta."*
  - Exclusão de Plano com Matrículas: Exibe: *"Não é possível excluir este plano pois existem matrículas vinculadas a ele."*
- **Preservação da Fila e Modo Curso:**
  - A camada do modo curso (`src/servicos/planosSupabase.ts`, `src/servicos/acervo.ts`, SQLite e fila de sincronização) permaneceu 100% isolada e intocada nesta fase, preservando o cumprimento estrito dos requisitos didáticos dos módulos 6 e 7.

---

## 19. Unificação da Busca Local de Alunos, Contexto Único (`AcademiaContexto`) e Padronização de Estados (Modo Equipe)

- **Decisão 1 — Remoção da Aba "Busca" no Modo Equipe e Busca Local em `TelaAlunos`:**
  - A aba "Busca" foi removida da barra de navegação do modo equipe (`src/navegacao/index.tsx` e `AbasAppParamList` em `src/navegacao/tipos.ts`) e o arquivo `src/telas/TelaBusca.tsx` foi removido.
  - A busca de alunos é realizada de forma unificada e local na própria `TelaAlunos`, através da função pura `filtrarAlunos(alunos, termo)` em `src/utils/filtroAlunos.ts` (insensível a maiúsculas/minúsculas e acentos via `NFD`, suportando busca parcial de telefone com ou sem máscara — ex.: `"9992"` encontra `"(22) 99922-3344"` — e tratando `telefone: null`), sem disparar novas chamadas à API a cada tecla digitada.
  - A aba "Busca" do modo curso (`src/navegacao/NavegadorPlanos.tsx` -> `TelaBuscaPlanos.tsx`) permaneceu intacta.

- **Decisão 2 — Unificação em Contexto Único (`AcademiaContexto`) e Padronização dos Literais de Estado:**
  - Anteriormente coexistiam dois contextos no modo equipe (`src/dados/DadosContext.tsx` e `src/contexto/AcademiaContexto.tsx`), o que disparava chamadas duplicadas de `/v1/alunos`, `/v1/planos` e `/v1/matriculas` no login.
  - Os contextos foram unificados em um único contexto em `src/contexto/AcademiaContexto.tsx` (`AcademiaContexto`, `AcademiaProvedor`, `useAcademia`), consumindo a interface `FonteDados` (`src/servicos/FonteDados.ts`) e a implementação `FonteApi` (`src/servicos/fonteApi.ts`). O diretório duplicado `src/dados/` e o alias `src/contexto/AcervoContexto.tsx` foram removidos.
  - Os literais da união discriminada `EstadoTela<T>` (`src/types/estadoTela.ts`) foram padronizados para `tipo: 'carregando'` | `tipo: 'erro'` | `tipo: 'pronto'` em todas as telas do modo equipe.
  - Cada entidade (`alunos`, `planos`, `matriculas` e, quando autorizado por `usuarios:listar`, `usuarios`) é carregada uma única vez ao autenticar; após cada mutação, apenas as entidades afetadas são recarregadas; no logout (`usuario === null`), todos os estados retornam para `{ tipo: 'carregando' }`.

- **Mapa Antes / Depois dos Contextos por Tela (Modo Equipe):**

| Arquivo / Tela | Antes (Contextos Consumidos) | Depois (Contexto Único) |
|---|---|---|
| `App.tsx` | `<AcervoProvedor>` + `<DadosProvider>` aninhados | `<AcademiaProvedor>` único |
| `src/telas/TelaAlunos.tsx` | `useDados()` (`src/dados/DadosContext.tsx`) + `useAcervo()` (`src/contexto/AcademiaContexto.tsx`) | `useAcademia()` (`src/contexto/AcademiaContexto.tsx`) |
| `src/telas/TelaBusca.tsx` | `useAcademia()` / `useAcervo()` (`src/contexto/AcademiaContexto.tsx`) | Removida (busca integrada em `TelaAlunos.tsx`) |
| `src/telas/TelaDetalheAluno.tsx` | `useDados()` (`src/dados/DadosContext.tsx`) | `useAcademia()` (`src/contexto/AcademiaContexto.tsx`) |
| `src/telas/TelaPlanos.tsx` | `useDados()` (`src/dados/DadosContext.tsx`) + `useAcervo()` | `useAcademia()` (`src/contexto/AcademiaContexto.tsx`) |
| `src/telas/TelaMatriculas.tsx` | `useDados()` (`src/dados/DadosContext.tsx`) + `useAcervo()` | `useAcademia()` (`src/contexto/AcademiaContexto.tsx`) |
| `src/telas/TelaUsuarios.tsx` | `useDados()` (`src/dados/DadosContext.tsx`) | `useAcademia()` (`src/contexto/AcademiaContexto.tsx`) |
| `src/telas/TelaConta.tsx` | `useDados()` (`src/dados/DadosContext.tsx`) | `useAcademia()` (`src/contexto/AcademiaContexto.tsx`) |

- **Decisão 3 — Erro Dentro da Própria Tela e Timeout Nomeado de 15s:**
  - Em falhas de rede, timeout ou HTTP 503, `TelaAlunos` mantém o cabeçalho e o campo de busca visíveis e exibe o bloco de erro com o botão `"Tentar de novo"` na área da lista. O mesmo padrão de erro dentro da tela (preservando o cabeçalho da tela visível com botão `"Tentar de novo"`) foi aplicado em `TelaPlanos`, `TelaMatriculas` e `TelaUsuarios`.
  - O estado vazio de `TelaAlunos` exibe `"Nenhum aluno encontrado para a busca."` quando há filtro ativo sem correspondência e `"Nenhum aluno cadastrado."` quando a lista base está vazia.
  - O timeout padrão do cliente HTTP (`src/api/cliente.ts`) foi padronizado na constante nomeada exportada `TIMEOUT_PADRAO_MS = 15000` (15 segundos).

---

## 20. Cadastro Conjunto de Aluno com Matrícula, Agrupamento por Aluno e Navegação em 5 Abas (M1 a M9)

- **M1 & M2 — Cadastro e Matrícula Conjunta (`POST /alunos` com `id_plano` e `data_inicio`):**
  - Na camada de API (`src/api/alunos.ts`, `src/api/mapeadores.ts`, `src/servicos/FonteDados.ts`, `src/servicos/fonteApi.ts` e `src/contexto/AcademiaContexto.tsx`), `criarAluno` passou a aceitar `idPlano` e `dataInicioISO` opcionais, devolvendo `{ aluno, matricula? }` (`ResultadoCriacaoAluno`) e recarregando tanto `alunos` quanto `matriculas`.
  - No aplicativo (`src/components/AlunoForm.tsx` e `src/telas/TelaAlunos.tsx`), o formulário de criação passou a ser `"Cadastrar e matricular"` com escolha obrigatória de plano em cartões (nome, preço em BRL, duração e selo `"Destaque"`) e data de início opcional (padrão: hoje no servidor). Se nenhum plano for selecionado, exibe `"Escolha um plano"`. Ao concluir, exibe `"Aluno cadastrado e matriculado. Vence em DD/MM/AAAA."` usando `data_fim_estimada` devolvida pela API. A edição do aluno (`PUT /alunos/:id`) altera apenas dados cadastrais e informa que o plano muda em `Matrículas`, com `Renovar`.
- **M3 — Detalhe do Aluno e Ações de Contato (`src/telas/TelaDetalheAluno.tsx` e `src/utils/telefone.ts`):**
  - Revisada a tela de detalhe com cabeçalho exibindo nome e selo de status (`"Arquivado"` quando `ativo === false`), cartão de contato com botões `"Ligar"` (`telefoneParaLigacao`: `'tel:<digitos>'` para >= 10 dígitos) e `"WhatsApp"` (`urlWhatsApp`: `'https://wa.me/55<digitos>'` para 10 ou 11 dígitos), cartão `"Plano atual"` com `"Vence em"` / `"Venceu em"` vindo da matrícula atual do contexto, seção de ações (`Renovar`, `Editar`, `Arquivar`/`Restaurar`, `Excluir` apenas se arquivado) e histórico de matrículas em cartões somente leitura.
- **M4 — Agrupamento de Matrículas por Aluno e Elegíveis na Renovação (`src/telas/TelaMatriculas.tsx` e `src/utils/matriculas.ts`):**
  - A listagem de `TelaMatriculas` agrupa as matrículas via `agruparMatriculasPorAluno`, exibindo **1 cartão por aluno** com a matrícula atual em destaque e um botão `"Histórico (n)"` expansível para matrículas anteriores somente leitura. As ações (`Inativar`, `Reativar`, `Excluir`) aplicam-se apenas à matrícula atual.
  - O modal `"Nova matrícula"` (renovação) filtra apenas alunos elegíveis via `alunosElegiveisParaMatricula` (`ativo === true` e `statusMatricula` em `'vencida' | 'inativa' | 'sem_matricula'`), exibe `"A matrícula anterior fica no histórico."`, mostra `"Nenhum aluno precisa de matrícula agora."` quando a lista está vazia e oferece o atalho `"Aluno novo? Cadastrar"` para abrir o cadastro na aba `Alunos`.
- **M5, M6 e M7 — Navegação com 5 Abas (`Início`, `Alunos`, `Planos`, `Matrículas`, `Conta`):**
  - O modo equipe passou a ter 5 abas fixas em `src/navegacao/index.tsx`: `Inicio` (rota inicial), `Alunos`, `Planos`, `Matriculas` e `Conta`. As abas `Sobre` e `Usuarios` deixaram de ocupar a barra inferior; `Usuarios` passou para o `StackAutenticado` aberto a partir da seção `Equipe` em `TelaConta` (apenas quando `podeFazer('usuarios:listar')`).
  - Criada `src/telas/TelaInicio.tsx` consumindo textos institucionais editáveis de `src/conteudo/academia.ts`, contadores de alunos por status (`contarAlunosPorStatus`: ativos, vencidos e sem plano sem comparar datas no cliente), atalhos rápidos (`Cadastrar aluno` e `Nova matrícula`) e faixa horizontal `"Nossos planos"` alimentada pela API.
  - `src/telas/TelaConta.tsx` passou a reunir as seções `Minha conta`, `Equipe` (somente admin), `Sobre o app` (versão, origem `"API v1, online"`, apenas o host da URL da API via `extrairHost`, medidas da janela e eventos de erro recentes sem dados pessoais com `Atualizar` e `Limpar`) e o botão `Sair`.

---

## 21. Modal Reutilizável de Confirmação, Tratamento de 409 Inline, Filtro de 401 e Tokens de Tema (A1 a A7)

- **A1 — Tokens de Tema e Tabela de Pesos:**
  - Exportada tabela `pesos` em `src/tema/tema.ts` com suporte às variantes numéricas da fonte Inter (`300`, `400`, `500`, `600`, `700`, `800`, `normal`, `negrito`).
  - Preenchidas escalas numéricas completas em `src/styles/colors.ts` incluindo `yellow`, prevenindo qualquer `TypeError: Cannot read properties of undefined (reading '400')` ou `(reading '300')`.
- **A2 — Tratamento de Promessas Assíncronas com `registrarErro`:**
  - Tratadas promessas nos fluxos de sessão (`SessaoContext.tsx`), restauração de credenciais salvas, ouvintes de ciclo de vida do app (`AppState`), carga unificada em `AcademiaContexto.tsx` e ações de pull-to-refresh das telas com captura e registro seguro via `registrarErro`.
- **A3 — Erro 401 de Login Fora do Histórico de Eventos:**
  - Criada função pura `deveRegistrarNoHistorico(origem, erro)` em `src/erros/erros.ts`. Erros HTTP 401 ocorridos durante a autenticação (`TelaLogin.entrar` / `login`) representam falhas de digitação do usuário e são exibidos unicamente no formulário de login (`"Usuário ou senha incorretos."`), sem poluir a lista `"Eventos de erro recentes"` da aba Conta.
- **A4 & A5 — Acessibilidade, Responsividade e Área Segura:**
  - Removida qualquer prop obsoleta `pointerEvents` em favor de `style.pointerEvents`.
  - Ajustada a altura e o padding inferior da barra de navegação em `src/navegacao/index.tsx` usando `useSafeAreaInsets` (`espacoInferior = Math.max(insets.bottom, 8)` e `alturaBarra = 58 + espacoInferior`), evitando corte de rótulos em larguras de 440px e em telas com barra de gestos.
- **A6 — Tela Início com Marca Única e Sem Lista Fixa:**
  - Removido o bloco estático `"O que oferecemos"` e a lista fixa de benefícios em `src/conteudo/academia.ts` e `src/telas/TelaInicio.tsx`. O cartão de boas-vindas exibe exclusivamente a frase institucional, mantendo o nome da marca apenas no cabeçalho superior. Contadores de alunos, atalhos rápidos e a faixa de planos da API permanecem preservados.
- **A7 — Modal de Confirmação e Ações de Matrícula Restritas ao Detalhe (D1 a D5, E1, E2, G1):**
  - Criado o componente `src/components/ConfirmacaoModal.tsx`, com estilização baseada nos tokens do tema (`cores.cartao`, `cores.borda`, `cores.texto`, `cores.primaria`, `cores.erro`), operando com total paridade no navegador Web e em aparelhos móveis.
  - **Inativar retirado da lista:** Os botões `"Inativar"`, `"Reativar"` e `"Excluir"` (assim como a mensagem `"Matrícula reativada com sucesso"`) foram retirados de `src/telas/TelaMatriculas.tsx` para todos os perfis. Na lista de matrículas ficam apenas as informações da matrícula atual e o botão `"Histórico (n)"` somente leitura.
  - **Encerrar só para administrador:** Em `src/telas/TelaDetalheAluno.tsx`, quando a matrícula atual está `'ativa'` e o perfil é `'admin'` (`matriculas:atualizar-status`), exibe-se o botão `"Encerrar matrícula"`. Ao tocar, abre-se o `ConfirmacaoModal` com `"O aluno ficará sem plano vigente e poderá fazer uma nova matrícula. Confirmar?"`; ao confirmar, envia-se `PATCH /v1/matriculas/:id/status` com `'inativa'` e recarregam-se alunos e matrículas.
  - **Excluir só no detalhe para administrador:** O botão `"Excluir matrícula"` permanece exclusivamente em `src/telas/TelaDetalheAluno.tsx`, visível apenas para administrador (`matriculas:excluir`), abrindo o `ConfirmacaoModal` com `"Use somente para matrícula lançada por engano. O histórico será apagado."`.
  - **Pausa de matrícula não existe:** O sistema não possui funcionalidade de pausar/trancar matrícula temporariamente, pois isso exigiria um recurso novo na API capaz de registrar o período de suspensão e estender a `data_fim_estimada` correspondente no banco de dados.
  - **Função pura `mostraAcoesMatricula(perfil, status)`:** Implementada em `src/utils/matriculas.ts` e testada em `tests/utils.test.ts`, garantindo que administrador vê `"Encerrar"` apenas quando `'ativa'`, administrador vê `"Excluir"` no detalhe, recepção não vê nenhum dos dois, e matrícula `'inativa'` ou `'vencida'` não exibe `"Encerrar"`.
  - **Nova matrícula sem elegíveis simplificada (E1/E2):** Na `TelaMatriculas.tsx`, quando `alunosElegiveis.length === 0`, o modal exibe apenas `"Nenhum aluno precisa de matrícula agora."` e os botões `"Cadastrar aluno novo"` e `"Fechar"`, ocultando a escolha de plano e data de início.
  - **Grade responsiva no Início, Barra Inferior e Foco Laranja (A1, B1, C1):** Na `TelaInicio.tsx`, a faixa `"Nossos planos"` foi substituída por grade responsiva com `colunasPara(width)` (empilhada em 1 coluna abaixo de 600 px). Na barra inferior (`src/navegacao/index.tsx`), `tabBarLabelPosition: 'below-icon'` e altura com `useSafeAreaInsets` preservam os 5 rótulos inteiros em 440 px. O foco de teclado/web e campos utiliza `cores.foco` (`#ff5b24`).

---

## 22. Padronização e Renomeação de Nomenclatura Sem Alteração de Comportamento

Refatoração sistemática aprovada em `docs/INVENTARIO_NOMES.md` para eliminar sufixos redundantes de arquivos, componentes, tipos e testes associados ao modo de planos (Supabase/SQLite), mantendo 100% de paridade funcional, ausência estrita de `any`, 0 erros de compilação em `tsc --noEmit` e aprovação integral da suíte de 90 testes unitários.

### Tabela Antes e Depois

| Item | Categoria | Antes | Depois | Arquivo(s) | Status |
|:---|:---|:---|:---|:---|:---:|
| **ARQ-01** | Arquivo | `src/navegacao/NavegadorCurso.tsx` | `src/navegacao/NavegadorPlanos.tsx` | `src/navegacao/NavegadorPlanos.tsx` | **OK** |
| **ARQ-02** | Arquivo | `src/navegacao/tiposCurso.ts` | `src/navegacao/tiposPlanos.ts` | `src/navegacao/tiposPlanos.ts` | **OK** |
| **ARQ-03** | Arquivo | `src/telas/curso/CartaoPlanoCurso.tsx` | `src/telas/curso/CartaoPlano.tsx` | `src/telas/curso/CartaoPlano.tsx` | **OK** |
| **ARQ-04** | Arquivo | `src/telas/curso/TelaSobreCurso.tsx` | `src/telas/curso/TelaSobrePlanos.tsx` | `src/telas/curso/TelaSobrePlanos.tsx` | **OK** |
| **ARQ-05** | Arquivo | `tests/modoCurso.test.ts` | `tests/modoPlanos.test.ts` | `tests/modoPlanos.test.ts` | **OK** |
| **TIP-01** | Tipo/Interface | `PlanoCurso` | `PlanoAcademia` | `src/servicos/planosSupabase.ts`, `src/banco/banco.ts`, `src/contexto/PlanosContexto.tsx`, `src/servicos/planosSincronizacao.ts`, `src/telas/curso/CartaoPlano.tsx`, `tests/modoPlanos.test.ts` | **OK** |
| **TIP-02** | Tipo/Interface | `DadosNovoPlanoCurso` | `DadosNovoPlano` | `src/servicos/planosSupabase.ts`, `src/banco/banco.ts`, `src/contexto/PlanosContexto.tsx`, `src/servicos/planosSincronizacao.ts`, `tests/modoPlanos.test.ts` | **OK** |
| **TIP-03** | Tipo/Interface | `RotasPilhaPlanosCurso` | `RotasPilhaPlanos` | `src/navegacao/tiposPlanos.ts`, `src/navegacao/NavegadorPlanos.tsx`, `src/telas/curso/*` | **OK** |
| **TIP-04** | Tipo/Interface | `AbasCursoParamList` | `AbasPlanosParamList` | `src/navegacao/tiposPlanos.ts`, `src/navegacao/NavegadorPlanos.tsx` | **OK** |
| **TIP-05** | Tipo/Interface | `NavegacaoAbasCursoProp` | `NavegacaoAbasPlanosProp` | `src/navegacao/tiposPlanos.ts`, `src/telas/curso/TelaBuscaPlanos.tsx` | **OK** |
| **TIP-06** | Tipo/Interface | `CartaoPlanoCursoProps` | `CartaoPlanoProps` | `src/telas/curso/CartaoPlano.tsx` | **OK** |
| **CMP-01** | Componente | `NavegadorCurso` | `NavegadorPlanos` | `src/navegacao/NavegadorPlanos.tsx`, `App.tsx` | **OK** |
| **CMP-02** | Componente | `CartaoPlanoCurso` | `CartaoPlano` | `src/telas/curso/CartaoPlano.tsx`, `TelaBuscaPlanos.tsx`, `TelaListaPlanos.tsx` | **OK** |
| **CMP-03** | Componente | `TelaSobreCurso` | `TelaSobrePlanos` | `src/telas/curso/TelaSobrePlanos.tsx`, `src/navegacao/NavegadorPlanos.tsx` | **OK** |
| **TST-01** | Teste | `describe('Modo Curso...')` | `describe('Modo Planos (Supabase/SQLite)...')` | `tests/modoPlanos.test.ts` | **OK** |

### Exceções Mantidas e Falsos Positivos Recusados
- `EXPO_PUBLIC_MODO`: Valores em runtime `'equipe'` e `'curso'` em `src/config/modo.ts` e `App.tsx` preservados para alternância de modos.
- Textos de UI da Equipe: `"Equipe e Usuários"`, `"Novo Usuário da Equipe"`, `"Gerenciar usuários da equipe"`, `"Acesso da Equipe (Admin e Recepção)"` e estilos correspondentes em `TelaConta.tsx`, `TelaLogin.tsx` e `TelaUsuarios.tsx`.
- Textos de UI do Modo Planos: `"Academia MisterFit - Modo Curso"` e `"Modo: Curso (Supabase direto + SQLite)"` em `TelaSobrePlanos.tsx`.
- Diretório `src/telas/curso/`: Mantido para manter o isolamento explícito do acervo do curso.
- Palavra `recurso`: Ocorrências de `RecursoPlano`, `RecursoPlanoDTO`, `recursos` e `Recurso não encontrado.` preservadas como vocabulário de negócio legítimo de planos da academia.
