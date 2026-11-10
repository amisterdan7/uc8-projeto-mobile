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
- [~] **2.8** [AGENTE/DONO] [10/11/2026] Tela Início (`TelaInicio`): grade responsiva em `"Nossos planos"` com `colunasPara(width)` (1 coluna abaixo de 600 px empilhando os planos com nome, preço e duração; múltiplas colunas em telas maiores), remoção do bloco `"O que oferecemos"` e marca única no cabeçalho (A1, A2). Evidência em código: `src/telas/TelaInicio.tsx:160-200` e `git grep -n "oferecemos" -- src` (vazio). Pendente print em 440 px pelo dono (`NÃO VERIFICADO` no navegador).
- [x] **2.9** [AGENTE] [10/11/2026] Literais de estado com união discriminada estrita: `tipo: 'carregando' | 'erro' | 'pronto'`.
- [x] **2.10** [AGENTE] [10/11/2026] Sincronização e verificação das skills canônicas (`dominio-academia`, `contrato-api-v1`, `modos-e-arquitetura-mobile`, `identidade-visual-misterfit`, `conferencia-guia-curso`, `fluxo-e-seguranca`) via scripts `npm run skills:sincronizar` e `npm run skills:verificar`.
- [x] **2.11** [AGENTE] [10/11/2026] Documentação e roteiro: atualização de `docs/DECISOES.md`, `docs/roteiro_de_teste.md` (casos C46 a C52 como `"não executado"`) e `docs/INTEGRACAO_API.md` (G1, G2).
- [~] **2.12** [AGENTE/DONO] [10/11/2026] Encerrar matrícula e Excluir matrícula restritos ao detalhe do aluno (`TelaDetalheAluno`) para administrador com `ConfirmacaoModal` e função pura `mostraAcoesMatricula(perfil, status)`; botões `"Inativar"`, `"Reativar"` e `"Excluir"` retirados de `TelaMatriculas` para todos os perfis (D1 a D5). Evidência: `git grep -n "Inativar\|Reativar\|Excluir" -- src/telas/TelaMatriculas*` (vazio), `src/telas/TelaDetalheAluno.tsx:218-246`, `src/utils/matriculas.ts:104-121` e `tests/utils.test.ts` (87 testes passando). Pendente teste visual no navegador pelo dono (`NÃO VERIFICADO` em tela).
- [x] **2.13** [AGENTE] [10/11/2026] Tabela de pesos de fonte (`pesosFonte` / `pesos` 300 a 800) definida e exportada em `src/tema/tema.ts` e migração de referências de cores nas telas para `cores.*` (F1). Evidência: `git grep -n "'400'\|'300'\|\[400\]\|\[300\]" -- src` aponta exclusivamente para `src/tema/tema.ts:66-72`.
- [~] **2.14** [AGENTE/DONO] [10/11/2026] Barra inferior (`src/navegacao/index.tsx`) com `tabBarLabelPosition: 'below-icon'`, `espacoInferior = Math.max(insets.bottom, 10)` e `alturaBarra = 68 + espacoInferior` para exibir os 5 rótulos inteiros (`Início`, `Alunos`, `Planos`, `Matrículas`, `Conta`) em 440 px (B1). Evidência em código: `src/navegacao/index.tsx:66-102`. Pendente print em 440 px pelo dono (`NÃO VERIFICADO` no navegador).
- [~] **2.15** [AGENTE/DONO] [10/11/2026] Erro 401 de login tratado apenas no formulário (`"Usuário ou senha incorretos."`) e filtrado de `"Eventos de erro recentes"` na aba Conta via `deveRegistrarNoHistorico` (F4). Evidência: `src/erros/erros.ts:190-219` e teste unitário em `tests/erros.test.ts`. Pendente verificação visual no navegador pelo dono (`NÃO VERIFICADO` em tela).
- [x] **2.16** [AGENTE] [10/11/2026] Eliminação de propriedade obsoleta `pointerEvents` e tratamento de promessas em sessão, carga e refresh com `registrarErro` (F2, F3). Evidência: `git grep -n "pointerEvents" -- src` (vazio) e `src/auth/SessaoContext.tsx`, `src/contexto/AcademiaContexto.tsx`.
- [~] **2.17** [AGENTE/DONO] [10/11/2026] Foco laranja (`#ff5b24`) do tema aplicado em campos (`Campo`), abas e elementos interativos na Web sem anel amarelo do navegador, e modal `"Nova matrícula"` simplificado quando não há alunos elegíveis (C1, E1, E2). Evidência: `src/tema/tema.ts:29,88`, `App.tsx:46-57`, `src/telas/TelaMatriculas.tsx:249-286` e `git grep -nEi "#[0-9a-f]{6}|rgba?\(" -- src/telas src/components` (vazio). Pendente print de foco e modal no navegador pelo dono (`NÃO VERIFICADO` em tela).

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
- [x] **6.2** [AGENTE] [10/11/2026] `npm run test:unit` executado com 87 testes aprovados em 24 suítes.
- [x] **6.3** [AGENTE] [10/11/2026] Auditoria de `any`: `git grep -nw any -- "*.ts" "*.tsx"` com 0 ocorrências.
- [x] **6.4** [AGENTE] [10/11/2026] Auditoria de literais de estado: uso exclusivo de `carregando`, `erro` e `pronto`.
- [x] **6.5** [AGENTE] [10/11/2026] Auditoria de segurança: sem segredos nos arquivos (`sb_secret_`, `service_role`).
- [x] **6.6** [AGENTE] [10/11/2026] Skills sincronizadas e validadas (`npm run skills:verificar`).
- [x] **6.7** [AGENTE] [10/11/2026] `git status -sb` limpo e commits atômicos em português.
