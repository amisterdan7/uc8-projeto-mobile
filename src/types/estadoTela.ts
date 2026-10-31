/**
 * Representação dos estados fundamentais de uma tela ou recurso por união discriminada.
 * Atende ao requisito M6-R5 do guia do módulo.
 */
export type EstadoTela<T> =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'sucesso'; dados: T };

/**
 * Função utilitária para garantir verificação exaustiva em blocos switch/if no TypeScript.
 */
export function semCaso(x: never): never {
  throw new Error(`Caso não tratado em união discriminada: ${JSON.stringify(x)}`);
}

export function estadoCarregando<T>(): EstadoTela<T> {
  return { tipo: 'carregando' };
}

export function estadoErro<T>(mensagem: string): EstadoTela<T> {
  return { tipo: 'erro', mensagem };
}

export function estadoSucesso<T>(dados: T): EstadoTela<T> {
  return { tipo: 'sucesso', dados };
}
