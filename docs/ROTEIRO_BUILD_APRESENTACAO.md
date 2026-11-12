# Roteiro de Build de Apresentação (APK - Modo Curso)

Este roteiro deve ser executado **pelo dono do projeto** diretamente no terminal local, utilizando a CLI do EAS.
Nenhuma chave secreta ou publishable key deve ser salva em arquivos, commits ou colada no chat.

**Commit de referência:** `83afbad` (`app.json` versão `1.0.1`)

---

## Passos de Execução (Terminal do Dono)

### a) Consultar ajuda do comando de variáveis de ambiente
```bash
eas env:set --help
```

### b) Definir o modo de operação como `curso` no ambiente `preview`
```bash
eas env:set --environment preview --name EXPO_PUBLIC_MODO --value curso --visibility plaintext
```

### c) Definir a URL do Supabase de exercício no ambiente `preview`
```bash
eas env:set --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://ptsgjgvieolpecwzcemc.supabase.co" --visibility plaintext
```

### d) Definir a chave pública do Supabase no ambiente `preview`
Substitua `<publishable key...>` pela chave digitada manualmente no seu terminal:
```bash
eas env:set --environment preview --name EXPO_PUBLIC_SUPABASE_KEY --value "<publishable key do projeto ptsgjgvieolpecwzcemc, digitada pelo dono>" --visibility plaintext
```

### e) Remover `EXPO_PUBLIC_API_URL` do ambiente `preview` (caso exista)
```bash
eas env:delete preview --variable-name EXPO_PUBLIC_API_URL
```

### f) Conferir as variáveis configuradas no ambiente `preview`
```bash
eas env:list --environment preview
```
> **Atenção:** Ao colar a saída no chat, mostre **apenas os nomes das variáveis e o host da URL** (`ptsgjgvieolpecwzcemc.supabase.co`). **Nunca cole a chave.**

### g) Gerar o APK de apresentação na EAS
```bash
eas build --profile preview --platform android --message "APK apresentação - modo curso (Supabase de exercício)"
```
> **Observações:**
> - Responda **`n`** caso a CLI pergunte sobre instalar/rodar no emulador.
> - **Nunca** utilize a flag `--auto-submit`.

### h) Retornar os dados do build para a Parte 2 (Auditoria)
Após o término do build, cole no chat:
1. **Status** do build
2. **ID** do build
3. **Link de instalação** do APK
4. **Nomes das variáveis** que apareceram no log do build (sem nenhum valor de chave)
