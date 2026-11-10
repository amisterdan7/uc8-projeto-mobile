import type { Aluno, Matricula } from '@/types/entidades';

export interface GrupoMatriculasAluno {
  idAluno: number;
  alunoNome: string;
  atual: Matricula;
  historico: Matricula[];
}

/**
 * Agrupa uma lista de matrículas por aluno preservando a ordem da primeira ocorrência de cada aluno.
 * A primeira matrícula encontrada para cada aluno (conforme ordenação da API) é considerada a `atual`,
 * e as demais do mesmo aluno ficam em `historico` (somente leitura).
 */
export function agruparMatriculasPorAluno(
  matriculas: Matricula[]
): GrupoMatriculasAluno[] {
  const mapa = new Map<number, GrupoMatriculasAluno>();

  for (const mat of matriculas) {
    const existente = mapa.get(mat.idAluno);
    if (!existente) {
      mapa.set(mat.idAluno, {
        idAluno: mat.idAluno,
        alunoNome: mat.alunoNome ?? `Aluno #${mat.idAluno}`,
        atual: mat,
        historico: [],
      });
    } else {
      existente.historico.push(mat);
    }
  }

  return Array.from(mapa.values());
}

/**
 * Filtra apenas os alunos elegíveis para nova matrícula (renovação):
 * - aluno ativo (`ativo === true`)
 * - `statusMatricula` em `'vencida' | 'inativa' | 'sem_matricula'` (ou ausente)
 */
export function alunosElegiveisParaMatricula(alunos: Aluno[]): Aluno[] {
  return alunos.filter((aluno) => {
    if (!aluno.ativo) {
      return false;
    }
    const status = aluno.statusMatricula ?? 'sem_matricula';
    return (
      status === 'vencida' ||
      status === 'inativa' ||
      status === 'sem_matricula'
    );
  });
}
