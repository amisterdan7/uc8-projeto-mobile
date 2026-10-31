# Academia MisterFit — Aplicativo Mobile

Aplicativo móvel (Expo / React Native + TypeScript) da **Academia MisterFit**, desenvolvido para uso exclusivo da equipe interna (**administração** e **recepção**).

O aplicativo consome a API REST unificada sob o prefixo `/v1`. Toda a lógica de negócio (cálculo de datas de vencimento, derivação de status de matrícula e regras de permissão) reside no backend.

---

## 1. Configuração do Ambiente

O aplicativo lê a URL base da API a partir da variável de ambiente `EXPO_PUBLIC_API_URL`.

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Defina o valor de `EXPO_PUBLIC_API_URL` no `.env` de acordo com o ambiente de execução:

| Ambiente | Configuração recomendada |
|---|---|
| **Emulador Android** | `http://10.0.2.2:3333` |
| **Simulador iOS** | `http://localhost:3333` |
| **Dispositivo Físico (Expo Go)** | `http://<IP_DA_SUA_MAQUINA>:3333` (dispositivo e PC na mesma rede Wi-Fi) |
| **Navegador Web** | `http://localhost:3333` |
| **Produção** | `https://api.misterfit.com.br` (exige HTTPS obrigatório) |

> **Atenção:** Em produção, a API requer conexão segura HTTPS. Nunca exponha senhas ou tokens em repositórios ou logs.

---

## 2. Perfis de Teste da API

O login de equipe utiliza um nome de usuário (não e-mail).

| Perfil | Permissões | Capacidades no App |
|---|---|---|
| **admin** | `['*']` | Acesso total: listar, criar, editar, desativar/arquivar e excluir alunos; listar planos; listar, criar, inativar e excluir matrículas. |
| **recepcao** | `['alunos:listar', 'alunos:criar', 'alunos:atualizar', 'planos:listar', 'matriculas:listar', 'matriculas:criar']` | Operações diárias: lista e cadastra alunos/matrículas, edita dados cadastrais. Não possui permissão para desativar, excluir ou inativar registros (botões ocultos automaticamente). |

---

## 3. Comandos do Projeto

### Instalação de dependências:
```bash
npm install
```

### Checagem de tipos (TypeScript):
```bash
npm run typecheck
```

### Execução de testes unitários:
```bash
npm test
```

### Iniciar o aplicativo Expo:
```bash
npm start
```
- Pressione `a` para abrir no Android.
- Pressione `w` para abrir no navegador web.
- Pressione `i` para abrir no simulador iOS.

---

## 4. Arquitetura do App

- `src/api/`: Cliente HTTP com timeout, tratamento de erros amigáveis (`ErroApi`), DTOs e funções por recurso (`auth`, `alunos`, `planos`, `matriculas`).
- `src/auth/`: Gerenciamento de sessão com `expo-secure-store` (com fallback de memória na web), contexto `SessaoContext` e controle de permissões por ação (`podeFazer`).
- `src/utils/`: Formatadores e máscaras para datas (sem problemas de fuso horário), telefones e moeda BRL.
- `src/components/`: Componentes de estado (`Carregando`, `EstadoErro`, `EstadoVazio`, `Selo`).
- `src/telas/`: Telas principais (`TelaLogin`, `TelaAlunos`, `TelaPlanos`, `TelaMatriculas`, `TelaConta`).
- `src/navegacao/`: Navegação tipada via React Navigation 7.
