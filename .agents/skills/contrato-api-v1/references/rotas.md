# Rotas de equipe da API v1

Todas sob `/v1`. "Perm." é a permissão exigida (administrador sempre passa).

## Autenticação
| Método | Caminho | Perm. | Corpo | Resposta |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | público | `login`, `senha` | 200 `{ token, usuario{id,nome,login,perfil}, permissoes[] }` |
| GET | `/auth/eu` | logado | — | 200 `{ usuario{id,nome,login,perfil,ativo}, permissoes[] }` |
| POST | `/auth/trocar-senha` | logado | `senha_atual`, `nova_senha` (8 a 128) | 204; senha atual errada = 400 (não 401) |

## Planos
| Método | Caminho | Perm. | Corpo | Resposta |
| --- | --- | --- | --- | --- |
| GET | `/planos` | público | — | `[{ id, nome, preco, duracao_meses, descricao\|null, destaque, recursos[{descricao}] }]` |
| POST | `/planos` | `planos:criar` | `nome` (2 a 50), `preco` (0 a 100000), `duracao_meses` (1 a 60), `descricao?`, `destaque?`, `recursos?[{descricao 1 a 120}]` | 201 plano |
| PUT | `/planos/:id` | `planos:atualizar` | igual ao POST | 200 plano |
| DELETE | `/planos/:id` | `planos:excluir` | — | 204; 409 se houver matrículas |

## Alunos
| Método | Caminho | Perm. | Corpo | Resposta |
| --- | --- | --- | --- | --- |
| GET | `/alunos` | `alunos:listar` | — | `[{ id, nome, data_nascimento, telefone\|null, ativo, plano_nome\|null, status_matricula }]` |
| POST | `/alunos` | `alunos:criar` (e `matriculas:criar` com `id_plano`) | `nome` (3 a 100), `data_nascimento`, `telefone?`, `id_plano?`, `data_inicio?` | 201 `{ id, nome, data_nascimento, telefone, matricula?: { id, id_aluno, id_plano, data_inicio, data_fim_estimada, status } }`; 404 plano; 409 duplicado |
| PUT | `/alunos/:id` | `alunos:atualizar` | igual ao POST | 200 aluno; 409 duplicado |
| PATCH | `/alunos/:id/ativo` | `alunos:desativar` | `ativo` (boolean) | 204 |
| DELETE | `/alunos/:id` | `alunos:excluir` | — | 204; **409 se tiver matrículas** |

## Matrículas
| Método | Caminho | Perm. | Corpo | Resposta |
| --- | --- | --- | --- | --- |
| GET | `/matriculas` | `matriculas:listar` | — | `[{ id, id_aluno, id_plano, data_inicio, data_fim_estimada, status, aluno_nome, plano_nome }]` |
| POST | `/matriculas` | `matriculas:criar` | `id_aluno`, `id_plano`, `data_inicio?` | 201 `{ id, id_aluno, id_plano, data_inicio, data_fim_estimada, status }`; 404 aluno ou plano; 409 aluno arquivado ou já com matrícula vigente |
| PATCH | `/matriculas/:id/status` | `matriculas:atualizar-status` | `status` = `ativa` ou `inativa` | 204; 409 ao reativar se já houver vigente |
| DELETE | `/matriculas/:id` | `matriculas:excluir` | — | 204 |

## Usuários (administrador)
| Método | Caminho | Perm. | Corpo | Resposta |
| --- | --- | --- | --- | --- |
| GET | `/usuarios` | `usuarios:listar` | — | `[{ id, nome, login, perfil, ativo }]` |
| POST | `/usuarios` | `usuarios:criar` | `nome`, `login` (3 a 30: minúsculas, números, ponto, hífen, sublinhado), `senha` (8 a 128), `perfil` = `admin` ou `recepcao` | 201 usuário; 409 login existente |
| PATCH | `/usuarios/:id/ativo` | `usuarios:alterar-ativo` | `ativo` | 200 usuário; 409 ao desativar a si mesmo |
| PUT | `/usuarios/:id/senha` | `usuarios:redefinir-senha` | `senha` (8 a 128) | 204 |

## Fora do app de equipe
`POST /publico/pre-matriculas` e as rotas antigas da raiz (`GET /planos`, `POST /matriculas`) são da vitrine. O app não as usa.
