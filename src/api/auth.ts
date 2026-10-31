import { requisitarApi } from './cliente';
import type { RespostaEuDTO, RespostaLoginDTO, TrocarSenhaDTO } from './tipos';

export async function autenticarUsuario(
  login: string,
  senha: string
): Promise<RespostaLoginDTO> {
  return requisitarApi<RespostaLoginDTO>('/auth/login', {
    method: 'POST',
    autenticado: false,
    body: { login, senha },
  });
}

export async function obterDadosUsuarioLogado(): Promise<RespostaEuDTO> {
  return requisitarApi<RespostaEuDTO>('/auth/eu', {
    method: 'GET',
    autenticado: true,
  });
}

export async function trocarSenhaPropria(
  dados: TrocarSenhaDTO
): Promise<void> {
  return requisitarApi<void>('/auth/trocar-senha', {
    method: 'POST',
    autenticado: true,
    body: dados,
  });
}
