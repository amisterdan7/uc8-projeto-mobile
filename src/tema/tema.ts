/**
 * Tema visual padronizado do aplicativo Academia MisterFit (alinhado ao desktop).
 * Centraliza todas as cores, raios e espaçamentos; nenhuma cor solta nas telas ou componentes.
 */
export const cores = {
  fundo: '#121214',
  cartao: '#1e1e22',
  superficie: '#1e1e22',
  borda: '#27272a',
  texto: '#ffffff',
  textoClaro: '#ffffff',
  textoEscuro: '#121214',
  textoSecundario: '#a1a1aa',
  primaria: '#ff5b24',
  sucesso: '#10b981',
  alerta: '#f59e0b',
  erro: '#ef4444',
  info: '#06b6d4',
  desabilitado: '#52525b',

  // Fundos translúcidos (15%) e bordas translúcidas (40%) para selos e avisos
  primariaSuave: 'rgba(255, 91, 36, 0.15)',
  primariaBorda: 'rgba(255, 91, 36, 0.4)',
  sucessoSuave: 'rgba(16, 185, 129, 0.15)',
  sucessoBorda: 'rgba(16, 185, 129, 0.4)',
  alertaSuave: 'rgba(245, 158, 11, 0.15)',
  alertaBorda: 'rgba(245, 158, 11, 0.4)',
  erroSuave: 'rgba(239, 68, 68, 0.15)',
  erroBorda: 'rgba(239, 68, 68, 0.4)',
  infoSuave: 'rgba(6, 182, 212, 0.15)',
  infoBorda: 'rgba(6, 182, 212, 0.4)',
  neutroSuave: 'rgba(161, 161, 170, 0.15)',
  neutroBorda: 'rgba(161, 161, 170, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const raios = {
  xs: 6,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pequeno: 6,
  medio: 8,
  grande: 12,
  cartaoPlano: 16,
};

export const espacos = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

export const raio = raios.md;
export const larguraLarga = 600;
