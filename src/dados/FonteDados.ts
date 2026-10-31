import type { Aluno, Matricula, Plano } from '@/types/entidades';
import {
  alterarStatusAtivoAluno,
  atualizarAluno,
  atualizarStatusMatricula,
  criarAluno,
  criarMatricula,
  excluirAluno,
  excluirMatricula,
  listarAlunos,
  listarMatriculas,
  listarPlanos,
} from '@/api';

/**
 * Interface abstrata que define as operações de leitura e escrita necessárias para as telas.
 * Atende ao requisito M6-R6 como ponto de desacoplamento.
 */
export interface FonteDados {
  listarPlanos(): Promise<Plano[]>;
  listarAlunos(): Promise<Aluno[]>;
  criarAluno(nome: string, dataNascimentoISO: string, telefone?: string | null): Promise<Aluno>;
  atualizarAluno(id: number, nome: string, dataNascimentoISO: string, telefone?: string | null): Promise<Aluno>;
  alterarStatusAtivoAluno(id: number, ativo: boolean): Promise<void>;
  excluirAluno(id: number): Promise<void>;
  listarMatriculas(): Promise<Matricula[]>;
  criarMatricula(idAluno: number, idPlano: number, dataInicioISO?: string): Promise<Matricula>;
  atualizarStatusMatricula(id: number, status: 'ativa' | 'inativa'): Promise<void>;
  excluirMatricula(id: number): Promise<void>;
}

/**
 * Implementação concreta de FonteDados consumindo a API MisterFit v1.
 */
export class FonteApi implements FonteDados {
  listarPlanos(): Promise<Plano[]> {
    return listarPlanos();
  }

  listarAlunos(): Promise<Aluno[]> {
    return listarAlunos();
  }

  criarAluno(nome: string, dataNascimentoISO: string, telefone?: string | null): Promise<Aluno> {
    return criarAluno(nome, dataNascimentoISO, telefone);
  }

  atualizarAluno(id: number, nome: string, dataNascimentoISO: string, telefone?: string | null): Promise<Aluno> {
    return atualizarAluno(id, nome, dataNascimentoISO, telefone);
  }

  alterarStatusAtivoAluno(id: number, ativo: boolean): Promise<void> {
    return alterarStatusAtivoAluno(id, ativo);
  }

  excluirAluno(id: number): Promise<void> {
    return excluirAluno(id);
  }

  listarMatriculas(): Promise<Matricula[]> {
    return listarMatriculas();
  }

  criarMatricula(idAluno: number, idPlano: number, dataInicioISO?: string): Promise<Matricula> {
    return criarMatricula(idAluno, idPlano, dataInicioISO);
  }

  atualizarStatusMatricula(id: number, status: 'ativa' | 'inativa'): Promise<void> {
    return atualizarStatusMatricula(id, status);
  }

  excluirMatricula(id: number): Promise<void> {
    return excluirMatricula(id);
  }
}

export const fonteApiPadrao: FonteDados = new FonteApi();
