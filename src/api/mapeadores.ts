import type { Aluno, Matricula, Plano, Usuario } from '@/types/entidades';
import type {
  AlunoDTO,
  CriarAlunoDTO,
  MatriculaDTO,
  PlanoDTO,
  UsuarioDTO,
} from './tipos';
import { limparTelefone } from '@/utils/telefone';

/**
 * Converte UsuarioDTO para a entidade Usuario do aplicativo.
 */
export function mapearUsuario(dto: UsuarioDTO): Usuario {
  return {
    id: dto.id,
    nome: dto.nome,
    login: dto.login,
    perfil: dto.perfil,
  };
}

/**
 * Converte PlanoDTO (snake_case) para a entidade Plano (camelCase).
 */
export function mapearPlano(dto: PlanoDTO): Plano {
  return {
    id: dto.id,
    nome: dto.nome,
    preco: dto.preco,
    duracaoMeses: dto.duracao_meses,
    descricao: dto.descricao,
    destaque: Boolean(dto.destaque),
    recursos: dto.recursos ?? [],
  };
}

/**
 * Converte AlunoDTO para a entidade Aluno.
 */
export function mapearAluno(dto: AlunoDTO): Aluno {
  return {
    id: dto.id,
    nome: dto.nome,
    dataNascimento: dto.data_nascimento,
    telefone: dto.telefone,
    ativo: Boolean(dto.ativo),
    planoNome: dto.plano_nome,
    statusMatricula: dto.status_matricula,
  };
}

/**
 * Prepara o payload para criação ou atualização de aluno na API.
 * Se o telefone for vazio ou só espaços, envia null.
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
 */
export function mapearMatricula(dto: MatriculaDTO): Matricula {
  return {
    id: dto.id,
    idAluno: dto.id_aluno,
    idPlano: dto.id_plano,
    dataInicio: dto.data_inicio,
    dataFimEstimada: dto.data_fim_estimada,
    status: dto.status,
    alunoNome: dto.aluno_nome,
    planoNome: dto.plano_nome,
  };
}
