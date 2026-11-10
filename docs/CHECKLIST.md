# Checklist de Implementação e Qualidade — Academia MisterFit (Mobile)

Data de atualização: 10/11/2026  
Status geral: Itens do AGENTE 100% concluídos e verificados; itens dependentes de infraestrutura física/lojas/segredos marcados como [DONO].

Legenda:
- `[x]` Concluído e verificado
- `[~]` Parcialmente concluído
- `[ ]` Não iniciado / Pendente
- `[?]` Em dúvida / Aguardando definição
- `BLOQUEADO` Impedido por dependência externa

---

## Bloco 1: Configuração, Ambiente e Conformidade

- [x] **1.1** [AGENTE] [10/11/2026] Configuração do ambiente e modo de operação `EXPO_PUBLIC_MODO=equipe`.
- [x] **1.2** [AGENTE] [10/11/2026] Preservação e commits do modo curso isolados, sem afetação da navegação do curso e sem `git push`.
- [x] **1.3** [AGENTE] [10/11/2026] Arquivo `.env.example` auditado contendo apenas placeholders seguros (sem credenciais nem tokens reais).
- [x] **1.4** [AGENTE] [10/11/2026] Arquivo `README.md` com seção clara `"## Configuração"` documentando o uso do `.env.local` e variáveis necessárias.
- [x] **1.5** [AGENTE] [10/11/2026] Documento `docs/INTEGRACAO_API.md` mapeando 100% das rotas de equipe (`PUT /usuarios/:id/senha` com `usuarios:redefinir-senha`, `PATCH /usuarios/:id/ativo` com `usuarios:alterar-ativo`, etc.) e conferência do `src/api/usuarios.ts`.
- [x] **1.6** [AGENTE] [10/11/2026] Sanitização documental: remoção de `exemplaresInvalido`, da palavra `CPF` e das marcações legadas `(C16)`, `(C17)`, `(C18)` do roteiro de testes.

---

## Bloco 2: Funcionalidades do Modo Equipe

- [x] **2.1** [AGENTE] [10/11/2026] Fluxo de autenticação: login com JWT, persistência com AsyncStorage, cabeçalho `Authorization: Bearer <token>` e revalidação foreground em `AppState`.
- [ ] **2.2** [DONO] [10/11/2026] Execução da suíte E2E automatizada contra o backend de produção/homologação com credenciais reais (fora do alcance do agente em sandbox).
- [x] **2.3** [AGENTE] [10/11/2026] Cadastro conjunto de aluno com matrícula obrigatória (`POST /v1/alunos` enviando `id_plano` e `data_inicio` opcional), validação de plano selecionado, tratamento de erros 400, 404, 409 e recarga de dados.
- [x] **2.4** [AGENTE] [10/11/2026] Gestão de matrículas agrupadas por aluno (1 cartão por aluno exibindo matrícula atual e botão expansível `"Histórico (n)"`).
- [x] **2.5** [AGENTE] [10/11/2026] Regra de elegibilidade para renovação: renovação permitida apenas para alunos ativos com status `vencida`, `inativa` ou `sem_matricula`.
- [x] **2.6** [AGENTE] [10/11/2026] Tela de detalhe do aluno (`TelaDetalheAluno`): ações de contato `"Ligar"` e `"WhatsApp"` com funções puras `telefoneParaLigacao` e `urlWhatsApp`, exibição de `"Vence em"` ou `"Venceu em"`, e histórico somente leitura.
- [x] **2.7** [AGENTE] [10/11/2026] Gestão de planos (`TelaPlanos`) e usuários colaboradores (`TelaUsuarios`) com controle de permissões por perfil (Administrador e Recepção).
- [x] **2.8** [AGENTE] [10/11/2026] Tela Início (`TelaInicio`): remoção do bloco estático `"O que oferecemos"`, exibição do nome da marca uma única vez, contadores dinâmicos via API, ações rápidas permitidas e faixa dinâmica de planos (A6).
- [x] **2.9** [AGENTE] [10/11/2026] Literais de estado com união discriminada estrita: `tipo: 'carregando' | 'erro' | 'pronto'`.
- [x] **2.10** [AGENTE] [10/11/2026] Sincronização e verificação das skills canônicas (`dominio-academia`, `contrato-api-v1`, `modos-e-arquitetura-mobile`, `identidade-visual-misterfit`, `conferencia-guia-curso`, `fluxo-e-seguranca`) via scripts `npm run skills:sincronizar` e `npm run skills:verificar`.
- [x] **2.11** [AGENTE] [10/11/2026] Documentação e roteiro: acréscimo de novos casos C46 (cadastro conjunto), C47 (renovação agrupada) e C48 (confirmação modal e status inline) em `docs/roteiro_de_teste.md`, atualização de `docs/DECISOES.md` (Seção 21) e `docs/INTEGRACAO_API.md`.
- [x] **2.12** [AGENTE] [10/11/2026] Inativação e reativação de matrícula com `ConfirmacaoModal`, exibição de erro 409 inline em banner e recarga conjunta de matrículas e alunos (A7).
- [x] **2.13** [AGENTE] [10/11/2026] Correção de pesos de fontes (`pesos` numéricos e nomeados) e paleta completa (`yellow` 100-900) eliminando TypeErrors (A1).
- [x] **2.14** [AGENTE] [10/11/2026] Ajuste da barra de navegação inferior com `useSafeAreaInsets` evitando corte de rótulos em 440 px ou barras de gestos (A5).
- [x] **2.15** [AGENTE] [10/11/2026] Filtro de erro 401 no login com mensagem `"Usuário ou senha incorretos."` fora do histórico de erros da Conta (A3).
- [x] **2.16** [AGENTE] [10/11/2026] Eliminação da propriedade obsoleta `pointerEvents` em favor de `style.pointerEvents` (A4).

