import { ErroDaApi } from '../api/cliente';
import type { Aluno, Plano } from '../types/entidades';

export { ErroDaApi };

export interface DadosNovoAluno {
  nome: string;
  dataNascimento: string;
  telefone?: string | null;
}

export function descreverErro(erro: unknown): string {
  if (erro instanceof ErroDaApi) {
    return `A API respondeu ${erro.status}: ${erro.message}`;
  }
  if (erro instanceof Error) {
    return erro.message;
  }
  return 'Erro desconhecido';
}

function ehMensagemDeErro(valor: unknown): valor is { message: string } {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    typeof (valor as Record<string, unknown>).message === 'string'
  );
}

export async function lerMensagemDeErro(resposta: Response): Promise<string> {
  const corpo: unknown = await resposta.json().catch(() => undefined);
  return ehMensagemDeErro(corpo) ? corpo.message : 'sem detalhe no corpo da resposta';
}

function configuracao(): { url: string; chave: string } {
  const url = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';
  const chave = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'public-anon-key';
  return { url, chave };
}

function ehAlunoRemoto(valor: unknown): valor is Aluno {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const campos = valor as Record<string, unknown>;
  return (
    typeof campos.id === 'number' &&
    typeof campos.nome === 'string' &&
    typeof campos.dataNascimento === 'string' &&
    typeof campos.ativo === 'boolean'
  );
}

export function ehListaDeAlunos(valor: unknown): valor is Aluno[] {
  return Array.isArray(valor) && valor.every(ehAlunoRemoto);
}

export async function requisitarServico(
  caminho: string,
  metodo: 'GET' | 'POST' = 'GET',
  corpo?: unknown
): Promise<unknown> {
  const { url, chave } = configuracao();
  const resposta = await fetch(`${url}/v1/${caminho}`, {
    method: metodo,
    headers: {
      apikey: chave,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    throw new ErroDaApi(await lerMensagemDeErro(resposta), `HTTP_${resposta.status}`, resposta.status);
  }

  return resposta.json();
}
