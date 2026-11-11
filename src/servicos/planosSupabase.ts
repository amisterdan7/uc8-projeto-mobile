import { ErroDaApi } from '../erros/ErroDaApi';

export { ErroDaApi };

export interface PlanoAcademia {
  id: number;
  nome: string;
  preco: number;
  duracaoMeses: number;
  descricao?: string;
}

export interface DadosNovoPlano {
  nome: string;
  preco: number;
  duracao_meses: number;
  descricao?: string | null;
}

export interface PlanoRemoto {
  id: number;
  nome: string;
  preco: number | string;
  duracao_meses: number;
  descricao: string | null;
  criado_em?: string;
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
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const chave = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (!url || !chave || url.trim() === '' || chave.trim() === '') {
    throw new Error('Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_KEY em .env.local');
  }
  return { url, chave };
}

export function ehPlanoRemoto(valor: unknown): valor is PlanoRemoto {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const campos = valor as Record<string, unknown>;
  return (
    typeof campos.id === 'number' &&
    typeof campos.nome === 'string' &&
    (typeof campos.preco === 'number' || typeof campos.preco === 'string') &&
    typeof campos.duracao_meses === 'number' &&
    (campos.descricao === null || typeof campos.descricao === 'string')
  );
}

export function ehListaDePlanos(valor: unknown): valor is PlanoRemoto[] {
  return Array.isArray(valor) && valor.every(ehPlanoRemoto);
}

export function paraPlano(remoto: PlanoRemoto): PlanoAcademia {
  return {
    id: remoto.id,
    nome: remoto.nome,
    preco: Number(remoto.preco),
    duracaoMeses: remoto.duracao_meses,
    descricao: remoto.descricao ?? undefined,
  };
}

async function requisitar(
  caminho: string,
  metodo: 'GET' | 'POST' = 'GET',
  corpo?: DadosNovoPlano
): Promise<unknown> {
  const { url, chave } = configuracao();
  const resposta = await fetch(`${url}/rest/v1/${caminho}`, {
    method: metodo,
    headers: {
      apikey: chave,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    throw new ErroDaApi(
      await lerMensagemDeErro(resposta),
      `HTTP_${resposta.status}`,
      resposta.status
    );
  }

  return resposta.json();
}

export async function carregarPlanos(): Promise<PlanoAcademia[]> {
  const corpo: unknown = await requisitar('planos?select=*&order=id');
  if (!ehListaDePlanos(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraPlano);
}

export async function buscarPlano(id: number): Promise<PlanoAcademia | undefined> {
  const corpo: unknown = await requisitar(`planos?select=*&id=eq.${id}`);
  if (!ehListaDePlanos(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  const primeiro = corpo[0];
  return primeiro ? paraPlano(primeiro) : undefined;
}

export async function incluirPlano(dados: DadosNovoPlano): Promise<PlanoAcademia> {
  const corpo: unknown = await requisitar('planos?select=*', 'POST', dados);
  if (!ehListaDePlanos(corpo) || corpo.length !== 1) {
    throw new Error('Resposta inesperada da API');
  }
  return paraPlano(corpo[0]);
}
