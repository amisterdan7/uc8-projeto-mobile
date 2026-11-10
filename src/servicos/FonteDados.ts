import type {
  Aluno,
  Matricula,
  Plano,
  ResultadoCriacaoAluno,
  Usuario,
} from '@/types/entidades';
import type {
  AtualizarPlanoDTO,
  CriarPlanoDTO,
  CriarUsuarioDTO,
  TrocarSenhaDTO,
} from '@/api/tipos';

/**
 * Interface abstrata que define as operações de leitura e escrita necessárias para as telas.
 * Atende ao requisito M6-R6 como ponto de desacoplamento.
 */
export interface FonteDados {
  listarPlanos(): Promise<Plano[]>;
  criarPlano(dados: CriarPlanoDTO): Promise<Plano>;
  atualizarPlano(id: number, dados: AtualizarPlanoDTO): Promise<Plano>;
  excluirPlano(id: number): Promise<void>;

  listarAlunos(): Promise<Aluno[]>;
  criarAluno(
    nome: string,
    dataNascimentoISO: string,
    telefone?: string | null,
    idPlano?: number,
    dataInicioISO?: string
  ): Promise<ResultadoCriacaoAluno>;
  atualizarAluno(
    id: number,
    nome: string,
    dataNascimentoISO: string,
    telefone?: string | null
  ): Promise<Aluno>;
  alterarStatusAtivoAluno(id: number, ativo: boolean): Promise<void>;
  excluirAluno(id: number): Promise<void>;

  listarMatriculas(): Promise<Matricula[]>;
  criarMatricula(idAluno: number, idPlano: number, dataInicioISO?: string): Promise<Matricula>;
  atualizarStatusMatricula(id: number, status: 'ativa' | 'inativa'): Promise<void>;
  excluirMatricula(id: number): Promise<void>;

  trocarSenhaPropria(dados: TrocarSenhaDTO): Promise<void>;

  listarUsuarios(): Promise<Usuario[]>;
  criarUsuario(dados: CriarUsuarioDTO): Promise<Usuario>;
  alterarAtivoUsuario(id: number, ativo: boolean): Promise<Usuario>;
  redefinirSenhaUsuario(id: number, senha: string): Promise<void>;
}
