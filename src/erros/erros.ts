import { ErroDaApi } from '../api/cliente';

export type TipoDeErro = 'rede' | 'api' | 'banco' | 'validacao' | 'desconhecido';

export interface ErroClassificado {
  tipo: TipoDeErro;
  mensagem: string;
  detalhe: string;
  origem?: string;
}

export class ErroDeValidacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDeValidacao';
  }
}

export class ErroDoBanco extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDoBanco';
  }
}

export interface EventoErro {
  dataHora: string;
  origem: string;
  tipo: TipoDeErro;
  detalhe: string;
  mensagem: string;
  statusOuCodigo?: string | number;
}

const LIMITE_BUFFER = 50;
const bufferErros: EventoErro[] = [];

/**
 * Remove dados pessoais, senhas ou tokens que possam estar presentes em textos de erro.
 */
export function sanitizar(texto: string): string {
  if (!texto || typeof texto !== 'string') {
    return '';
  }

  return texto
    .replace(/Bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [TOKEN_OCULTO]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[EMAIL_OCULTO]')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF_OCULTO]')
    .replace(/\(?\b\d{2}\)?\s*9?\d{4}-?\d{4}\b/g, '[TELEFONE_OCULTO]')
    .replace(/"(senha|password)"\s*:\s*"[^"]*"/gi, '"$1":"[SENHA_OCULTA]"');
}

/**
 * Classifica um erro ocorrido no aplicativo para mensagem amigável e categoria padronizada.
 */
export function classificarErro(erro: unknown): ErroClassificado {
  if (erro instanceof ErroDeValidacao) {
    return {
      tipo: 'validacao',
      mensagem: erro.message,
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }

  if (erro instanceof ErroDaApi) {
    if (erro.codigo === 'TIMEOUT' || erro.codigo === 'FALHA_CONEXAO') {
      return {
        tipo: 'rede',
        mensagem: 'Sem conexão com o servidor.',
        detalhe: `${erro.name} ${erro.codigo}: ${sanitizar(erro.message)}`,
      };
    }

    let mensagem = `O servidor recusou a operação (${erro.status}).`;
    if (erro.status === 401) {
      mensagem = 'Sua sessão expirou. Faça login novamente.';
    } else if (erro.status === 403) {
      mensagem = 'Você não tem permissão para esta ação.';
    } else if (erro.status === 400) {
      mensagem = sanitizar(erro.message || 'Dados inválidos na requisição.');
    } else if (erro.status === 404) {
      mensagem = 'Recurso não encontrado.';
    } else if (erro.status === 409) {
      mensagem = sanitizar(erro.message || 'Conflito com o estado atual do registro.');
    } else if (erro.status === 429) {
      mensagem = sanitizar(erro.message) || 'Limite de tentativas excedido.';
    } else if (erro.status >= 500) {
      mensagem = 'Servidor indisponível.';
    }

    return {
      tipo: 'api',
      mensagem,
      detalhe: `${erro.name} ${erro.status}: ${sanitizar(erro.message)}`,
    };
  }

  if (erro instanceof ErroDoBanco) {
    return {
      tipo: 'banco',
      mensagem: 'Não foi possível ler ou guardar os dados no aparelho.',
      detalhe: `${erro.name}: ${sanitizar(erro.message)}`,
    };
  }

  if (
    (erro instanceof TypeError && erro.message === 'Network request failed') ||
    (erro instanceof Error && erro.name === 'AbortError')
  ) {
    return {
      tipo: 'rede',
      mensagem: 'Sem conexão com o servidor. Verifique a rede e tente de novo.',
      detalhe: `${erro.name}: ${sanitizar(erro.message)}`,
    };
  }

  if (erro instanceof Error) {
    const msgLower = erro.message.toLowerCase();
    if (
      msgLower.includes('network') ||
      msgLower.includes('fetch') ||
      msgLower.includes('conexão') ||
      msgLower.includes('failed to fetch')
    ) {
      return {
        tipo: 'rede',
        mensagem: 'Sem conexão com o servidor. Verifique a rede e tente de novo.',
        detalhe: `${erro.name}: ${sanitizar(erro.message)}`,
      };
    }

    return {
      tipo: 'desconhecido',
      mensagem: 'Algo deu errado. Tente de novo.',
      detalhe: `${erro.name}: ${sanitizar(erro.message)}`,
    };
  }

  return {
    tipo: 'desconhecido',
    mensagem: 'Algo deu errado. Tente de novo.',
    detalhe: sanitizar(String(erro)),
  };
}

/**
 * Registra o erro no console no formato [origem] tipo: detalhe e guarda no buffer em memória.
 */
export function registrarErro(origem: string, erro: unknown): ErroClassificado {
  const classificado = classificarErro(erro);
  classificado.origem = origem;

  console.error(`[${origem}] ${classificado.tipo}: ${classificado.detalhe}`);

  let statusOuCodigo: string | number | undefined;
  if (erro instanceof ErroDaApi) {
    statusOuCodigo = erro.codigo || erro.status;
  }

  bufferErros.push({
    dataHora: new Date().toISOString(),
    origem: sanitizar(origem),
    tipo: classificado.tipo,
    detalhe: classificado.detalhe,
    mensagem: classificado.mensagem,
    statusOuCodigo,
  });

  if (bufferErros.length > LIMITE_BUFFER) {
    bufferErros.shift();
  }

  return classificado;
}

/**
 * Retorna os últimos eventos de erro registrados (para visualização na tela Sobre).
 */
export function obterEventosErro(): ReadonlyArray<EventoErro> {
  return [...bufferErros];
}

/**
 * Limpa o histórico de erros em memória.
 */
export function limparEventosErro(): void {
  bufferErros.length = 0;
}

/**
 * Converte a lista de detalhes da API (400) em um mapa de mensagens por campo.
 */
export function mapearDetalhesErro(
  detalhes?: { campo: string; mensagem: string }[]
): Record<string, string> {
  const mapa: Record<string, string> = {};
  if (!detalhes || !Array.isArray(detalhes)) {
    return mapa;
  }
  for (const item of detalhes) {
    if (item && typeof item.campo === 'string' && typeof item.mensagem === 'string') {
      mapa[item.campo] = item.mensagem;
    }
  }
  return mapa;
}

/**
 * Extrai erros de campos a partir de uma excecao ErroDaApi.
 */
export function extrairErrosCampos(erro: unknown): Record<string, string> {
  if (erro instanceof ErroDaApi && erro.detalhes) {
    return mapearDetalhesErro(erro.detalhes);
  }
  return {};
}

