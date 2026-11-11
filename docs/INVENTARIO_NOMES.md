# Inventário de Nomes: Desacoplamento e Padronização de Nomenclatura

Data: 11/11/2026  
Status do Inventário: **Para Revisão e Aprovação**  
Repositório: `uc8-projeto-mobile`

---

## 1. Visão Geral

Este documento inventaria todas as ocorrências dos termos `curso` e `equipe` no código-fonte (`src/`, `App.tsx`, `tests/`), categorizando cada símbolo ou arquivo entre:
- **APROVADO**: Itens candidatos à renomeação imediata sem alteração de comportamento, tipos ou lógica;
- **RECUSADO**: Itens que devem permanecer inalterados por fazerem parte do contrato de arquitetura (`EXPO_PUBLIC_MODO`), textos da interface do usuário (UI), isolamento de pastas ou termos da língua portuguesa (ex: `recurso`);
- **PENDENTE**: Itens sob análise para confirmação antes de qualquer renomeação.

---

## 2. Inventário de Arquivos e Pastas

| ID | Tipo | Nome Atual | Nome Proposto | Status | Justificativa |
|:---|:---|:---|:---|:---:|:---|
| **ARQ-01** | Arquivo | `src/navegacao/NavegadorCurso.tsx` | `src/navegacao/NavegadorPlanos.tsx` | **APROVADO** | Navegador das abas de planos no modo de demonstração/Supabase. |
| **ARQ-02** | Arquivo | `src/navegacao/tiposCurso.ts` | `src/navegacao/tiposPlanos.ts` | **APROVADO** | Tipagem de parâmetros das rotas da pilha de planos. |
| **ARQ-03** | Arquivo | `src/telas/curso/CartaoPlanoCurso.tsx` | `src/telas/curso/CartaoPlano.tsx` | **APROVADO** | Componente de cartão visual do plano, eliminando o sufixo redundante `Curso`. |
| **ARQ-04** | Arquivo | `src/telas/curso/TelaSobreCurso.tsx` | `src/telas/curso/TelaSobrePlanos.tsx` | **APROVADO** | Tela "Sobre" do modo planos, evitando confusão com a antiga `TelaSobre`. |
| **ARQ-05** | Arquivo | `tests/modoCurso.test.ts` | `tests/modoPlanos.test.ts` | **APROVADO** | Suíte de testes unitários do serviço Supabase e banco local SQLite. |
| **DIR-01** | Diretório | `src/telas/curso/` | `src/telas/curso/` | **RECUSADO** | Manter a pasta `src/telas/curso/` intacta para preservar o isolamento explícito do modo do exercício do curso frente ao modo equipe. |

---

## 3. Inventário de Tipos e Interfaces

| ID | Nome Atual | Nome Proposto | Arquivo de Origem / Consumidores | Status | Justificativa |
|:---|:---|:---|:---|:---:|:---|
| **TIP-01** | `PlanoCurso` | `PlanoAcademia` | `src/servicos/planosSupabase.ts`, `src/banco/banco.ts`, `src/contexto/PlanosContexto.tsx`, `src/servicos/planosSincronizacao.ts`, `src/telas/curso/CartaoPlanoCurso.tsx` | **APROVADO** | Representa o plano da academia no modo Supabase/SQLite. Não altera campos nem estrutura. |
| **TIP-02** | `DadosNovoPlanoCurso` | `DadosNovoPlano` | `src/servicos/planosSupabase.ts`, `src/banco/banco.ts`, `src/contexto/PlanosContexto.tsx`, `src/servicos/planosSincronizacao.ts` | **APROVADO** | Dados de entrada para inclusão de planos locais e remotos. |
| **TIP-03** | `RotasPilhaPlanosCurso` | `RotasPilhaPlanos` | `src/navegacao/tiposCurso.ts`, `src/navegacao/NavegadorCurso.tsx`, `src/telas/curso/*` | **APROVADO** | Tipagem do stack navigator de planos. |
| **TIP-04** | `AbasCursoParamList` | `AbasPlanosParamList` | `src/navegacao/tiposCurso.ts`, `src/navegacao/NavegadorCurso.tsx`, `src/telas/curso/TelaBuscaPlanos.tsx` | **APROVADO** | Tipagem das abas de navegação de planos. |
| **TIP-05** | `NavegacaoAbasCursoProp` | `NavegacaoAbasPlanosProp` | `src/navegacao/tiposCurso.ts`, `src/telas/curso/TelaBuscaPlanos.tsx` | **APROVADO** | Tipagem de navegação composta para telas das abas. |
| **TIP-06** | `CartaoPlanoCursoProps` | `CartaoPlanoProps` | `src/telas/curso/CartaoPlanoCurso.tsx` | **APROVADO** | Propriedades do cartão do plano. |
| **TIP-07** | `ModoApp = 'equipe' \| 'curso'` | `ModoApp = 'equipe' \| 'curso'` | `src/config/modo.ts` | **RECUSADO** | Valor discriminador de modo em runtime (`EXPO_PUBLIC_MODO`). Obrigatório pelas regras inegociáveis. |

---

## 4. Inventário de Componentes e Telas

