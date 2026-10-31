import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Aluno, Matricula, Plano } from '@/types/entidades';
import type { EstadoTela } from '@/types/estadoTela';
import { estadoCarregando, estadoErro, estadoSucesso } from '@/types/estadoTela';
import { type FonteDados, fonteApiPadrao } from './FonteDados';
import { useSessao } from '@/auth';
import { registrarErro } from '@/erros';

export interface ContextoDadosData {
  estadoAlunos: EstadoTela<Aluno[]>;
  estadoPlanos: EstadoTela<Plano[]>;
  estadoMatriculas: EstadoTela<Matricula[]>;
  recarregarAlunos: () => Promise<void>;
  recarregarPlanos: () => Promise<void>;
  recarregarMatriculas: () => Promise<void>;
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
  const { usuario } = useSessao();

  const [estadoAlunos, setEstadoAlunos] = useState<EstadoTela<Aluno[]>>(
    estadoCarregando<Aluno[]>()
  );
  const [estadoPlanos, setEstadoPlanos] = useState<EstadoTela<Plano[]>>(
    estadoCarregando<Plano[]>()
  );
  const [estadoMatriculas, setEstadoMatriculas] = useState<EstadoTela<Matricula[]>>(
    estadoCarregando<Matricula[]>()
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

  const recarregarTudo = useCallback(async () => {
    await Promise.all([
      recarregarAlunos(),
      recarregarPlanos(),
      recarregarMatriculas(),
    ]);
  }, [recarregarAlunos, recarregarPlanos, recarregarMatriculas]);

  // Carrega ou reseta os dados conforme o estado de autenticação
  useEffect(() => {
    if (!usuario) {
      setEstadoAlunos(estadoCarregando<Aluno[]>());
      setEstadoPlanos(estadoCarregando<Plano[]>());
      setEstadoMatriculas(estadoCarregando<Matricula[]>());
      return;
    }

    recarregarPlanos();
    recarregarAlunos();
    recarregarMatriculas();
  }, [usuario, recarregarPlanos, recarregarAlunos, recarregarMatriculas]);

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

  return (
    <DadosContext.Provider
      value={{
        estadoAlunos,
        estadoPlanos,
        estadoMatriculas,
        recarregarAlunos,
        recarregarPlanos,
        recarregarMatriculas,
        recarregarTudo,
        criarAluno,
        atualizarAluno,
        arquivarAluno,
        restaurarAluno,
        excluirAluno,
        criarMatricula,
        mudarStatusMatricula,
        excluirMatricula,
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
