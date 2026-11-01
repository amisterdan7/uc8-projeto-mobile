import type { Aluno, Matricula, Plano, Usuario } from '@/types/entidades';
import {
  alterarAtivoUsuario,
  alterarStatusAtivoAluno,
  atualizarAluno,
  atualizarPlano,
  atualizarStatusMatricula,
  criarAluno,
  criarMatricula,
  criarPlano,
  criarUsuario,
  excluirAluno,
  excluirMatricula,
  excluirPlano,
  listarAlunos,
  listarMatriculas,
  listarPlanos,
  listarUsuarios,
  redefinirSenhaUsuario,
  trocarSenhaPropria,
} from '@/api';
import type {
  AtualizarPlanoDTO,
  CriarPlanoDTO,
  CriarUsuarioDTO,
  TrocarSenhaDTO,
} from '@/api/tipos';
import type { FonteDados } from './FonteDados';

/**
 * Implementação concreta de FonteDados consumindo a API MisterFit v1.
 */
export class FonteApi implements FonteDados {
  listarPlanos(): Promise<Plano[]> {
    return listarPlanos();
  }

  criarPlano(dados: CriarPlanoDTO): Promise<Plano> {
    return criarPlano(dados);
  }

  atualizarPlano(id: number, dados: AtualizarPlanoDTO): Promise<Plano> {
    return atualizarPlano(id, dados);
  }

  excluirPlano(id: number): Promise<void> {
    return excluirPlano(id);
  }

  listarAlunos(): Promise<Aluno[]> {
    return listarAlunos();
  }

  criarAluno(nome: string, dataNascimentoISO: string, telefone?: string | null): Promise<Aluno> {
    return criarAluno(nome, dataNascimentoISO, telefone);
  }

  atualizarAluno(
    id: number,
    nome: string,
    dataNascimentoISO: string,
    telefone?: string | null
  ): Promise<Aluno> {
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

  trocarSenhaPropria(dados: TrocarSenhaDTO): Promise<void> {
    return trocarSenhaPropria(dados);
  }

  listarUsuarios(): Promise<Usuario[]> {
    return listarUsuarios();
  }

  criarUsuario(dados: CriarUsuarioDTO): Promise<Usuario> {
    return criarUsuario(dados);
  }

  alterarAtivoUsuario(id: number, ativo: boolean): Promise<Usuario> {
    return alterarAtivoUsuario(id, ativo);
  }

  redefinirSenhaUsuario(id: number, senha: string): Promise<void> {
    return redefinirSenhaUsuario(id, senha);
  }
}

export const fonteApi: FonteDados = new FonteApi();
export const fonteApiPadrao: FonteDados = fonteApi;
