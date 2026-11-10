# Comandos de conferência (atalho)

Os comandos **exatos** ficam em `docs/guia_modulo_txt/modulo_N/guia_conferencia_do_modulo_NN.txt`. Este arquivo é um atalho; **se divergir do guia, vale o guia**. Troque os nomes de exemplo (Acervo, livros) pelos nossos (Academia, Planos). Todos são de leitura. Rode na raiz do projeto, no Git Bash. Não imprima e-mails de commit.

## Módulo 5 (estilo e componentes)
Veja `modulo_5/guia_conferencia_do_modulo_05.txt`. Em geral: tema importado pelas telas, flexbox, lista que muda de colunas pela largura, componentes próprios com estados (pressionado, desabilitado, erro), tela com carregando e vazio, `npx tsc --noEmit`, nenhum `any`.

## Módulo 6 (Supabase, estados, contexto)
```bash
git ls-files .env.example .env.local        # só .env.example deve aparecer
git check-ignore -v .env.local               # regra .env*.local do .gitignore
grep -n "^## Configura" README.md            # seção Configuração
git grep -n "apikey\|unknown" -- "src/servicos"
git grep -n "tipo: 'carregando'\|tipo: 'erro'\|tipo: 'pronto'" -- "src"
git grep -n "createContext\|useContext\|Provedor" -- "src" "App.tsx"
git grep -n "useAcademia\|usePlanos" -- "src/telas"     # o hook do nosso contexto
npx tsc --noEmit
git grep -nw any -- "*.ts" "*.tsx"
```

## Módulo 7 (SQLite, cache, fila)
```bash
npm ls expo-sqlite                            # expo-sqlite@57.x
git grep -n "openDatabaseAsync\|CREATE TABLE IF NOT EXISTS" -- "src/banco"
git grep -n "getAllAsync<\|getFirstAsync<\|runAsync(" -- "src/banco"
git grep -n "guardarLocal\|listarLocal\|origem: 'aparelho'" -- "src"
git grep -n "listarPendentes\|guardarPendente\|removerPendente" -- "src"
git grep -n "A enviar\|Guardados no aparelho\|origem === 'aparelho'" -- "src/telas"
npx tsc --noEmit
git grep -nw any -- "*.ts" "*.tsx"
```

## Módulo 8 (erros, proteção de dados, testes)
```bash
git grep -n "classificarErro\|registrarErro" -- "src"
git grep -n "ErroDoBanco" -- "src/banco"
git grep -n "registrarErro" -- "src/contexto" "src/telas"
git grep -n "ErroDeValidacao" -- "src"
git ls-files docs                             # deve listar docs/roteiro_de_teste.md
git grep -n "revoke" -- "supabase"            # revoke update, delete no esquema do exercício
npx tsc --noEmit
git grep -nw any -- "*.ts" "*.tsx"
```

## Módulo 9 (entrega)
```bash
git ls-files eas.json docs/roteiro_de_teste.md
git grep -n "\"package\"" -- "app.json"       # android.package
npx tsc --noEmit
git grep -nw any -- "*.ts" "*.tsx"
```

## Histórico e GitHub (o dono roda; usa rede)
```bash
git log --format="%an %ad" --date=format:"%Y-%m-%d %H:%M"   # vários commits, datas diferentes
git shortlog -sn HEAD
git fetch && git status --short --branch                    # só "## main...origin/main"
git ls-remote origin HEAD && git rev-parse HEAD             # os dois códigos iguais
```
O guia exige a identidade do dono nos commits (nome e e-mail do GitHub; use o e-mail `noreply` do GitHub para o push não ser recusado) e **commits distribuídos ao longo do trabalho**, não tudo de uma vez. Nunca reescreva commits já enviados.
