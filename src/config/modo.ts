export type ModoApp = 'equipe' | 'curso';

export function obterModo(): ModoApp {
  const valor = process.env.EXPO_PUBLIC_MODO;
  if (!valor || valor.trim() === '') {
    return 'equipe';
  }
  const modoNormalizado = valor.trim().toLowerCase();
  if (modoNormalizado === 'equipe' || modoNormalizado === 'curso') {
    return modoNormalizado;
  }
  throw new Error('Valor inválido para EXPO_PUBLIC_MODO: use "curso" ou "equipe"');
}

export const modo: ModoApp = obterModo();