---

## Bloco 3: Identidade Visual e Experiência do Usuário

- [x] **3.1** [AGENTE] [10/11/2026] Tokens de tema centralizados em `src/tema/tema.ts` alinhados ao desktop MisterFit (fundo `#121214`, cartao `#1e1e22`, borda `#27272a`, primaria `#ff5b24`).
- [x] **3.2** [AGENTE] [10/11/2026] Adoção do laranja institucional `#ff5b24` nos botões primários, foco de campos, aba ativa e links.
- [x] **3.3** [AGENTE] [10/11/2026] Selos de status padronizados: Ativo/Ativa em verde, Vencido/Vencida em vermelho, Inativo/Sem plano em cinza, Arquivado esmaecido a 45%; Administrador em laranja e Recepção em ciano.
- [x] **3.4** [AGENTE] [10/11/2026] Cartões e cabeçalhos seguindo o padrão escuro com raio de 12px e padding consistente.
- [x] **3.5** [AGENTE] [10/11/2026] Tela Início com visual limpo e marca destacada no cabeçalho.
- [x] **3.6** [AGENTE] [10/11/2026] Testes unitários dos tokens de tema e funções de estilo.
- [ ] **3.7** [DONO] [10/11/2026] Validação de design review em dispositivos físicos de tamanhos diversos (fora do alcance do agente).

---

## Bloco 4: Testes em Dispositivos Físicos

- [ ] **4.1** [DONO] [10/11/2026] Teste manual em aparelho físico Android (instalação APK, biometria/touch, rotação e teclado).
- [ ] **4.2** [DONO] [10/11/2026] Teste manual em aparelho físico iPhone/iOS (SafeArea superior e inferior com Dynamic Island / Home Indicator).
- [ ] **4.3** [DONO] [10/11/2026] Teste de conectividade móvel real com transição entre 4G/5G, Wi-Fi e modo avião.

---

## Bloco 5: Publicação e EAS Build

- [ ] **5.1** [DONO] [10/11/2026] Configuração de credenciais de produção no Expo Application Services (EAS CLI / Expo Dashboard).
- [ ] **5.2** [DONO] [10/11/2026] Disparo de build de produção (`eas build --platform all --profile production`).
- [ ] **5.3** [DONO] [10/11/2026] Submissão para as lojas Google Play Store e Apple App Store.

---

## Bloco 6: Conferência Final e Qualidade do Código

- [x] **6.1** [AGENTE] [10/11/2026] `npm run typecheck` executado com 0 erros.
- [x] **6.2** [AGENTE] [10/11/2026] `npm run test:unit` executado com 86 testes aprovados em 24 suítes.
- [x] **6.3** [AGENTE] [10/11/2026] Auditoria de `any`: `git grep -nw any -- "*.ts" "*.tsx"` com 0 ocorrências.
- [x] **6.4** [AGENTE] [10/11/2026] Auditoria de literais de estado: uso exclusivo de `carregando`, `erro` e `pronto`.
- [x] **6.5** [AGENTE] [10/11/2026] Auditoria de segurança: sem segredos nos arquivos (`sb_secret_`, `service_role`).
- [x] **6.6** [AGENTE] [10/11/2026] Skills sincronizadas e validadas (`npm run skills:verificar`).
- [x] **6.7** [AGENTE] [10/11/2026] `git status -sb` limpo e commits atômicos em português.
