export type PerfilUsuario = 'admin' | 'recepcao';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  perfil: PerfilUsuario;
  ativo?: boolean;
}

export interface SessaoUsuario {
  usuario: Usuario;
  permissoes: string[];
}

export interface RecursoPlano {
  descricao: string;
}

export interface Plano {
  id: number;
  nome: string;
  preco: number;
  duracaoMeses: number;
  descricao: string | null;
  destaque: boolean;
  recursos: RecursoPlano[];
}

export type StatusMatricula = 'ativa' | 'inativa' | 'vencida';
export type StatusAlunoMatricula = 'ativa' | 'inativa' | 'vencida' | 'sem_matricula';

export interface Aluno {
  id: number;
  nome: string;
  dataNascimento: string; // formato AAAA-MM-DD
  telefone: string | null;
  ativo: boolean;
  planoNome?: string | null;
  statusMatricula?: StatusAlunoMatricula;
}

export interface Matricula {
  id: number;
  idAluno: number;
  idPlano: number;
  dataInicio: string; // formato AAAA-MM-DD
  dataFimEstimada: string; // formato AAAA-MM-DD (calculado pela API)
  status: StatusMatricula;
  alunoNome?: string;
  planoNome?: string;
}

export interface ResultadoCriacaoAluno {
  aluno: Aluno;
  matricula?: Matricula;
}
