import { cores } from '../tema/tema';

export const colors = {
  white: cores.textoClaro,
  card: cores.superficie,
  night: cores.fundo,
  black: '#000000',

  gray: {
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: cores.textoSecundario,
    500: '#71717A',
    600: cores.desabilitado,
    800: cores.borda,
    900: '#18181B',
    950: '#09090B',
  },

  red: {
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: cores.erro,
    500: '#EF4444',
    600: '#DC2626',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  blue: {
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: cores.primaria,
    600: '#2563EB',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  green: {
    300: cores.sucesso,
    900: '#042F2E',
  },
};
