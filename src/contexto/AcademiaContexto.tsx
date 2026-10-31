import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Aluno, Matricula, Plano } from '../types/entidades';
import { ErroDeValidacao, registrarErro } from '../erros/erros';
import { type DadosEdicaoAluno, type DadosNovaMatricula, type DadosNovoAluno, type FonteDados } from '../servicos/FonteDados';
import { fonteApi } from '../servicos/fonteApi';
import { useSessao } from '../auth';

export type EstadoAcademia =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | {
      tipo: 'pronto';
      alunos: Aluno[];
      matriculas: Matricula[];
      planos: Plano[];
      origem: 'nuvem';
    }
  | {
      tipo: 'pronto';
      alunos: Aluno[];
      matriculas: Matricula[];
      planos: Plano[];
      origem: 'aparelho';
      motivo: string;
    };

export interface ValorDaAcademia {
  estado: EstadoAcademia;
  recarregar: () => Promise<void>;
  incluirAluno: (dados: DadosNovoAluno) => Promise<Aluno>;
  atualizarAluno: (id: number, dados: DadosEdicaoAluno) => Promise<Aluno>;
  alternarStatusAluno: (id: number, ativo: boolean) => Promise<void>;
  incluirMatricula: (dados: DadosNovaMatricula) => Promise<Matricula>;
  atualizarStatusMatricula: (id: number, status: 'ativa' | 'inativa') => Promise<void>;
  buscarAluno: (id: number) => Aluno | undefined;
  buscarMatriculasDoAluno: (idAluno: number) => Matricula[];
  buscarPlano: (idPlano: number) => Plano | undefined;
}

const AcademiaContexto = createContext<ValorDaAcademia | undefined>(undefined);
export const AcervoContexto = AcademiaContexto;

