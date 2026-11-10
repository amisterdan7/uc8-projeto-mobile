# Exemplos de vencimento (conferidos)

Regra: data de fim = início + meses do plano; mantém o dia, e se o mês de destino é mais curto vale o último dia dele. Estes casos servem para fixtures e testes; **o cálculo real é do servidor**.

| Início | Meses | Fim |
| --- | ---: | --- |
| 2026-10-20 | 1 | 2026-11-20 |
| 2026-10-20 | 3 | 2027-01-20 |
| 2026-10-20 | 12 | 2027-10-20 |
| 2026-12-15 | 1 | 2027-01-15 |
| 2026-01-31 | 1 | 2026-02-28 |
| 2026-03-31 | 1 | 2026-04-30 |
| 2026-08-31 | 1 | 2026-09-30 |
| 2026-11-30 | 3 | 2027-02-28 |
| 2027-11-30 | 3 | 2028-02-29 (2028 é bissexto) |

## Status em função da data de hoje
Matrícula `ativa` com fim em 2026-11-20:
- hoje 2026-11-19 ou 2026-11-20: continua `ativa`.
- hoje 2026-11-21: aparece como `vencida`.

## O que NÃO fazer
- `new Date('2026-01-31')` mais um mês: dá 3 de março (transbordo) e mostra o dia errado no Brasil.
- Somar meses no app para "mostrar uma prévia" do vencimento: pode divergir da API. Mostre o valor devolvido na resposta da criação.
