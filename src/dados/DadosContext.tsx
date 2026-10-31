import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Aluno, Matricula, Plano, Usuario } from '@/types/entidades';
import type { EstadoTela } from '@/types/estadoTela';
import { estadoCarregando, estadoErro, estadoSucesso } from '@/types/estadoTela';
import { type FonteDados, fonteApiPadrao } from './FonteDados';
import { useSessao } from '@/auth';
import { registrarErro } from '@/erros';
import type {
  AtualizarPlanoDTO,
  CriarPlanoDTO,
  CriarUsuarioDTO,
  TrocarSenhaDTO,
} from '@/api/tipos';

export interface ContextoDadosData {
  estadoAlunos: EstadoTela<Aluno[]>;
  estadoPlanos: EstadoTela<Plano[]>;
  estadoMatriculas: EstadoTela<Matricula[]>;
  estadoUsuarios: EstadoTela<Usuario[]>;
  recarregarAlunos: () => Promise<void>;
  recarregarPlanos: () => Promise<void>;
  recarregarMatriculas: () => Promise<void>;
  recarregarUsuarios: () => Promise<void>;
  recarregarTudo: () => Promise<void>;
  criarAluno: (
    nome: string,
    dataNascimentoISO: string,
    telefone?: string | null
  ) => Promise<Aluno>;
  atualizarAluno: (
    id: number,
    nome: string,
    dataNascimentoISO: string,
    telefone?: string | null
  ) => Promise<Aluno>;
  arquivarAluno: (id: number) => Promise<void>;
  restaurarAluno: (id: number) => Promise<void>;
  excluirAluno: (id: number) => Promise<void>;
  criarMatricula: (
    idAluno: number,
    idPlano: number,
    dataInicioISO?: string
  ) => Promise<Matricula>;
  mudarStatusMatricula: (
    id: number,
    status: 'ativa' | 'inativa'
  ) => Promise<void>;
  excluirMatricula: (id: number) => Promise<void>;
  criarPlano: (dados: CriarPlanoDTO) => Promise<Plano>;
  atualizarPlano: (id: number, dados: AtualizarPlanoDTO) => Promise<Plano>;
  excluirPlano: (id: number) => Promise<void>;
  trocarSenhaPropria: (dados: TrocarSenhaDTO) => Promise<void>;
  criarUsuario: (dados: CriarUsuarioDTO) => Promise<Usuario>;
  alterarAtivoUsuario: (id: number, ativo: boolean) => Promise<Usuario>;
  redefinirSenhaUsuario: (id: number, senha: string) => Promise<void>;
}

const DadosContext = createContext<ContextoDadosData | null>(null);

interface DadosProviderProps {
  children: React.ReactNode;
  fonteDados?: FonteDados;
}

