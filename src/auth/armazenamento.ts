import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CHAVE_TOKEN_STORAGE = 'token_auth_misterfit';
let tokenMemoriaWeb: string | null = null;

/**
 * Salva o token de autenticação JWT de forma segura no dispositivo.
 * Na Web, utiliza armazenamento em memória conforme especificação.
 */
export async function salvarTokenArmazenado(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    tokenMemoriaWeb = token;
    return;
  }

  try {
    await SecureStore.setItemAsync(CHAVE_TOKEN_STORAGE, token);
  } catch {
    tokenMemoriaWeb = token;
  }
}

/**
 * Recupera o token de autenticação JWT salvo.
 */
export async function obterTokenArmazenado(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return tokenMemoriaWeb;
  }

  try {
    const token = await SecureStore.getItemAsync(CHAVE_TOKEN_STORAGE);
    return token ?? tokenMemoriaWeb;
  } catch {
    return tokenMemoriaWeb;
  }
}

/**
 * Remove o token de autenticação JWT salvo.
 */
export async function removerTokenArmazenado(): Promise<void> {
  tokenMemoriaWeb = null;

  if (Platform.OS === 'web') {
    return;
  }

  try {
    await SecureStore.deleteItemAsync(CHAVE_TOKEN_STORAGE);
  } catch {
    // ignorar falha ao deletar
  }
}
