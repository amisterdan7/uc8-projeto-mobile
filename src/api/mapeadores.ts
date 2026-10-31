import type { Aluno, Matricula, Plano, Usuario } from '@/types/entidades';
import type {
  CriarAlunoDTO,
} from './tipos';
import { limparTelefone } from '@/utils/telefone';

export const ERRO_RESPOSTA_INESPERADA = 'Resposta inesperada do servidor.';

function ehObjetoValido(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/**
 * Converte UsuarioDTO para a entidade Usuario do aplicativo.
 * Tolera campos adicionais e valida apenas o necessario para o uso.
 */
export function mapearUsuario(dto: unknown): Usuario {
  if (!ehObjetoValido(dto)) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  const { id, nome, login, perfil, ativo } = dto;

  if (
    typeof id !== 'number' ||
    typeof nome !== 'string' ||
    typeof login !== 'string' ||
    (perfil !== 'admin' && perfil !== 'recepcao')
  ) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  return {
    id,
    nome,
    login,
    perfil,
    ativo: ativo !== undefined ? Boolean(ativo) : true,
  };
}

/**
 * Converte PlanoDTO (snake_case) para a entidade Plano (camelCase).
 * Aceita null em descricao e recursos opcionais; ignora campos extras.
 */
export function mapearPlano(dto: unknown): Plano {
  if (!ehObjetoValido(dto)) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  const { id, nome, preco, duracao_meses, descricao, destaque, recursos } = dto;

  if (
    typeof id !== 'number' ||
    typeof nome !== 'string' ||
    typeof preco !== 'number' ||
    isNaN(preco) ||
    typeof duracao_meses !== 'number'
  ) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  if (descricao !== null && descricao !== undefined && typeof descricao !== 'string') {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  let listaRecursos: { descricao: string }[] = [];
  if (Array.isArray(recursos)) {
    listaRecursos = recursos.map((rec: unknown) => {
      if (ehObjetoValido(rec) && typeof rec.descricao === 'string') {
        return { descricao: rec.descricao };
      }
      return { descricao: String(rec ?? '') };
    });
  } else if (recursos !== null && recursos !== undefined) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  return {
    id,
    nome,
    preco,
    duracaoMeses: duracao_meses,
    descricao: typeof descricao === 'string' ? descricao : null,
    destaque: Boolean(destaque),
    recursos: listaRecursos,
  };
}

/**
 * Converte AlunoDTO para a entidade Aluno.
 * Aceita null em telefone e plano_nome; ignora campos extras.
 */
export function mapearAluno(dto: unknown): Aluno {
  if (!ehObjetoValido(dto)) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  const { id, nome, data_nascimento, telefone, ativo, plano_nome, status_matricula } = dto;

  if (
    typeof id !== 'number' ||
    typeof nome !== 'string' ||
    typeof data_nascimento !== 'string'
  ) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  if (telefone !== null && telefone !== undefined && typeof telefone !== 'string') {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  if (plano_nome !== null && plano_nome !== undefined && typeof plano_nome !== 'string') {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  const statusValidos = ['ativa', 'inativa', 'vencida', 'sem_matricula'];
  const statusResolvido =
    typeof status_matricula === 'string' && statusValidos.includes(status_matricula)
      ? (status_matricula as Aluno['statusMatricula'])
      : 'sem_matricula';

  return {
    id,
    nome,
    dataNascimento: data_nascimento,
    telefone: typeof telefone === 'string' ? telefone : null,
    ativo: Boolean(ativo),
    planoNome: typeof plano_nome === 'string' ? plano_nome : null,
    statusMatricula: statusResolvido,
  };
}

/**
 * Prepara o payload para criacao ou atualizacao de aluno na API.
 * Se o telefone for vazio ou so espacos, envia null.
 */
export function mapearAlunoParaEnvio(
  nome: string,
  dataNascimentoISO: string,
  telefone?: string | null
): CriarAlunoDTO {
  const telLimpo = telefone ? limparTelefone(telefone) : '';
  return {
    nome: nome.trim(),
    data_nascimento: dataNascimentoISO.trim(),
    telefone: telLimpo.length > 0 ? telLimpo : null,
  };
}

/**
 * Converte MatriculaDTO para a entidade Matricula.
 * Tolera campos adicionais e aceita null em nomes de relacionamento.
 */
export function mapearMatricula(dto: unknown): Matricula {
  if (!ehObjetoValido(dto)) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  const {
    id,
    id_aluno,
    id_plano,
    data_inicio,
    data_fim_estimada,
    status,
    aluno_nome,
    plano_nome,
  } = dto;

  if (
    typeof id !== 'number' ||
    typeof id_aluno !== 'number' ||
    typeof id_plano !== 'number' ||
    typeof data_inicio !== 'string' ||
    typeof data_fim_estimada !== 'string'
  ) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  const statusValidos = ['ativa', 'inativa', 'vencida'];
  if (typeof status !== 'string' || !statusValidos.includes(status)) {
    throw new Error(ERRO_RESPOSTA_INESPERADA);
  }

  return {
    id,
    idAluno: id_aluno,
    idPlano: id_plano,
    dataInicio: data_inicio,
    dataFimEstimada: data_fim_estimada,
    status: status as Matricula['status'],
    alunoNome: typeof aluno_nome === 'string' ? aluno_nome : undefined,
    planoNome: typeof plano_nome === 'string' ? plano_nome : undefined,
  };
}
