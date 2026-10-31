import { alterarStatusAtivoAluno, atualizarAluno, criarAluno, listarAlunos } from '../api/alunos';
import { listarPlanos } from '../api/planos';
import { atualizarStatusMatricula, criarMatricula, listarMatriculas } from '../api/matriculas';
import type { Aluno, Matricula, Plano } from '../types/entidades';
import type { DadosEdicaoAluno, DadosNovaMatricula, DadosNovoAluno, FonteDados } from './FonteDados';

export class FonteApi implements FonteDados {
  async listarAlunos(): Promise<Aluno[]> {
    return listarAlunos();
  }

  async buscarAlunoPorId(id: number): Promise<Aluno | undefined> {
    const todos = await listarAlunos();
    return todos.find((a) => a.id === id);
  }

  async criarAluno(dados: DadosNovoAluno): Promise<Aluno> {
    return criarAluno(dados.nome, dados.dataNascimento, dados.telefone);
  }

  async atualizarAluno(id: number, dados: DadosEdicaoAluno): Promise<Aluno> {
    return atualizarAluno(id, dados.nome, dados.dataNascimento, dados.telefone);
  }

  async alternarStatusAluno(id: number, ativo: boolean): Promise<void> {
    return alterarStatusAtivoAluno(id, ativo);
  }

  async listarPlanos(): Promise<Plano[]> {
    return listarPlanos();
  }

  async listarMatriculas(): Promise<Matricula[]> {
    return listarMatriculas();
  }

  async criarMatricula(dados: DadosNovaMatricula): Promise<Matricula> {
    return criarMatricula(dados.idAluno, dados.idPlano, dados.dataInicio);
  }

  async atualizarStatusMatricula(id: number, status: 'ativa' | 'inativa'): Promise<void> {
    return atualizarStatusMatricula(id, status);
  }
}

export const fonteApi = new FonteApi();
