# Registro de Decisões de Arquitetura e Implementação (Mobile)

Este documento registra as decisões técnicas tomadas durante a integração do aplicativo mobile da Academia MisterFit com a API unificada v1.

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
