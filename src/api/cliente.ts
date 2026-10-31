import type { DetalheErroApi, RespostaErroApi } from './tipos';

export class ErroApi extends Error {
  readonly codigo: string;
  readonly statusHttp: number;
  readonly detalhes?: DetalheErroApi[];

  constructor(
    mensagem: string,
    codigo: string = 'ERRO_DESCONHECIDO',
    statusHttp: number = 500,
    detalhes?: DetalheErroApi[]
  ) {
    super(mensagem);
    this.name = 'ErroApi';
    this.codigo = codigo;
    this.statusHttp = statusHttp;
    this.detalhes = detalhes;
  }
}

let tokenAtual: string | null = null;
let callbackSessaoExpirada: (() => void) | null = null;

export function definirTokenApi(token: string | null): void {
  tokenAtual = token;
}

export function obterTokenApi(): string | null {
  return tokenAtual;
}

export function registrarCallbackSessaoExpirada(callback: () => void): void {
  callbackSessaoExpirada = callback;
}

export function obterUrlBase(): string {
  const urlAmbiente = process.env.EXPO_PUBLIC_API_URL;
  const base = (urlAmbiente && urlAmbiente.trim() !== '' ? urlAmbiente.trim() : 'http://localhost:3333').replace(/\/+$/, '');
  return `${base}/v1`;
}

interface OpcoesRequisicao extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
  autenticado?: boolean;
}

export async function requisitarApi<T>(
  caminho: string,
  opcoes: OpcoesRequisicao = {}
): Promise<T> {
  const {
    body,
    timeoutMs = 10000,
    autenticado = true,
    headers: headersCustomizados,
    ...outrasOpcoes
  } = opcoes;

  const urlBase = obterUrlBase();
  const caminhoFormatado = caminho.startsWith('/') ? caminho : `/${caminho}`;
  const urlCompleta = `${urlBase}${caminhoFormatado}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(headersCustomizados as Record<string, string>),
  };

  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  if (autenticado && tokenAtual) {
    headers['Authorization'] = `Bearer ${tokenAtual}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  let resposta: Response;

  try {
    resposta = await fetch(urlCompleta, {
      ...outrasOpcoes,
      headers,
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (erro: any) {
    clearTimeout(timer);
    if (erro?.name === 'AbortError') {
      throw new ErroApi(
        'Tempo limite de conexão excedido. Verifique se o servidor da API está ativo.',
        'TIMEOUT',
        408
      );
    }
    throw new ErroApi(
      'Não foi possível conectar ao servidor. Verifique sua conexão ou a URL configurada.',
      'FALHA_CONEXAO',
      503
    );
  } finally {
    clearTimeout(timer);
  }

  // Tratamento de respostas de erro
  if (!resposta.ok) {
    if (resposta.status === 401) {
      if (callbackSessaoExpirada) {
        callbackSessaoExpirada();
      }
    }

    let corpoErro: RespostaErroApi | null = null;
    try {
      corpoErro = await resposta.json();
    } catch {
      // resposta sem json legível
    }

    const mensagem =
      corpoErro?.error?.message ||
      obterMensagemPadraoPorStatus(resposta.status);
    const codigo = corpoErro?.error?.code || `HTTP_${resposta.status}`;
    const detalhes = corpoErro?.error?.details;

    throw new ErroApi(mensagem, codigo, resposta.status, detalhes);
  }

  // Resposta com 204 No Content
  if (resposta.status === 204) {
    return undefined as unknown as T;
  }

  try {
    const dados = await resposta.json();
    return dados as T;
  } catch {
    return undefined as unknown as T;
  }
}

function obterMensagemPadraoPorStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Dados inválidos na requisição.';
    case 401:
      return 'Sua sessão expirou ou credenciais inválidas. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para realizar esta operação.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Conflito com o estado atual do registro.';
    case 429:
      return 'Limite de tentativas excedido. Aguarde antes de tentar novamente.';
    case 503:
      return 'Serviço ou banco de dados indisponível no momento.';
    case 500:
    default:
      return 'Ocorreu um erro interno no servidor.';
  }
}
