# Roteiro de teste - Academia MisterFit

Cada caso tem os passos, o resultado esperado e o resultado observado. A coluna "Onde e quando" diz se o caso foi executado no aparelho ou no renderizador de teste (um programa que monta as telas sem celular). Um caso falha quando o observado é diferente do esperado; corrigido quando falhou, foi consertado e passou na repetição.

Legenda do resultado: **aprovado** (o observado é o esperado), **falha** (não é), **corrigido** (falhou, foi corrigido e aprovado na repetição), **não executado**.

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C01 | Autenticação com perfil Admin | Abrir o app; digitar login admin e senha; tocar em Acessar Sistema | Login efetuado; token salvo de forma segura; acesso às abas com permissão de exclusão e arquivamento | não executado | - | - |
| C02 | Autenticação com perfil Recepção | Abrir o app; digitar login recepcao e senha; tocar em Acessar Sistema | Login efetuado; redirecionamento às abas; botões restritos (exclusão/arquivamento) ocultos na interface | não executado | - | - |
| C03 | Senha incorreta | Digitar login válido e senha errada; tocar em Acessar Sistema | Acesso bloqueado; mensagem da API exibida; senha e token não registrados em log | não executado | - | - |
| C04 | Limite de tentativas de login (HTTP 429) | Tentar login com senha errada 5 vezes seguidas | API devolve 429; tela exibe alerta para aguardar 60 segundos; erro classificado | não executado | - | - |
| C05 | Carga inicial da lista de alunos | Logar no app; visualizar aba Alunos | Indicador de carregamento enquanto busca dados da API; lista de alunos renderizada com cartões | não executado | - | - |
| C06 | Carga da lista de planos | Acessar a aba Planos | Lista de planos e mensalidades exibida com valores formatados em BRL e destaque | não executado | - | - |
| C07 | Cadastro de aluno com dados válidos | Aba Alunos; tocar em Novo Aluno; preencher nome, data de nascimento e telefone; confirmar | Aluno registrado na API (`POST /alunos`); lista recarrega exibindo novo aluno | não executado | - | - |
| C08 | Validação de nome curto no cadastro | Abrir formulário; preencher nome com 2 caracteres; tentar submeter | Botão desabilitado (`exemplaresInvalido`); mensagem "O nome deve ter entre 3 e 100 caracteres" | não executado | - | - |
| C09 | Validação de data de nascimento futura | Abrir formulário; inserir data de nascimento no futuro ou hoje | Validação impede envio; mensagem "Data de nascimento não pode ser futura" exibida | não executado | - | - |
| C10 | Validação de telefone com DDD | Abrir formulário; preencher telefone incompleto (< 10 dígitos) | Validação impede envio; mensagem orientando formato com DDD válido | não executado | - | - |
| C11 | Validação no contexto (ErroDeValidacao) | Submissão com campos fora da regra | Contexto lança `ErroDeValidacao`; formulário captura e exibe mensagem amigável | não executado | - | - |
| C12 | Navegação para detalhe do aluno | Aba Alunos; tocar no cartão de um aluno | Tela de Detalhe abre exibindo dados cadastrais, plano vinculado e histórico de matrículas | não executado | - | - |
| C13 | Aba de busca dedicada | Acessar aba Busca; digitar termo no campo | Filtragem imediata por nome ou telefone; exibe lista ou mensagem quando vazio | não executado | - | - |
| C14 | Criação de matrícula e cálculo pela API | Aba Matrículas; Nova Matrícula; selecionar aluno e plano; confirmar | Matrícula criada (`POST /matriculas`); API calcula vencimento; registro surge na listagem | não executado | - | - |
| C15 | Atualização de status de matrícula | Tocar em Inativar ou Reativar na matrícula | Status alterado via `PATCH /matriculas/:id/status`; selo visual atualizado imediatamente | não executado | - | - |
| C16 | Responsividade e rotação de tela | Abrir lista em pé (< 600px) e girar aparelho para deitado (>= 600px) | Lista exibe 1 coluna em tela vertical e 2 colunas em tela horizontal/tablet | não executado | - | - |
| C17 | Falha de conexão / Sem rede | Desativar Wi-Fi/dados móveis; recarregar lista | Erro classificado como `rede`; botão "Tentar de novo" disponível; app não fecha | não executado | - | - |
| C18 | Tela Sobre e ambiente | Acessar aba Sobre | Exibe nome, versão, medidas da janela em dp, densidade, escala da fonte e Guardados no aparelho: 0 | não executado | - | - |
| C19 | Registro e histórico de erros | Ocorrer qualquer falha na sessão; abrir aba Sobre | Histórico em memória exibe eventos sem dados sensíveis (sem token, CPF ou senha) | não executado | - | - |
| C20 | Encerramento de sessão (Logout) | Aba Sobre; tocar em Sair da Conta | Sessão limpa do SecureStore; estados de Alunos e Matrículas zerados; retorno à tela de Login | não executado | - | - |
