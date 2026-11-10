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

export interface AcoesDisponiveisMatricula {
  podeInativar: boolean;
  podeReativar: boolean;
  podeExcluir: boolean;
}

/**
 * Função pura que determina quais botões e ações estão disponíveis para uma matrícula,
 * conforme o status atual e as permissões do usuário logado.
 */
export function obterAcoesDisponiveisMatricula(
  status: string,
  podeAtualizarStatus: boolean,
  podeExcluir: boolean
): AcoesDisponiveisMatricula {
  const isAtiva = status === 'ativa';
  const isInativa = status === 'inativa';

  return {
    podeInativar: podeAtualizarStatus && isAtiva,
    podeReativar: podeAtualizarStatus && !isAtiva,
    podeExcluir: podeExcluir && isInativa,
  };
}

export interface AcoesDetalheMatricula {
  encerrar: boolean;
  excluir: boolean;
}

/**
 * Função pura que define quais ações de matrícula são exibidas no detalhe do aluno (D5):
 * - Administrador vê Encerrar só com matrícula atual ativa;
 * - Administrador vê Excluir no detalhe;
 * - Recepção não vê Encerrar nem Excluir;
 * - Matrícula inativa ou vencida não mostra Encerrar.
 */
export function mostraAcoesMatricula(
  perfil: string | null | undefined,
  status: string | null | undefined
): AcoesDetalheMatricula {
  const ehAdmin = perfil === 'admin' || perfil === 'administrador';
  const temMatricula =
    status === 'ativa' || status === 'inativa' || status === 'vencida';

  return {
    encerrar: ehAdmin && status === 'ativa',
    excluir: ehAdmin && temMatricula,
  };
}

