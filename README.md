# Academia MisterFit — Aplicativo Mobile

Aplicativo móvel (Expo / React Native + TypeScript) da **Academia MisterFit**, desenvolvido para uso da equipe interna (**administração** e **recepção**) e para os exercícios acadêmicos da UC8.

---

## Configuração

O aplicativo opera em dois modos distintos, configurados através de variáveis de ambiente em `.env.local` (ou `.env`).

Copie o arquivo de exemplo para iniciar:
```bash
cp .env.example .env.local
```

### 1. Modos de Execução (`EXPO_PUBLIC_MODO`)

- **Modo Equipe (`EXPO_PUBLIC_MODO=equipe` - padrão):**
  Integração completa com a API REST unificada v1 (`EXPO_PUBLIC_API_URL`). Exige autenticação de login da equipe (perfis `admin` e `recepcao`), respeita controle de permissões e regras de negócio no backend, sem armazenamento de dados pessoais de alunos no aparelho.

- **Modo Curso (`EXPO_PUBLIC_MODO=curso`):**
  Exercício prático com Supabase direto por `fetch` com cabeçalho `apikey`, sem tela de login, com persistência local em SQLite (`expo-sqlite`), cache offline e fila de sincronização de pendentes, focado exclusivamente na entidade **Planos de Treino**.

---

### 2. Configuração do Projeto de EXERCÍCIO no Supabase (Modo Curso)

> [!CAUTION]
> **AVISO IMPORTANTE:** NUNCA utilize as credenciais ou a URL do projeto de produção aqui! O projeto de produção é acessado exclusivamente pelo backend da API v1. O aplicativo móvel no modo curso conecta-se SOMENTE a um projeto separado de EXERCÍCIO contendo dados fictícios.

Passo a passo para configurar o projeto de exercício no Supabase:
1. Acesse [https://supabase.com](https://supabase.com) e crie um novo projeto com o nome `uc8-projeto-mobile-exercicio`.
2. Defina a senha do banco de dados (guarde-a; ela nunca vai para o código nem para o repositório).
3. Na seção Security, certifique-se de que **Enable automatic RLS** esteja marcada.
4. No painel do projeto, abra o **SQL Editor**, cole integralmente o conteúdo do arquivo [`supabase/esquema.sql`](file:///home/amisterdan/Dev/uc8-projeto-mobile/supabase/esquema.sql) e clique em **Run**.
5. Em **Project Settings** > **API**, copie a **Project URL** e a chave pública **anon public** (`sb_publishable_...`).
6. Configure no seu `.env.local`:
   ```bash
   EXPO_PUBLIC_MODO=curso
   EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_SUA-CHAVE
   ```

---

### 3. Variáveis de Ambiente no Modo Equipe

Quando `EXPO_PUBLIC_MODO=equipe`, o aplicativo conecta-se à API v1:

| Ambiente | Configuração recomendada de `EXPO_PUBLIC_API_URL` |
|---|---|
| **Emulador Android** | `http://10.0.2.2:3333` |
| **Simulador iOS** | `http://localhost:3333` |
| **Dispositivo Físico (Expo Go)** | `http://<IP_DA_SUA_MAQUINA>:3333` |
| **Navegador Web** | `http://localhost:3333` |
| **Produção** | `https://api.misterfit.com.br` |

---

## Perfis de Teste da API (Modo Equipe)

| Perfil | Login | Permissões | Capacidades no App |
|---|---|---|---|
| **Administrador** | `admin` | `['*']` | Acesso total: listar, cadastrar, editar, arquivar e excluir alunos; listar planos; gerenciar matrículas. |
| **Recepção** | `recepcao` | Leituras e cadastros básicos | Operações de rotina: lista/cadastra alunos e matrículas. Botões de exclusão e arquivamento são ocultados automaticamente. |

---

## Comandos do Projeto

```bash
# Instalação de dependências
npm install

# Checagem estrita de tipos TypeScript
npm run typecheck

# Execução de testes unitários automatizados
npm run test:unit

# Iniciar o servidor Metro do Expo
npm start
```

---

## Build do APK com EAS (Passo a Passo)

O serviço de compilação na nuvem da Expo (**EAS Build**) constrói o instalável Android (`APK`) a partir do repositório Git.

Como o arquivo `.env.local` é ignorado pelo Git (conforme definido no `.gitignore`), a nuvem do EAS não lê as variáveis locais da sua máquina. Para que o build conheça a configuração do projeto de exercício, há duas opções documentadas:

1. **Variáveis de Ambiente no Painel da Expo (Recomendado):**
   - Acesse o painel do seu projeto em [https://expo.dev](https://expo.dev).
   - Navegue até **Environment variables** e crie as variáveis para o ambiente `preview`:
     - `EXPO_PUBLIC_MODO`: `curso`
     - `EXPO_PUBLIC_SUPABASE_URL`: `https://SEU-PROJETO.supabase.co`
     - `EXPO_PUBLIC_SUPABASE_KEY`: `sb_publishable_SUA-CHAVE`
   - Como a chave do projeto de exercício é pública (anon), não há segredos envolvidos.

2. **Campo `env` dentro do `eas.json`:**
   - Alternativamente, pode-se declarar o bloco `"env"` diretamente no perfil `preview` de `eas.json` com os valores públicos do projeto de exercício.

Para disparar a compilação do APK de teste na nuvem:
```bash
npx eas-cli@latest build -p android --profile preview
```
*(Consulte `eas.json` com perfil preview `"buildType": "apk"` e confirme o identificador `android.package` em `app.json` antes de rodar)*
