# Entregas e apresentação (módulos 8 e 9)

## Roteiro de teste: `docs/roteiro_de_teste.md`
Tabela com as colunas: `| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |`.
Resultado: `aprovado`, `falha`, `corrigido` ou `não executado` (resposta válida para o que ainda não foi feito no aparelho). Um caso por requisito do app e um por **erro tratado**. "Onde e quando" leva o aparelho e a data. **Nunca invente resultado**: só o dono executa e preenche.

## `eas.json` (exatamente)
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {}
  }
}
```

## `app.json`
Precisa de `android.package` (o guia aceita `com.exemplo.*`). O identificador é difícil de trocar depois de publicado: o dono decide o definitivo antes de uma publicação real.

## README
Seção `## Configuração` com: como criar `.env.local` a partir de `.env.example`, as variáveis dos dois modos, a URL e a chave publicável **do projeto de exercício** (nunca as de produção), como rodar e como gerar o APK.

## Apresentação (5 minutos, com o aparelho na mão)
| Minuto | O que mostrar |
| --- | --- |
| 0 a 1 | O recorte: que problema resolve e qual é a entidade central |
| 1 a 2 | As telas: lista, cadastro, detalhe, busca e Sobre; a navegação ao vivo |
| 2 a 3 | A nuvem: um cadastro feito no aparelho aparece na tabela do Supabase (painel aberto) |
| 3 a 4 | Sem rede: lista do cache com o aviso, cadastro que vai para a fila, rede de volta e sincronização |
| 4 a 5 | O repositório: histórico de commits, roteiro executado, `eas.json`; o APK instalado (ou o Expo Go) |

Critérios avaliados: telas e navegação, consumo da API (cadastro aparece na nuvem), persistência local (cache e fila), teste e qualidade (roteiro executado, com casos de erro), entrega (APK, `eas.json`, `app.json`, histórico com a identidade do dono, tudo enviado ao GitHub) e apresentação (no tempo, demonstrando).
Preparação: aplicativo instalado, rede ligada, painel do Supabase aberto na tabela, repositório no GitHub e roteiro aberto.
O repositório é lido no estado em que estiver ao fim do prazo: o que não foi enviado não existe para a avaliação.
