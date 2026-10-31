import { requisitarApi } from './cliente';
import { mapearMatricula } from './mapeadores';
import type { CriarMatriculaDTO, MatriculaDTO } from './tipos';
import type { Matricula } from '@/types/entidades';

/**
 * Lista todas as matrículas cadastradas. Requer permissão matriculas:listar.
 */
export async function listarMatriculas(): Promise<Matricula[]> {
  const dtos = await requisitarApi<MatriculaDTO[]>('/matriculas', {
    method: 'GET',
    autenticado: true,
  });

  return (dtos ?? []).map(mapearMatricula);
}

/**
 * Registra uma nova matrícula. Requer permissão matriculas:criar.
 * A API calcula a data_fim_estimada a partir do plano e início.
 */
export async function criarMatricula(
  idAluno: number,
  idPlano: number,
  dataInicioISO?: string
): Promise<Matricula> {
  const corpo: CriarMatriculaDTO = {
    id_aluno: idAluno,
    id_plano: idPlano,
  };

  if (dataInicioISO && dataInicioISO.trim() !== '') {
    corpo.data_inicio = dataInicioISO.trim();
  }

  const dto = await requisitarApi<MatriculaDTO>('/matriculas', {
    method: 'POST',
    autenticado: true,
    body: corpo,
  });

  return mapearMatricula(dto);
}

/**
 * Atualiza o status de uma matrícula para 'ativa' ou 'inativa'.
 * Requer permissão matriculas:atualizar-status.
 */
export async function atualizarStatusMatricula(
  id: number,
  status: 'ativa' | 'inativa'
): Promise<void> {
  return requisitarApi<void>(`/matriculas/${id}/status`, {
    method: 'PATCH',
    autenticado: true,
    body: { status },
  });
}

/**
 * Exclui definitivamente uma matrícula inativa. Requer permissão matriculas:excluir.
 */
export async function excluirMatricula(id: number): Promise<void> {
  return requisitarApi<void>(`/matriculas/${id}`, {
    method: 'DELETE',
    autenticado: true,
  });
}
