import { cores } from '../tema/tema';

/**
 * Mapeamento de compatibilidade que referencia exclusivamente os tokens de `src/tema/tema.ts`.
 * O destaque principal da marca (antes azul) aponta para o laranja MisterFit (`cores.primaria`).
 */
export const colors = {
  white: cores.texto,
  card: cores.cartao,
  night: cores.fundo,
  black: cores.textoEscuro,

  gray: {
    100: cores.texto,
    200: cores.texto,
    300: cores.textoSecundario,
    400: cores.textoSecundario,
    500: cores.textoSecundario,
    600: cores.desabilitado,
    700: cores.desabilitado,
    800: cores.borda,
    900: cores.fundo,
    950: cores.fundo,
  },

  red: {
    100: cores.erroSuave,
    200: cores.erroSuave,
    300: cores.erro,
    400: cores.erro,
    500: cores.erro,
    600: cores.erro,
    700: cores.erro,
    800: cores.erroBorda,
    900: cores.erroSuave,
  },

  blue: {
    100: cores.primariaSuave,
    200: cores.primariaSuave,
    300: cores.primaria,
    400: cores.primaria,
    500: cores.primaria,
    600: cores.primaria,
    700: cores.primaria,
    800: cores.primariaBorda,
    900: cores.primariaSuave,
  },

  green: {
    100: cores.sucessoSuave,
    200: cores.sucessoSuave,
    300: cores.sucesso,
    400: cores.sucesso,
    500: cores.sucesso,
    600: cores.sucesso,
    700: cores.sucesso,
    800: cores.sucessoBorda,
    900: cores.sucessoSuave,
  },

  yellow: {
    100: cores.alertaSuave,
    200: cores.alertaSuave,
    300: cores.alerta,
    400: cores.alerta,
    500: cores.alerta,
    600: cores.alerta,
    700: cores.alerta,
    800: cores.alertaBorda,
    900: cores.alertaSuave,
  },
};
