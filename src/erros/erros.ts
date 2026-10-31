import { ErroApi } from '@/api/cliente';

export type TipoErro =
  | 'rede'
  | 'sessao'
  | 'permissao'
  | 'validacao'
  | 'conflito'
  | 'servidor'
  | 'desconhecido';

export interface ErroClassificado {
  tipo: TipoErro;
  mensagem: string;
  origem?: string;
}

export interface EventoErro {
  dataHora: string;
  origem: string;
  tipo: TipoErro;
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
    // Mascara tokens Bearer
    .replace(/Bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [TOKEN_OCULTO]')
    // Mascara possíveis e-mails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[EMAIL_OCULTO]')
    // Mascara CPFs
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF_OCULTO]')
    // Mascara telefones com DDD
    .replace(/\(?\b\d{2}\)?\s*9?\d{4}-?\d{4}\b/g, '[TELEFONE_OCULTO]')
    // Mascara senhas explícitas em json/texto
    .replace(/"(senha|password)"\s*:\s*"[^"]*"/gi, '"$1":"[SENHA_OCULTA]"');
}

/**
 * Classifica um erro ocorrido no aplicativo para mensagem amigável e categoria padronizada.
 */
export function classificarErro(erro: unknown, origem?: string): ErroClassificado {
  if (erro instanceof ErroApi) {
    if (erro.statusHttp === 401 || erro.codigo === 'NAO_AUTENTICADO') {
      return {
        tipo: 'sessao',
        mensagem: 'Sua sessão expirou ou suas credenciais são inválidas. Faça login novamente.',
        origem,
      };
    }

    if (
      erro.statusHttp === 403 ||
      erro.codigo === 'SEM_PERMISSAO' ||
      erro.codigo === 'USUARIO_DESATIVADO'
    ) {
      return {
        tipo: 'permissao',
        mensagem: 'Você não possui permissão para executar esta ação.',
        origem,
      };
    }

    if (erro.statusHttp === 400 || erro.codigo === 'VALIDACAO') {
      return {
        tipo: 'validacao',
        mensagem: sanitizar(erro.message || 'Dados inválidos na requisição.'),
        origem,
      };
    }

    if (erro.statusHttp === 409 || erro.codigo === 'CONFLITO') {
      return {
        tipo: 'conflito',
        mensagem: sanitizar(erro.message || 'Conflito de estado do registro.'),
        origem,
      };
    }

    if (erro.statusHttp === 429 || erro.codigo === 'LIMITE_EXCEDIDO') {
      return {
        tipo: 'servidor',
        mensagem: 'Muitas tentativas incorretas. Aguarde 60 segundos antes de tentar novamente.',
        origem,
      };
    }

    if (erro.codigo === 'TIMEOUT' || erro.codigo === 'FALHA_CONEXAO') {
      return {
        tipo: 'rede',
        mensagem: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
        origem,
      };
    }

    if (
      erro.statusHttp === 503 ||
      erro.statusHttp === 500 ||
      erro.codigo === 'BANCO_INDISPONIVEL' ||
      erro.codigo === 'ERRO_INTERNO'
    ) {
      return {
        tipo: 'servidor',
        mensagem: sanitizar(erro.message || 'O servidor da API está temporariamente indisponível.'),
        origem,
      };
    }

    return {
      tipo: 'desconhecido',
      mensagem: sanitizar(erro.message || 'Ocorreu um erro no servidor.'),
      origem,
    };
  }

  if (erro instanceof Error) {
    const msgLower = erro.message.toLowerCase();
    if (
      erro.name === 'AbortError' ||
      msgLower.includes('network') ||
      msgLower.includes('fetch') ||
      msgLower.includes('conexão') ||
      msgLower.includes('failed to fetch')
    ) {
      return {
        tipo: 'rede',
        mensagem: 'Falha de conexão com a internet. Verifique sua rede e tente novamente.',
        origem,
      };
    }

    return {
      tipo: 'desconhecido',
      mensagem: sanitizar(erro.message),
      origem,
    };
  }

  return {
    tipo: 'desconhecido',
    mensagem: 'Ocorreu um erro inesperado no aplicativo.',
    origem,
  };
}

/**
 * Registra o evento de erro no buffer em memória (máximo 50 itens)
 * e, em ambiente __DEV__, emite um alerta seguro sem dados pessoais ou tokens.
 */
export function registrarErro(origem: string, erro: unknown): ErroClassificado {
  const classificado = classificarErro(erro, origem);

  let statusOuCodigo: string | number | undefined;
  if (erro instanceof ErroApi) {
    statusOuCodigo = erro.codigo || erro.statusHttp;
  }

  bufferErros.push({
    dataHora: new Date().toISOString(),
    origem: sanitizar(origem),
    tipo: classificado.tipo,
    statusOuCodigo,
  });

  if (bufferErros.length > LIMITE_BUFFER) {
    bufferErros.shift();
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[${origem}] [${classificado.tipo}] ${classificado.mensagem}`);
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
