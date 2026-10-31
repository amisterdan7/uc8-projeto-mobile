/**
 * DTOs (Data Transfer Objects) que refletem exatamente o contrato da API v1.
 * Notacao snake_case conforme devolvido pelo backend.
 */

export interface DetalheErroApi {
  campo: string;
  mensagem: string;
}

export interface RespostaErroApi {
  error: {
    code: string;
    message: string;
    details?: DetalheErroApi[];
  };
}

export interface UsuarioDTO {
  id: number;
  nome: string;
  login: string;
  perfil: 'admin' | 'recepcao';
  ativo?: boolean;
}

export interface CriarUsuarioDTO {
  nome: string;
  login: string;
  senha: string;
  perfil: 'admin' | 'recepcao';
}

export interface AlterarAtivoUsuarioDTO {
  ativo: boolean;
}

export interface RedefinirSenhaUsuarioDTO {
  senha: string;
}

export interface RespostaLoginDTO {
  token: string;
  usuario: UsuarioDTO;
  permissoes: string[];
}

export interface RespostaEuDTO {
  usuario: UsuarioDTO;
  permissoes: string[];
}

export interface RecursoPlanoDTO {
  descricao: string;
}

export interface PlanoDTO {
  id: number;
  nome: string;
  preco: number;
  duracao_meses: number;
  descricao: string | null;
  destaque: boolean;
  recursos: RecursoPlanoDTO[];
}

export interface CriarPlanoDTO {
  nome: string;
  preco: number;
  duracao_meses: number;
  descricao?: string | null;
  destaque?: boolean;
  recursos?: RecursoPlanoDTO[];
}

export interface AtualizarPlanoDTO {
  nome: string;
  preco: number;
  duracao_meses: number;
  descricao?: string | null;
  destaque?: boolean;
  recursos?: RecursoPlanoDTO[];
}

export interface AlunoDTO {
  id: number;
  nome: string;
  data_nascimento: string;
  telefone: string | null;
  ativo: boolean;
  plano_nome: string | null;
  status_matricula: 'ativa' | 'inativa' | 'vencida' | 'sem_matricula';
}

export interface CriarAlunoDTO {
  nome: string;
  data_nascimento: string;
  telefone?: string | null;
}

export interface AtualizarAlunoDTO {
  nome: string;
  data_nascimento: string;
  telefone?: string | null;
}

export interface MatriculaDTO {
  id: number;
  id_aluno: number;
  id_plano: number;
  data_inicio: string;
  data_fim_estimada: string;
  status: 'ativa' | 'inativa' | 'vencida';
  aluno_nome?: string;
  plano_nome?: string;
}

export interface CriarMatriculaDTO {
  id_aluno: number;
  id_plano: number;
  data_inicio?: string;
}

export interface AtualizarStatusMatriculaDTO {
  status: 'ativa' | 'inativa';
}

export interface TrocarSenhaDTO {
  senha_atual: string;
  nova_senha: string;
}
