/**
 * Utilitários para formatação de valores monetários no padrão Real Brasileiro (BRL).
 */

const formatadorBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Formata um valor numérico para a moeda brasileira (ex.: R$ 89,90).
 */
export function formatarMoedaBRL(valor: number | null | undefined): string {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return 'R$ 0,00';
  }
  return formatadorBRL.format(valor);
}
