import { requisitarApi } from './cliente';
import { mapearUsuario } from './mapeadores';
import type {
  CriarUsuarioDTO,
  UsuarioDTO,
} from './tipos';
import type { Usuario } from '@/types/entidades';

/**
 * Lista todos os usuarios do sistema. Requer permissao usuarios:listar.
 */
export async function listarUsuarios(): Promise<Usuario[]> {
  const dtos = await requisitarApi<UsuarioDTO[]>('/usuarios', {
    method: 'GET',
    autenticado: true,
  });

  return (dtos ?? []).map(mapearUsuario);
}

/**
 * Cria um novo usuario de equipe (admin ou recepcao). Requer permissao usuarios:criar.
 */
export async function criarUsuario(dados: CriarUsuarioDTO): Promise<Usuario> {
  const dto = await requisitarApi<UsuarioDTO>('/usuarios', {
    method: 'POST',
    autenticado: true,
    body: dados,
  });

  return mapearUsuario(dto);
}

/**
 * Altera o status ativo/inativo de um usuario. Requer permissao usuarios:alterar-ativo.
 * Retorna 409 caso tente desativar a si mesmo.
 */
export async function alterarAtivoUsuario(
  id: number,
  ativo: boolean
): Promise<Usuario> {
  const dto = await requisitarApi<UsuarioDTO>(`/usuarios/${id}/ativo`, {
    method: 'PATCH',
    autenticado: true,
    body: { ativo },
  });

  return mapearUsuario(dto);
}

/**
 * Redefine a senha de outro usuario. Requer permissao usuarios:redefinir-senha.
 */
export async function redefinirSenhaUsuario(
  id: number,
  senha: string
): Promise<void> {
  return requisitarApi<void>(`/usuarios/${id}/senha`, {
    method: 'PUT',
    autenticado: true,
    body: { senha },
  });
}
