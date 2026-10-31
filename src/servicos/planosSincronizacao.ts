import { ErroDeValidacao } from '../erros/erros';
import { ErroDaApi, type DadosNovoPlanoCurso, type PlanoCurso } from './planosSupabase';

export interface PendenteSincronizavel extends DadosNovoPlanoCurso {
  id: number;
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
 * Lógica pura de sincronização da fila de pendentes com injeção de dependências.
 */
export async function sincronizarFila(
  listar: () => Promise<PendenteSincronizavel[]>,
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
        // Falha de rede ou desconhecido: interrompe o envio para preservar a ordem
        return;
      }
    }
    await remover(pendente.id);
  }
}