export function AcademiaProvedor({
  children,
  fonte = fonteApi,
}: {
  children: ReactNode;
  fonte?: FonteDados;
}) {
  const { usuario } = useSessao();
  const [estado, setEstado] = useState<EstadoAcademia>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  const sincronizar = useCallback(async () => {
    // Sincronização offline reservada para quando o banco local for ativado
  }, []);

  const carregar = useCallback(async () => {
    setEstado({ tipo: 'carregando' });
    try {
      await sincronizar().catch((erro: unknown) => {
        registrarErro('sincronizar', erro);
      });

      const [alunos, planos, matriculas] = await Promise.all([
        fonte.listarAlunos().catch((erro: unknown) => {
          registrarErro('carga alunos', erro);
          throw erro;
        }),
        fonte.listarPlanos().catch((erro: unknown) => {
          registrarErro('carga planos', erro);
          throw erro;
        }),
        fonte.listarMatriculas().catch((erro: unknown) => {
          registrarErro('carga matriculas', erro);
          throw erro;
        }),
      ]);

      setEstado({
        tipo: 'pronto',
        alunos,
        planos,
        matriculas,
        origem: 'nuvem',
      });
    } catch (erro: unknown) {
      const classificado = registrarErro('carga', erro);
      setEstado({ tipo: 'erro', mensagem: classificado.mensagem });
    }
  }, [fonte, sincronizar]);

  useEffect(() => {
    if (usuario) {
      carregar();
    } else {
      setEstado({ tipo: 'carregando' });
    }
  }, [usuario, tentativa, carregar]);

  async function recarregar(): Promise<void> {
    setTentativa((t) => t + 1);
  }

  async function incluirAluno(dados: DadosNovoAluno): Promise<Aluno> {
    if (!dados.nome || dados.nome.trim().length < 3) {
      throw new ErroDeValidacao('O nome do aluno deve ter no mínimo 3 caracteres.');
    }
    if (!dados.dataNascimento || dados.dataNascimento.trim() === '') {
      throw new ErroDeValidacao('Informe a data de nascimento.');
    }
    const hoje = new Date().toISOString().slice(0, 10);
    if (dados.dataNascimento >= hoje) {
      throw new ErroDeValidacao('A data de nascimento não pode ser hoje nem no futuro.');
    }

    try {
      const novo = await fonte.criarAluno(dados);
      setEstado((atual) =>
        atual.tipo === 'pronto' ? { ...atual, alunos: [novo, ...atual.alunos] } : atual
      );
      return novo;
    } catch (erro: unknown) {
      registrarErro('cadastro aluno', erro);
      throw erro;
    }
  }

  async function atualizarAluno(id: number, dados: DadosEdicaoAluno): Promise<Aluno> {
    if (!dados.nome || dados.nome.trim().length < 3) {
      throw new ErroDeValidacao('O nome do aluno deve ter no mínimo 3 caracteres.');
    }
    if (!dados.dataNascimento || dados.dataNascimento.trim() === '') {
      throw new ErroDeValidacao('Informe a data de nascimento.');
    }

    try {
      const atualizado = await fonte.atualizarAluno(id, dados);
      setEstado((atual) =>
        atual.tipo === 'pronto'
          ? {
              ...atual,
              alunos: atual.alunos.map((a) => (a.id === id ? atualizado : a)),
            }
          : atual
      );
      return atualizado;
    } catch (erro: unknown) {
      registrarErro('atualizar aluno', erro);
      throw erro;
    }
  }

  async function alternarStatusAluno(id: number, ativo: boolean): Promise<void> {
    try {
      await fonte.alternarStatusAluno(id, ativo);
      setEstado((atual) =>
        atual.tipo === 'pronto'
          ? {
              ...atual,
              alunos: atual.alunos.map((a) => (a.id === id ? { ...a, ativo } : a)),
            }
          : atual
      );
    } catch (erro: unknown) {
      registrarErro('status aluno', erro);
      throw erro;
    }
  }

  async function incluirMatricula(dados: DadosNovaMatricula): Promise<Matricula> {
    if (!dados.idAluno) {
      throw new ErroDeValidacao('Selecione o aluno para a matrícula.');
    }
    if (!dados.idPlano) {
      throw new ErroDeValidacao('Selecione o plano da matrícula.');
    }

    try {
      const nova = await fonte.criarMatricula(dados);
      setEstado((atual) =>
        atual.tipo === 'pronto'
          ? { ...atual, matriculas: [nova, ...atual.matriculas] }
          : atual
      );
      return nova;
    } catch (erro: unknown) {
      registrarErro('cadastro matricula', erro);
      throw erro;
    }
  }

  async function atualizarStatusMatricula(id: number, status: 'ativa' | 'inativa'): Promise<void> {
    try {
      await fonte.atualizarStatusMatricula(id, status);
      setEstado((atual) =>
        atual.tipo === 'pronto'
          ? {
              ...atual,
              matriculas: atual.matriculas.map((m) => (m.id === id ? { ...m, status } : m)),
            }
          : atual
      );
    } catch (erro: unknown) {
      registrarErro('status matricula', erro);
      throw erro;
    }
  }

  function buscarAluno(id: number): Aluno | undefined {
    return estado.tipo === 'pronto' ? estado.alunos.find((a) => a.id === id) : undefined;
  }

  function buscarMatriculasDoAluno(idAluno: number): Matricula[] {
    return estado.tipo === 'pronto'
      ? estado.matriculas.filter((m) => m.idAluno === idAluno)
      : [];
  }

  function buscarPlano(idPlano: number): Plano | undefined {
    return estado.tipo === 'pronto' ? estado.planos.find((p) => p.id === idPlano) : undefined;
  }

  return (
    <AcademiaContexto.Provider
      value={{
        estado,
        recarregar,
        incluirAluno,
        atualizarAluno,
        alternarStatusAluno,
        incluirMatricula,
        atualizarStatusMatricula,
        buscarAluno,
        buscarMatriculasDoAluno,
        buscarPlano,
      }}
    >
      {children}
    </AcademiaContexto.Provider>
  );
}

export const AcervoProvedor = AcademiaProvedor;

export function useAcademia(): ValorDaAcademia {
  const contexto = useContext(AcademiaContexto);
  if (contexto === undefined) {
    throw new Error('useAcademia só funciona dentro de AcademiaProvedor');
  }
  return contexto;
}

export const useAcervo = useAcademia;
