/**
 * Tipo genérico para modelar estados de tela com união discriminada.
 * Impede estados contraditórios (ex: carregando = true e erro != null simultaneamente)
 * e obriga o tratamento exaustivo nas telas (M6-R5).
 */
export type EstadoTela<T> =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; dados: T };

/**
 * Cria um estado de tela no modo de carregamento.
 */
export function estadoCarregando<T>(): EstadoTela<T> {
  return { tipo: 'carregando' };
}

/**
 * Cria um estado de tela com falha e mensagem descritiva.
 */
export function estadoErro<T>(mensagem: string): EstadoTela<T> {
  return { tipo: 'erro', mensagem };
}

/**
 * Cria um estado de tela pronto com os dados carregados.
 */
export function estadoPronto<T>(dados: T): EstadoTela<T> {
  return { tipo: 'pronto', dados };
}

/**
 * Auxiliar para garantir exaustividade em blocos switch sobre uniões discriminadas.
 */
export function semCaso(valor: never): never {
  throw new Error(`Caso não tratado em união discriminada: ${JSON.stringify(valor)}`);
}
