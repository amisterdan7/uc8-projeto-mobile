# uc8-projeto-mobile

Aplicativo mobile (Expo) baseado no sistema **Academia MisterFit** (Controlo de Academia: Matrículas e Planos), desenvolvido na UC5.

## 1. Entidades do recorte

Do sistema original, o app mobile recorta três entidades:

### Aluno
| Campo | Descrição |
|---|---|
| `id` | Identificador do aluno |
| `nome` | Nome completo |
| `dataNascimento` | Data de nascimento |
| `telefone` | Telefone de contato |
| `ativo` | Se o aluno está atualmente ativo |

### Plano
| Campo | Descrição |
|---|---|
| `id` | Identificador do plano |
| `nome` | Nome do plano (ex.: Fit, Mister, Basic) |
| `preco` | Valor mensal, em reais |
| `duracaoMeses` | Duração do plano em meses |
| `descricao` | Descrição do que o plano inclui |

### Matrícula
| Campo | Descrição |
|---|---|
| `id` | Identificador da matrícula |
| `alunoId` | Referência ao aluno matriculado |
| `planoId` | Referência ao plano contratado |
| `dataInicio` | Início da matrícula |
| `dataFimEstimada` | Término calculado a partir do início e da duração do plano |
| `status` | `'ativa' \| 'inativa' \| 'vencida'` |

## 2. Telas previstas

1. **Lista de Alunos** — mostra todos os alunos cadastrados, com busca por nome.
2. **Detalhes do Aluno** — exibe os dados do aluno e o histórico de matrículas dele.
3. **Cadastro/Edição de Aluno** — formulário para criar ou atualizar um aluno.
4. **Planos** — lista os planos disponíveis, com preço e duração de cada um.
5. **Nova Matrícula** — tela para matricular um aluno em um plano.