export function DadosProvider({
  children,
  fonteDados = fonteApiPadrao,
}: DadosProviderProps) {
  const { usuario, podeFazer } = useSessao();

  const [estadoAlunos, setEstadoAlunos] = useState<EstadoTela<Aluno[]>>(
    estadoCarregando<Aluno[]>()
  );
  const [estadoPlanos, setEstadoPlanos] = useState<EstadoTela<Plano[]>>(
    estadoCarregando<Plano[]>()
  );
  const [estadoMatriculas, setEstadoMatriculas] = useState<EstadoTela<Matricula[]>>(
    estadoCarregando<Matricula[]>()
  );
  const [estadoUsuarios, setEstadoUsuarios] = useState<EstadoTela<Usuario[]>>(
    estadoCarregando<Usuario[]>()
  );

  const recarregarAlunos = useCallback(async () => {
    setEstadoAlunos(estadoCarregando<Aluno[]>());
    try {
      const dados = await fonteDados.listarAlunos();
      setEstadoAlunos(estadoSucesso(dados));
    } catch (e: unknown) {
      const classificado = registrarErro('DadosContext.listarAlunos', e);
      setEstadoAlunos(estadoErro<Aluno[]>(classificado.mensagem));
    }
  }, [fonteDados]);

  const recarregarPlanos = useCallback(async () => {
    setEstadoPlanos(estadoCarregando<Plano[]>());
    try {
      const dados = await fonteDados.listarPlanos();
      setEstadoPlanos(estadoSucesso(dados));
    } catch (e: unknown) {
      const classificado = registrarErro('DadosContext.listarPlanos', e);
      setEstadoPlanos(estadoErro<Plano[]>(classificado.mensagem));
    }
  }, [fonteDados]);

  const recarregarMatriculas = useCallback(async () => {
    setEstadoMatriculas(estadoCarregando<Matricula[]>());
    try {
      const dados = await fonteDados.listarMatriculas();
      setEstadoMatriculas(estadoSucesso(dados));
    } catch (e: unknown) {
      const classificado = registrarErro('DadosContext.listarMatriculas', e);
      setEstadoMatriculas(estadoErro<Matricula[]>(classificado.mensagem));
    }
  }, [fonteDados]);

  const recarregarUsuarios = useCallback(async () => {
    setEstadoUsuarios(estadoCarregando<Usuario[]>());
    try {
      const dados = await fonteDados.listarUsuarios();
      setEstadoUsuarios(estadoSucesso(dados));
    } catch (e: unknown) {
      const classificado = registrarErro('DadosContext.listarUsuarios', e);
      setEstadoUsuarios(estadoErro<Usuario[]>(classificado.mensagem));
    }
  }, [fonteDados]);

  const recarregarTudo = useCallback(async () => {
    const tarefas: Promise<void>[] = [
      recarregarAlunos(),
      recarregarPlanos(),
      recarregarMatriculas(),
    ];
    if (podeFazer('usuarios:listar')) {
      tarefas.push(recarregarUsuarios());
    }
    await Promise.all(tarefas);
  }, [recarregarAlunos, recarregarPlanos, recarregarMatriculas, recarregarUsuarios, podeFazer]);

  // Carrega ou reseta os dados conforme o estado de autenticacao
  useEffect(() => {
    if (!usuario) {
      setEstadoAlunos(estadoCarregando<Aluno[]>());
      setEstadoPlanos(estadoCarregando<Plano[]>());
      setEstadoMatriculas(estadoCarregando<Matricula[]>());
      setEstadoUsuarios(estadoCarregando<Usuario[]>());
      return;
    }

    recarregarPlanos();
    recarregarAlunos();
    recarregarMatriculas();
    if (podeFazer('usuarios:listar')) {
      recarregarUsuarios();
    }
  }, [usuario, recarregarPlanos, recarregarAlunos, recarregarMatriculas, recarregarUsuarios, podeFazer]);

  const criarAluno = useCallback(
    async (nome: string, dataNascimentoISO: string, telefone?: string | null) => {
      try {
        const aluno = await fonteDados.criarAluno(nome, dataNascimentoISO, telefone);
        await recarregarAlunos();
        return aluno;
      } catch (e: unknown) {
        registrarErro('DadosContext.criarAluno', e);
        throw e;
      }
    },
    [fonteDados, recarregarAlunos]
  );

  const atualizarAluno = useCallback(
    async (id: number, nome: string, dataNascimentoISO: string, telefone?: string | null) => {
      try {
        const aluno = await fonteDados.atualizarAluno(id, nome, dataNascimentoISO, telefone);
        await recarregarAlunos();
        return aluno;
      } catch (e: unknown) {
        registrarErro('DadosContext.atualizarAluno', e);
        throw e;
      }
    },
    [fonteDados, recarregarAlunos]
  );

  const arquivarAluno = useCallback(
    async (id: number) => {
      try {
        await fonteDados.alterarStatusAtivoAluno(id, false);
        await recarregarAlunos();
      } catch (e: unknown) {
        registrarErro('DadosContext.arquivarAluno', e);
        throw e;
      }
    },
    [fonteDados, recarregarAlunos]
  );

  const restaurarAluno = useCallback(
    async (id: number) => {
      try {
        await fonteDados.alterarStatusAtivoAluno(id, true);
        await recarregarAlunos();
      } catch (e: unknown) {
        registrarErro('DadosContext.restaurarAluno', e);
        throw e;
      }
    },
    [fonteDados, recarregarAlunos]
  );

  const excluirAluno = useCallback(
    async (id: number) => {
      try {
        await fonteDados.excluirAluno(id);
        await Promise.all([recarregarAlunos(), recarregarMatriculas()]);
      } catch (e: unknown) {
        registrarErro('DadosContext.excluirAluno', e);
        throw e;
      }
    },
    [fonteDados, recarregarAlunos, recarregarMatriculas]
  );

  const criarMatricula = useCallback(
    async (idAluno: number, idPlano: number, dataInicioISO?: string) => {
      try {
        const matricula = await fonteDados.criarMatricula(idAluno, idPlano, dataInicioISO);
        await Promise.all([recarregarMatriculas(), recarregarAlunos()]);
        return matricula;
      } catch (e: unknown) {
        registrarErro('DadosContext.criarMatricula', e);
        throw e;
      }
    },
    [fonteDados, recarregarMatriculas, recarregarAlunos]
  );

  const mudarStatusMatricula = useCallback(
    async (id: number, status: 'ativa' | 'inativa') => {
      try {
        await fonteDados.atualizarStatusMatricula(id, status);
        await Promise.all([recarregarMatriculas(), recarregarAlunos()]);
      } catch (e: unknown) {
        registrarErro('DadosContext.mudarStatusMatricula', e);
        throw e;
      }
    },
    [fonteDados, recarregarMatriculas, recarregarAlunos]
  );

  const excluirMatricula = useCallback(
    async (id: number) => {
      try {
        await fonteDados.excluirMatricula(id);
        await Promise.all([recarregarMatriculas(), recarregarAlunos()]);
      } catch (e: unknown) {
        registrarErro('DadosContext.excluirMatricula', e);
        throw e;
      }
    },
    [fonteDados, recarregarMatriculas, recarregarAlunos]
  );

  const criarPlano = useCallback(
    async (dados: CriarPlanoDTO) => {
      try {
        const novo = await fonteDados.criarPlano(dados);
        await recarregarPlanos();
        return novo;
      } catch (e: unknown) {
        registrarErro('DadosContext.criarPlano', e);
        throw e;
      }
    },
    [fonteDados, recarregarPlanos]
  );

  const atualizarPlano = useCallback(
    async (id: number, dados: AtualizarPlanoDTO) => {
      try {
        const atualizado = await fonteDados.atualizarPlano(id, dados);
        await recarregarPlanos();
        return atualizado;
      } catch (e: unknown) {
        registrarErro('DadosContext.atualizarPlano', e);
        throw e;
      }
    },
    [fonteDados, recarregarPlanos]
  );

  const excluirPlano = useCallback(
    async (id: number) => {
      try {
        await fonteDados.excluirPlano(id);
        await recarregarPlanos();
      } catch (e: unknown) {
        registrarErro('DadosContext.excluirPlano', e);
        throw e;
      }
    },
    [fonteDados, recarregarPlanos]
  );

  const trocarSenhaPropria = useCallback(
    async (dados: TrocarSenhaDTO) => {
      try {
        await fonteDados.trocarSenhaPropria(dados);
      } catch (e: unknown) {
        registrarErro('DadosContext.trocarSenhaPropria', e);
        throw e;
      }
    },
    [fonteDados]
  );

  const criarUsuario = useCallback(
    async (dados: CriarUsuarioDTO) => {
      try {
        const novo = await fonteDados.criarUsuario(dados);
        await recarregarUsuarios();
        return novo;
      } catch (e: unknown) {
        registrarErro('DadosContext.criarUsuario', e);
        throw e;
      }
    },
    [fonteDados, recarregarUsuarios]
  );

  const alterarAtivoUsuario = useCallback(
    async (id: number, ativo: boolean) => {
      try {
        const atualizado = await fonteDados.alterarAtivoUsuario(id, ativo);
        await recarregarUsuarios();
        return atualizado;
      } catch (e: unknown) {
        registrarErro('DadosContext.alterarAtivoUsuario', e);
        throw e;
      }
    },
    [fonteDados, recarregarUsuarios]
  );

  const redefinirSenhaUsuario = useCallback(
    async (id: number, senha: string) => {
      try {
        await fonteDados.redefinirSenhaUsuario(id, senha);
      } catch (e: unknown) {
        registrarErro('DadosContext.redefinirSenhaUsuario', e);
        throw e;
      }
    },
    [fonteDados]
  );

  return (
    <DadosContext.Provider
      value={{
        estadoAlunos,
        estadoPlanos,
        estadoMatriculas,
        estadoUsuarios,
        recarregarAlunos,
        recarregarPlanos,
        recarregarMatriculas,
        recarregarUsuarios,
        recarregarTudo,
        criarAluno,
        atualizarAluno,
        arquivarAluno,
        restaurarAluno,
        excluirAluno,
        criarMatricula,
        mudarStatusMatricula,
        excluirMatricula,
        criarPlano,
        atualizarPlano,
        excluirPlano,
        trocarSenhaPropria,
        criarUsuario,
        alterarAtivoUsuario,
        redefinirSenhaUsuario,
      }}
    >
      {children}
    </DadosContext.Provider>
  );
}

export function useDados(): ContextoDadosData {
  const contexto = useContext(DadosContext);
  if (!contexto) {
    throw new Error('useDados deve ser utilizado dentro de um DadosProvider.');
  }
  return contexto;
}
