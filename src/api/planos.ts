import { requisitarApi } from './cliente';
import { mapearPlano } from './mapeadores';
import type { PlanoDTO } from './tipos';
import type { Plano } from '@/types/entidades';

/**
 * Consulta a lista de planos cadastrados na API v1 (rota pública).
 */
export async function listarPlanos(): Promise<Plano[]> {
  const dtos = await requisitarApi<PlanoDTO[]>('/planos', {
    method: 'GET',
    autenticado: false,
  });

  return (dtos ?? []).map(mapearPlano);
}
