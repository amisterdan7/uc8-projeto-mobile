# Roteiro de teste - Academia MisterFit

Cada caso tem os passos, o resultado esperado e o resultado observado. A coluna "Onde e quando" diz se o caso foi executado no aparelho ou no renderizador de teste (um programa que monta as telas sem celular). Um caso falha quando o observado é diferente do esperado; corrigido quando falhou, foi consertado e passou na repetição.

Legenda do resultado: **aprovado** (o observado é o esperado), **falha** (não é), **corrigido** (falhou, foi corrigido e aprovado na repetição), **não executado**.

## Modo equipe (API v1)

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
| C13 | Busca local de alunos | Na aba Alunos, digitar termo no campo de busca acima da lista | Filtragem imediata por nome ou telefone (insensível a maiúsculas e acentos) sem novas requisições à API | não executado | - | - |
| C14 | Criação de matrícula e cálculo pela API | Aba Matrículas; Nova Matrícula; selecionar aluno e plano; confirmar | Matrícula criada (`POST /matriculas`); API calcula vencimento; registro surge na listagem | não executado | - | - |
| C15 | Atualização de status de matrícula | Tocar em Inativar ou Reativar na matrícula | Status alterado via `PATCH /matriculas/:id/status`; selo visual atualizado imediatamente | não executado | - | - |
| C16 | Responsividade e rotação de tela | Abrir lista em pé (< 600px) e girar aparelho para deitado (>= 600px) | Lista exibe 1 coluna em tela vertical e 2 colunas em tela horizontal/tablet | não executado | - | - |
| C17 | Falha de conexão / Sem rede | Desativar Wi-Fi/dados móveis; recarregar lista de alunos | Bloco de erro exibido no topo da tela Alunos com mensagem e botão "Tentar de novo"; app não fecha | não executado | - | - |
| C18 | Tela Sobre e ambiente | Acessar aba Sobre | Exibe nome, versão, medidas da janela em dp, densidade, escala da fonte e Guardados no aparelho: 0 | não executado | - | - |
| C19 | Registro e histórico de erros | Ocorrer qualquer falha na sessão; abrir aba Sobre | Histórico em memória exibe eventos sem dados sensíveis (sem token, CPF ou senha) | não executado | - | - |
| C20 | Encerramento de sessão (Logout) | Aba Sobre; tocar em Sair da Conta | Sessão limpa do SecureStore; estados de Alunos e Matrículas zerados; retorno à tela de Login | não executado | - | - |
| C33 | CRUD de Planos e Gestão de Recursos (C16) | Aba Planos; criar plano com recursos; editar nome/duração; excluir plano sem matrícula | Plano criado via `POST /planos`, atualizado via `PUT /planos/:id` e excluído via `DELETE /planos/:id`; erro 409 tratado se houver matrículas vinculadas | não executado | - | - |
| C34 | Gerenciamento de Usuários - Admin (C17) | Aba Usuários com login admin; cadastrar novo colaborador; alternar status ativo; redefinir senha | Usuário criado (`POST /usuarios`); desativação do próprio usuário bloqueada na interface e tratada; senha alterada via modal | não executado | - | - |
| C35 | Alteração da Própria Senha (C18) | Aba Conta; informar senha atual e nova senha de 8 a 128 caracteres | Senha atualizada via `POST /auth/trocar-senha`; erro 400 mapeado para campo de senha atual se incorreta | não executado | - | - |
| C36 | Busca sem resultado na tela Alunos | Na aba Alunos, digitar termo inexistente no campo de busca | Lista exibe estado vazio com mensagem exata "Nenhum aluno encontrado para a busca." | não executado | - | - |
| C37 | Tratamento de erro 503/timeout na tela Alunos | Simular servidor offline ou timeout ao recarregar alunos | Cartão no topo da tela Alunos informa erro e disponibiliza botão funcional "Tentar de novo" | não executado | - | - |

## Modo curso (Supabase + SQLite + Fila)

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C21 | Carga com rede | Abrir o app no modo curso com rede ativa | Planos carregados do Supabase de exercício; guardados no banco SQLite local; exibidos na lista | não executado | - | - |
| C22 | Cadastro válido aparece na tabela do Supabase | Tocar em Novo Plano; preencher nome, preço, duração e descrição; tocar em Salvar | Plano salvo na nuvem; visível na lista do app e na tabela `planos` do Supabase de exercício | não executado | - | - |
| C23 | Campo inválido mostra erro no campo | No formulário de plano, deixar nome em branco ou preço negativo | Mensagem de erro sob o campo correspondente; botão Salvar desabilitado | não executado | - | - |
| C24 | Chave errada tratada | Definir chave publicável inválida no `.env.local`; iniciar app | Tela exibe mensagem amigável: "A API respondeu 401" | não executado | - | - |
| C25 | Sem rede com cache | Desativar conexão após ter carregado uma vez; abrir app | Lista carrega do SQLite com aviso: "Sem conexão: mostrando os planos guardados no aparelho" | não executado | - | - |
| C26 | Sem rede e sem cache | Abrir o app pela primeira vez sem nenhuma rede e sem banco preenchido | Estado de erro exibido com mensagem da falha e botão "Tentar de novo" | não executado | - | - |
| C27 | Cadastro sem rede vai para a fila | Sem conexão; cadastrar novo plano no formulário | Cadastro aceito localmente; adicionado à fila com aviso: "A enviar (1): Nome do Plano" | não executado | - | - |
| C28 | Rede de volta sincroniza e a fila esvazia | Reativar rede; tocar em Recarregar na lista | Plano pendente é enviado ao Supabase; removido da tabela de pendentes; aviso "A enviar" some | não executado | - | - |
| C29 | Detalhe | Na lista de planos, tocar no cartão do plano | Tela de Detalhe abre exibindo nome, preço em BRL, duração e descrição sem nova requisição | não executado | - | - |
| C30 | Busca | Acessar a aba Busca; digitar termo presente no nome ou na descrição | Planos filtrados em tempo real na grade responsiva | não executado | - | - |
| C31 | Contagem no Sobre | Acessar aba Sobre do modo curso | Exibe "Guardados no aparelho: N" com total correto; mostra "indisponível" se banco falhar | não executado | - | - |
| C32 | DELETE com a chave publicável recusado | Enviar DELETE para `/rest/v1/planos` com a apikey anon | Supabase recusa com código HTTP 42501 (privilégio insuficiente por RLS e revoke) | não executado | - | - |
