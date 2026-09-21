export type StatusMatricula = 'ativa' | 'inativa' | 'vencida';

export interface Plano {
  id: number;
  nome: string;
}

export interface Aluno {
  id: number;
  nome: string;
  dataNascimento: string;
  telefone: string | null;
  ativo: boolean;
}

export interface Matricula {
  id: number;
  alunoId: number;
  planoId: number;
  dataFimEstimada: string; 
  status: StatusMatricula;
}

export interface MatriculaDetalhada extends Matricula {
  aluno: Omit<Aluno, 'ativo'>; 
  plano: Plano;
}