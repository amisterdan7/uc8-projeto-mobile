export function extrairHost(urlTexto?: string): string {
  if (!urlTexto) return '';
  try {
    const match = urlTexto.match(/^(?:https?:\/\/)?([^/]+)/i);
    return match ? match[1] : urlTexto;
  } catch {
    return urlTexto;
  }
}
