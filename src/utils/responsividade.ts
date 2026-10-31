/**
 * Determina o número de colunas da grade com base na largura da janela.
 * Atende ao requisito M5-R3.
 *
 * - Menos de 600px -> 1 coluna (celular vertical)
 * - Menos de 900px -> 2 colunas (celular horizontal / tablet pequeno)
 * - 900px ou mais -> 3 colunas (tablet grande / desktop web)
 */
export function colunasPara(largura: number): number {
  if (largura < 600) {
    return 1;
  }
  if (largura < 900) {
    return 2;
  }
  return 3;
}
