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
| **Dispositivo Físico (Expo Go)** | `http://<IP_DA_SUA_MAQUINA>:3333` (dispositivo e computador na mesma rede Wi-Fi) |
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

### Checagem de tipos estrita (TypeScript):
```bash
npm run typecheck
```

### Execução de testes unitários:
```bash
npm run test:unit
```
*(ou simplesmente `npm test`)*

### Iniciar o aplicativo Expo:
```bash
npm start
```
- Pressione `a` para abrir no Android.
- Pressione `w` para abrir no navegador web.
- Pressione `i` para abrir no simulador iOS.

### Compilação do APK de pré-visualização (EAS Build):
```bash
npx eas build --profile preview --platform android
```
*(Consulte `eas.json` e registre o projeto com o pacote definitivo em `app.json` antes de gerar)*

---

## 4. Estrutura do Código e Arquitetura

O projeto adota uma arquitetura em camadas com separação clara de responsabilidades:

- `src/types/`: Entidades de domínio tipadas e definição da união discriminada `EstadoTela<T>` (`'carregando' | 'erro' | 'sucesso'`) com verificação exaustiva (`semCaso`).
- `src/api/`: Cliente HTTP `fetch` com timeout, injeção de token Bearer, conversão de DTOs e funções por recurso (`auth`, `alunos`, `planos`, `matriculas`).
- `src/dados/`: Camada de desacoplamento contendo a interface `FonteDados`, a implementação única `FonteApi` e o contexto global `DadosContext` (`useDados`). Nenhuma tela consome a rede diretamente.
- `src/auth/`: Gerenciamento de sessão com `expo-secure-store` (com fallback de memória na web), contexto `SessaoContext` e controle de permissões por ação (`podeFazer`).
- `src/erros/`: Módulo centralizado de classificação de erros (`classificarErro`), sanitização de dados sensíveis (`sanitizar`) e buffer em memória dos últimos 50 eventos (`registrarErro`).
- `src/utils/`: Formatadores de datas sem desvio de fuso horário (`formatarDataBR`), telefone com máscara, moeda BRL e responsividade de colunas (`colunasPara`).
- `src/components/`: Componentes reutilizáveis com suporte a acessibilidade e estados visuais:
  - `Campo`: Input com estados normal, foco, desabilitado e erro por campo.
  - `Carregando`, `EstadoErro`, `EstadoVazio`, `Selo`.
  - `AlunoCard`, `AlunoForm`.
- `src/telas/`: Telas completas do sistema:
  - `TelaLogin`: Autenticação segura sem vazamento de dados.
  - `TelaAlunos`: Listagem em grade responsiva, busca instantânea e ações autorizadas.
  - `TelaDetalheAluno`: Dados detalhados do aluno e histórico de matrículas vinculadas.
  - `TelaPlanos`: Catálogo de mensalidades com destaque visual e recursos inclusos.
  - `TelaMatriculas`: Gestão de matrículas com cálculo de vigência efetuado pela API.
  - `TelaConta`: Identificação do usuário logado, permissões ativas e troca de senha.
  - `TelaSobre`: Informações de versão (`expo-constants`), host da API e histórico de erros.
- `src/navegacao/`: Navegação tipada via React Navigation 7 (`NativeStack` + `BottomTabs`).

---

## 5. Como Executar o Roteiro de Testes Manuais

O roteiro oficial com 21 casos de ensaio está documentado em [`docs/roteiro_de_teste.md`](docs/roteiro_de_teste.md).

1. Inicie o servidor da API backend v1.
2. Inicie o aplicativo Expo no emulador ou dispositivo físico (`npm start`).
3. Para cada caso de teste listado (CT01 a CT21):
   - Prepare a pré-condição descrita.
   - Execute os passos no aplicativo.
   - Compare o comportamento observado com o "Resultado Esperado".
   - Anote o resultado na coluna "Resultado Obtido" e classifique como `OK` ou `FALHA`.
