import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  contarLocal,
  guardarLocal,
  guardarPendente,
  listarLocal,
  listarPendentes,
  removerPendente,
  type PendentePlano,
} from '../banco/banco';
import { ErroDeValidacao, registrarErro } from '../erros/erros';
import {
  carregarPlanos,
  incluirPlano,
  ErroDaApi,
  type DadosNovoPlanoCurso,
  type PlanoCurso,
} from '../servicos/planosSupabase';

export type EstadoPlanos =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; planos: PlanoCurso[]; pendentes: PendentePlano[]; origem: 'nuvem' }
  | {
      tipo: 'pronto';
      planos: PlanoCurso[];
      pendentes: PendentePlano[];
      origem: 'aparelho';
      motivo: string;
    };

export interface ValorDosPlanos {
  estado: EstadoPlanos;
  recarregar: () => void;
  incluir: (dados: DadosNovoPlanoCurso) => Promise<void>;
  buscar: (id: number) => PlanoCurso | undefined;
}

export function validarDadosPlano(dados: DadosNovoPlanoCurso): void {
  if (!dados.nome || dados.nome.trim() === '') {
    throw new ErroDeValidacao('Informe o nome do plano.');
  }
  if (typeof dados.preco !== 'number' || isNaN(dados.preco) || dados.preco < 0) {
    throw new ErroDeValidacao('O preço deve ser um número maior ou igual a zero.');
  }
  if (!Number.isInteger(dados.duracao_meses) || dados.duracao_meses < 1) {
    throw new ErroDeValidacao('A duração deve ser um número inteiro de no mínimo 1 mês.');
  }
}

/**
 * Lógica pura de sincronização da fila de pendentes com injeção de dependências para testes unitários.
 */
export async function sincronizarFila(
  listar: () => Promise<PendentePlano[]>,
  enviar: (dados: DadosNovoPlanoCurso) => Promise<PlanoCurso>,
  remover: (id: number) => Promise<void>,
  registrarFalha: (origem: string, erro: unknown) => void
): Promise<void> {
  const pendentes = await listar();
  for (const pendente of pendentes) {
    try {
      await enviar(pendente);
    } catch (erro: unknown) {
      if (erro instanceof ErroDaApi) {
        registrarFalha('pendente descartado', erro);
      } else {
        // Erro de rede ou desconhecido: interrompe envio para manter a ordem da fila
        return;
      }
    }
    await remover(pendente.id);
  }
}

const PlanosContexto = createContext<ValorDosPlanos | undefined>(undefined);

export function PlanosProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoPlanos>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'carregando' });

    sincronizar()
      .catch((erro: unknown) => {
        registrarErro('sincronizar', erro);
      })
      .then(() => carregarPlanos())
      .then(async (planos) => {
        const pendentes = await listarPendentes().catch((erro: unknown) => {
          registrarErro('pendentes', erro);
          return [];
        });
        if (!cancelado) {
          setEstado({ tipo: 'pronto', planos, pendentes, origem: 'nuvem' });
        }
        guardarLocal(planos).catch((erro: unknown) => {
          registrarErro('guardar no aparelho', erro);
        });
      })
      .catch((erro: unknown) => {
        const motivo = registrarErro('carga', erro).mensagem;
        Promise.all([listarLocal(), listarPendentes()])
          .then(([guardados, pendentes]) => {
            if (cancelado) {
              return;
            }
            if (guardados.length > 0 || pendentes.length > 0) {
              setEstado({
                tipo: 'pronto',
                planos: guardados,
                pendentes,
                origem: 'aparelho',
                motivo,
              });
            } else {
              setEstado({ tipo: 'erro', mensagem: motivo });
            }
          })
          .catch((erroLocal: unknown) => {
            if (!cancelado) {
              setEstado({
                tipo: 'erro',
                mensagem: registrarErro('leitura do aparelho', erroLocal).mensagem,
              });
            }
          });
      });

    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function recarregar() {
    setTentativa((t) => t + 1);
  }

  async function sincronizar(): Promise<void> {
    await sincronizarFila(
      listarPendentes,
      incluirPlano,
      removerPendente,
      registrarErro
    );
  }

  async function incluir(dados: DadosNovoPlanoCurso): Promise<void> {
    validarDadosPlano(dados);

    try {
      const novo = await incluirPlano(dados);
      setEstado((atual) =>
        atual.tipo === 'pronto' ? { ...atual, planos: [...atual.planos, novo] } : atual
      );
    } catch (erro: unknown) {
      if (erro instanceof ErroDaApi) {
        throw erro;
      }
      const pendente = await guardarPendente(dados);
      setEstado((atual) =>
        atual.tipo === 'pronto'
          ? { ...atual, pendentes: [...atual.pendentes, pendente] }
          : atual
      );
    }
  }

  function buscar(id: number): PlanoCurso | undefined {
    return estado.tipo === 'pronto'
      ? estado.planos.find((p) => p.id === id)
      : undefined;
  }

  return (
    <PlanosContexto.Provider value={{ estado, recarregar, incluir, buscar }}>
      {children}
    </PlanosContexto.Provider>
  );
}

export function usePlanos(): ValorDosPlanos {
  const valor = useContext(PlanosContexto);
  if (valor === undefined) {
    throw new Error('usePlanos só funciona dentro de PlanosProvedor');
  }
  return valor;
}
