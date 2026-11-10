# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# Instruções para Agentes de IA - Academia MisterFit (Mobile)

Este repositório contém o aplicativo mobile da **Academia MisterFit** (Expo SDK 57 / React Native / TypeScript).

## 1. Fonte Canônica de Conhecimento (Skills)

Antes de planejar ou alterar qualquer arquivo, consulte as skills canônicas em `.agents/skills/`:

1. [`.agents/skills/dominio-academia/SKILL.md`](.agents/skills/dominio-academia/SKILL.md) — Regras de negócio (alunos, planos, matrículas, cadastro conjunto com plano obrigatório, elegibilidade para renovação, permissões e soberania da API).
2. [`.agents/skills/contrato-api-v1/SKILL.md`](.agents/skills/contrato-api-v1/SKILL.md) — Contrato da API v1 (`POST /v1/alunos` com `id_plano` e `data_inicio` opcionais, `PUT /v1/usuarios/:id/senha`, `usuarios:alterar-ativo`, códigos HTTP e mapeadores).
3. [`.agents/skills/modos-e-arquitetura-mobile/SKILL.md`](.agents/skills/modos-e-arquitetura-mobile/SKILL.md) — Arquitetura em dois modos (`EXPO_PUBLIC_MODO=equipe` com 5 abas `Início`, `Alunos`, `Planos`, `Matrículas`, `Conta` e `Usuarios` no stack; `EXPO_PUBLIC_MODO=curso` com Supabase, SQLite e fila).
4. [`.agents/skills/identidade-visual-misterfit/SKILL.md`](.agents/skills/identidade-visual-misterfit/SKILL.md) — Tema escuro, paleta, selos de status, componentes e textos em português.
5. [`.agents/skills/conferencia-guia-curso/SKILL.md`](.agents/skills/conferencia-guia-curso/SKILL.md) — Comandos de auditoria e conferência dos módulos 5 a 9 do curso.
6. [`.agents/skills/fluxo-e-seguranca/SKILL.md`](.agents/skills/fluxo-e-seguranca/SKILL.md) — Regras de segurança, git, segredos e formato de relatório final.

## 2. Regras Inegociáveis

- **Proibido `any`:** A palavra `any` não pode aparecer em nenhum arquivo `.ts` ou `.tsx` (nem mesmo em comentários).
- **Literais de Estado:** O estado de tela usa exclusivamente `tipo: 'carregando' | 'erro' | 'pronto'`.
- **Soberania da API:** O app mobile nunca recalcula data de fim de matrícula nem status (`ativa`, `vencida`, `inativa`, `sem_matricula`); exibe o que a API devolve.
- **Modo Equipe (5 Abas):** `Início` (`TelaInicio`), `Alunos` (`TelaAlunos`), `Planos` (`TelaPlanos`), `Matrículas` (`TelaMatriculas`) e `Conta` (`TelaConta`, que reúne `Minha conta`, `Equipe` -> abre `TelaUsuarios` no stack para quem tem `usuarios:listar`, e `Sobre o app`).
- **Modo Curso Intocado em Tarefas de Equipe:** Não altere `src/servicos/acervo.ts`, `src/servicos/planosSupabase.ts` nem as telas `*Planos` do modo curso quando a tarefa for do modo equipe.
- **Segurança:** Nunca abra `.env` ou `.env.local`, nunca exponha chaves, tokens ou dados pessoais em logs, e nunca execute `git push` sem pedido explícito.
- **Sincronização de Skills:** Ao editar `.agents/skills/`, execute `npm run skills:sincronizar` para espelhar em `.claude/skills/`.
