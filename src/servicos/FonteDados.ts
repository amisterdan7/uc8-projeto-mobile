import type { Aluno, Matricula, Plano } from '../types/entidades';

export interface DadosNovoAluno {
  nome: string;
  dataNascimento: string; // formato AAAA-MM-DD
  telefone?: string | null;
}

export interface DadosEdicaoAluno {
  nome: string;
  dataNascimento: string; // formato AAAA-MM-DD
  telefone?: string | null;
}

export interface DadosNovaMatricula {
  idAluno: number;
  idPlano: number;
  dataInicio?: string; // formato AAAA-MM-DD
}

export interface FonteDados {
  listarAlunos(): Promise<Aluno[]>;
  buscarAlunoPorId(id: number): Promise<Aluno | undefined>;
  criarAluno(dados: DadosNovoAluno): Promise<Aluno>;
  atualizarAluno(id: number, dados: DadosEdicaoAluno): Promise<Aluno>;
  alternarStatusAluno(id: number, ativo: boolean): Promise<void>;

  listarPlanos(): Promise<Plano[]>;

  listarMatriculas(): Promise<Matricula[]>;
  criarMatricula(dados: DadosNovaMatricula): Promise<Matricula>;
  atualizarStatusMatricula(id: number, status: 'ativa' | 'inativa'): Promise<void>;
}
