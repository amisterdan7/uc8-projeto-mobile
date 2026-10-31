import { requisitarApi } from './cliente';
import { mapearAluno, mapearAlunoParaEnvio } from './mapeadores';
import type { AlunoDTO } from './tipos';
import type { Aluno } from '@/types/entidades';

/**
 * Lista todos os alunos cadastrados. Requer permissão alunos:listar.
 */
export async function listarAlunos(): Promise<Aluno[]> {
  const dtos = await requisitarApi<AlunoDTO[]>('/alunos', {
    method: 'GET',
    autenticado: true,
  });

  return (dtos ?? []).map(mapearAluno);
}

/**
 * Cria um novo aluno. Requer permissão alunos:criar.
 */
export async function criarAluno(
  nome: string,
  dataNascimentoISO: string,
  telefone?: string | null
): Promise<Aluno> {
  const corpo = mapearAlunoParaEnvio(nome, dataNascimentoISO, telefone);
  const dto = await requisitarApi<AlunoDTO>('/alunos', {
    method: 'POST',
    autenticado: true,
    body: corpo,
  });

  return mapearAluno(dto);
}

/**
 * Atualiza os dados de um aluno existente. Requer permissão alunos:atualizar.
 */
export async function atualizarAluno(
  id: number,
  nome: string,
  dataNascimentoISO: string,
  telefone?: string | null
): Promise<Aluno> {
  const corpo = mapearAlunoParaEnvio(nome, dataNascimentoISO, telefone);
  const dto = await requisitarApi<AlunoDTO>(`/alunos/${id}`, {
    method: 'PUT',
    autenticado: true,
    body: corpo,
  });

  return mapearAluno(dto);
}

/**
 * Arquiva (ativo = false) ou restaura (ativo = true) um aluno.
 * Requer permissão alunos:desativar.
 */
export async function alterarStatusAtivoAluno(
  id: number,
  ativo: boolean
): Promise<void> {
  return requisitarApi<void>(`/alunos/${id}/ativo`, {
    method: 'PATCH',
    autenticado: true,
    body: { ativo },
  });
}

/**
 * Exclui permanentemente um aluno e suas matrículas associadas.
 * Requer permissão alunos:excluir.
 */
export async function excluirAluno(id: number): Promise<void> {
  return requisitarApi<void>(`/alunos/${id}`, {
    method: 'DELETE',
    autenticado: true,
  });
}