| ID | Nome Atual | Nome Proposto | Arquivo de Origem / Consumidores | Status | Justificativa |
|:---|:---|:---|:---|:---:|:---|
| **CMP-01** | `NavegadorCurso` | `NavegadorPlanos` | `src/navegacao/NavegadorCurso.tsx`, `App.tsx` | **APROVADO** | Componente do navegador do modo planos. |
| **CMP-02** | `CartaoPlanoCurso` | `CartaoPlano` | `src/telas/curso/CartaoPlanoCurso.tsx`, `TelaBuscaPlanos.tsx`, `TelaListaPlanos.tsx` | **APROVADO** | Componente visual do cartão de planos. |
| **CMP-03** | `TelaSobreCurso` | `TelaSobrePlanos` | `src/telas/curso/TelaSobreCurso.tsx`, `NavegadorCurso.tsx` | **APROVADO** | Componente da tela "Sobre" do modo planos. |

---

## 5. Inventário de Testes e Descrições

| ID | Nome Atual | Nome Proposto | Arquivo | Status | Justificativa |
|:---|:---|:---|:---|:---:|:---|
| **TST-01** | `describe('Modo Curso - Funções Puras...')` | `describe('Modo Planos (Supabase/SQLite) - Funções Puras...')` | `tests/modoCurso.test.ts` | **APROVADO** | Título descritivo da suíte no relatório de testes. |

---

## 6. Exceções Mantidas (Strings de UI, Acessibilidade e Estilos)

Os itens abaixo foram explicitamente **RECUSADOS** para alteração, pois correspondem à experiência do usuário, mensagens da interface ou chaves essenciais:

| ID | Trecho de Código / Texto | Arquivo | Status | Motivo da Manutenção |
|:---|:---|:---|:---:|:---|
| **EXC-01** | `if (modo === 'curso')` | `App.tsx:56` | **RECUSADO** | Comparação da variável de ambiente `EXPO_PUBLIC_MODO`. |
| **EXC-02** | `"Crie o arquivo .env.local a partir de .env.example e defina o endereço da API v1 para executar o aplicativo no Modo Equipe."` | `App.tsx:81` | **RECUSADO** | Instrução de configuração exibida na tela quando falta a URL da API. |
| **EXC-03** | `<Text style={styles.tituloSecao}>Equipe</Text>` | `src/telas/TelaConta.tsx:327` | **RECUSADO** | Seção da tela Conta para gerenciar colaboradores da academia. |
| **EXC-04** | `accessibilityLabel="Gerenciar usuários da equipe"` | `src/telas/TelaConta.tsx:336` | **RECUSADO** | Rótulo de acessibilidade (TalkBack / VoiceOver). |
| **EXC-05** | `<Text style={styles.textoBotaoEquipe}>Gerenciar usuários da equipe</Text>` | `src/telas/TelaConta.tsx:344` | **RECUSADO** | Texto do botão de navegação para administradores. |
| **EXC-06** | `styles.botaoAbrirEquipe`, `esquerdaBotaoEquipe`, `textoBotaoEquipe` | `src/telas/TelaConta.tsx:590,602,607` | **RECUSADO** | Nomes de estilos CSS-in-JS internos da seção Equipe. |
| **EXC-07** | `"Acesso da Equipe (Admin e Recepção)"` | `src/telas/TelaLogin.tsx:93` | **RECUSADO** | Subtítulo institucional da tela de login. |
| **EXC-08** | `<Text style={estilosComuns.tituloCabecalho}>Equipe e Usuários</Text>` | `src/telas/TelaUsuarios.tsx:239, 279` | **RECUSADO** | Cabeçalho da tela de gestão de usuários colaboradores. |
| **EXC-09** | `<Text style={estilosComuns.tituloCartao}>Novo Usuário da Equipe</Text>` | `src/telas/TelaUsuarios.tsx:398` | **RECUSADO** | Título do formulário de criação de colaborador. |
| **EXC-10** | `"Academia MisterFit - Modo Curso"` | `src/telas/curso/TelaSobreCurso.tsx:42` | **RECUSADO** | Título institucional do modo de estudo/demonstração. |
| **EXC-11** | `"Modo: Curso (Supabase direto + SQLite)"` | `src/telas/curso/TelaSobreCurso.tsx:49` | **RECUSADO** | Descrição técnica exibida na tela de diagnóstico do modo curso. |
| **EXC-12** | `"Cria um novo usuario de equipe (admin ou recepcao)..."` | `src/api/usuarios.ts:22` | **RECUSADO** | Docstring explicativa de regra de negócio da rota de API. |

---

## 7. Falsos Positivos Identificados (Substrings da Língua Portuguesa)

| Termo | Ocorrências | Arquivos | Status | Motivo |
|:---|:---|:---|:---:|:---|
| `recurso` / `recursos` | `RecursoPlano`, `RecursoPlanoDTO`, `recursos: RecursoPlano[]`, `linhaRecurso`, `novoRecursoTexto`, `Recurso não encontrado.` | `src/api/tipos.ts`, `src/types/entidades.ts`, `src/api/cliente.ts`, `src/api/mapeadores.ts`, `src/telas/TelaPlanos.tsx`, `tests/mapeadores.test.ts` | **RECUSADO** | Ocorrência da substring "curso" dentro da palavra legítima "recurso" (benefícios inclusos nos planos da academia). Faz parte do domínio de negócio e do contrato da API v1. |

---

## 8. Resumo Quantitativo

- **Total de Itens Aprovados:** 15 (5 arquivos, 6 tipos/interfaces, 3 componentes, 1 descrição de teste)
- **Total de Itens Recusados (Mantidos):** 14 (1 diretório, 1 tipo discriminador, 12 strings/estilos de UI legítimos) + falsos positivos de `recurso`.
- **Total de Itens Pendentes:** 0
