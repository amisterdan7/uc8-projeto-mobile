---
name: identidade-visual-misterfit
description: Identidade visual e de texto da Academia MisterFit para o app mobile, herdada do desktop (tema escuro, laranja da marca, selos de status, tom em português). Use quando a tarefa envolver telas, cores, tema, componentes (Botao, Campo, selos), textos de botões e mensagens, listas responsivas, estados de carregando, erro e vazio, ou qualquer ajuste visual, para manter o mesmo visual do desktop.
---

# Identidade visual MisterFit

O app mobile segue o visual do desktop: **tema escuro, laranja de marca, fonte Inter, cartões com borda sutil**. Centralize tudo em `src/tema/tema.ts`; nenhuma cor solta nas telas.

## Tokens (valores do desktop)
| Nome sugerido no tema | Valor | Uso |
| --- | --- | --- |
| `fundo` | `#121214` | Fundo das telas |
| `cartao` | `#1e1e22` | Cartões, linhas de lista, toasts |
| `borda` | `#27272a` | Bordas e divisores; também campos |
| `texto` | `#ffffff` | Texto principal |
| `textoSecundario` | `#a1a1aa` | Rótulos, apoio, placeholders |
| `primaria` | `#ff5b24` | Botão primário, destaque, aba ativa |
| `sucesso` | `#10b981` | Ativo, confirmações |
| `alerta` | `#f59e0b` | Avisos (ex.: "A enviar") |
| `erro` | `#ef4444` | Vencido, erro, exclusão |
| `info` | `#06b6d4` | Plano Fit, recepção |

Raios: 6, 8, 12 e 16 px (pequeno, médio, grande, cartão de plano). Fonte Inter, pesos 400, 600, 700 e 800. `larguraLarga` = 600 (acima disso, listas em duas colunas). Espaços: `xs` 4, `sm` 8, `md` 16, `lg` 24.

## Contraste (medido)
- Texto escuro `#121214` sobre laranja: 6,0:1. Texto branco sobre laranja: **3,1:1**, só aceitável para texto grande e em negrito (botões a partir de 16 sp em negrito). Rótulo pequeno sobre laranja: use o texto escuro.
- Cinza `#a1a1aa` sobre `#121214` ou `#1e1e22`: acima de 6,4:1. Verde, vermelho e ciano sobre o fundo escuro: acima de 4,9:1.

## Selos de status (mesmos textos e cores do desktop)
| Valor | Texto | Cor do texto e fundo translúcido (15%) |
| --- | --- | --- |
| aluno `ativa` / matrícula `ativa` | "Ativo" / "Ativa" | `sucesso` |
| `vencida` | "Vencido" / "Vencida" | `erro` |
| `inativa` | "Inativo" / "Inativa" | `textoSecundario` |
| `sem_matricula` | "Sem plano" | `textoSecundario` |
| aluno `ativo = false` | "Arquivado" | `textoSecundario`, e a linha toda com opacidade 45% |

Perfil: "Administrador" em `primaria`; "Recepção" em `info`. Plano: selo laranja se o nome contém "mister" ou é destaque, ciano se contém "fit", cinza nos demais.

## Componentes
- **Botao**: `titulo`, `onPress`, `variante` (`primario` laranja ou `secundario` com borda), `desabilitado`; estados pressionado e desabilitado visíveis; alvo de toque de pelo menos 44 px.
- **Campo**: `rotulo`, `valor`, `aoMudar`, `erro`, `tipoDeTeclado`, `desabilitado`, `secureTextEntry`; estados normal, foco (borda laranja), desabilitado e **erro** (borda vermelha e mensagem abaixo); `accessibilityLabel`.
- Estados de tela: `Carregando` (indicador e texto), `EstadoErro` (mensagem e "Tentar de novo"), `EstadoVazio` (mensagem útil, com a ação quando houver).
- Listas: uma coluna no celular e duas em largura grande (`numColumns` com `key` que muda junto), puxar para atualizar, estado vazio.

## Textos
- Português do Brasil, frases curtas, verbos no infinitivo nos botões: "Entrar", "Salvar", "Novo aluno", "Renovar", "Arquivar", "Restaurar", "Excluir", "Tentar de novo".
- Rótulos de navegação: no modo equipe são 5 abas (**Início**, **Alunos**, **Planos**, **Matrículas**, **Conta**, com **Usuários** aberta dentro de `Conta > Equipe` para quem tem `usuarios:listar`); no modo curso são **Planos**, **Busca** e **Sobre**.
- Confirmações como no desktop: "Deseja arquivar os dados de NOME?", "Deseja restaurar o cadastro de NOME?". Exclusão definitiva alerta que é irreversível.
- Mensagens de erro dizem o que aconteceu e o que fazer; nunca mostre código técnico nem texto cru do servidor para o usuário.
- Marca: "Academia MisterFit". Campo de login se chama **Usuário**, não "E-mail".

## Acessibilidade e responsividade
Teclado não cobre campos (`KeyboardAvoidingView`), áreas seguras respeitadas, `accessibilityLabel` em ícones e botões sem texto, nada dependendo só de cor (o selo tem texto), e teste em tela estreita e em paisagem.
