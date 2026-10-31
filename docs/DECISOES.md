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
