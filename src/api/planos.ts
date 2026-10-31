import { requisitarApi } from './cliente';
import { mapearPlano } from './mapeadores';
import type { AtualizarPlanoDTO, CriarPlanoDTO, PlanoDTO } from './tipos';
import type { Plano } from '@/types/entidades';

/**
 * Consulta a lista de planos cadastrados na API v1 (rota publica).
 */
export async function listarPlanos(): Promise<Plano[]> {
  const dtos = await requisitarApi<PlanoDTO[]>('/planos', {
    method: 'GET',
    autenticado: false,
  });

  return (dtos ?? []).map(mapearPlano);
}

/**
 * Cadastra um novo plano na academia. Requer permissao planos:criar.
 */
export async function criarPlano(dados: CriarPlanoDTO): Promise<Plano> {
  const dto = await requisitarApi<PlanoDTO>('/planos', {
    method: 'POST',
    autenticado: true,
    body: dados,
  });

  return mapearPlano(dto);
}

/**
 * Atualiza os dados de um plano existente. Requer permissao planos:atualizar.
 */
export async function atualizarPlano(
  id: number,
  dados: AtualizarPlanoDTO
): Promise<Plano> {
  const dto = await requisitarApi<PlanoDTO>(`/planos/${id}`, {
    method: 'PUT',
    autenticado: true,
    body: dados,
  });

  return mapearPlano(dto);
}

/**
 * Exclui um plano do catalogo. Requer permissao planos:excluir.
 * Retorna 409 caso existam matriculas vinculadas a ele.
 */
export async function excluirPlano(id: number): Promise<void> {
  return requisitarApi<void>(`/planos/${id}`, {
    method: 'DELETE',
    autenticado: true,
  });
}
