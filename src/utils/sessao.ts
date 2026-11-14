import { ErroDaApi } from '../erros/ErroDaApi';

/**
 * Decide se a sessão salva deve ser limpa ou mantida quando a restauração (/auth/eu) falha.
 * Retorna 'limpar' apenas para NAO_AUTENTICADO ou USUARIO_DESATIVADO.
 * Qualquer outro erro (rede, timeout, 503, desconhecido) retorna 'manter'.
 */
export function decidirAoFalharSessao(erro: unknown): 'limpar' | 'manter' {
  if (
    erro instanceof ErroDaApi &&
    (erro.codigo === 'NAO_AUTENTICADO' || erro.codigo === 'USUARIO_DESATIVADO')
  ) {
    return 'limpar';
  }
  return 'manter';
}
