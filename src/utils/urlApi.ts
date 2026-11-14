export const MENSAGEM_ENDERECO_LOCAL =
  'A API está configurada em localhost, que no celular aponta para o próprio aparelho. Use o endereço IP do computador na rede (EXPO_PUBLIC_API_URL).';

/**
 * Retorna true quando o host da URL for localhost, 127.0.0.1 ou ::1.
 * Retorna false para string vazia ou endereços remotos/rede local.
 */
export function ehEnderecoLocal(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }

  const limpo = url.trim();
  if (limpo === '::1' || limpo === '[::1]') {
    return true;
  }

  const comProtocolo = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(limpo)
    ? limpo
    : `http://${limpo}`;

  try {
    const parsed = new URL(comProtocolo);
    const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}
