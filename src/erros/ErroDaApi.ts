export interface DetalheErroApi {
  campo: string;
  mensagem: string;
}

export class ErroDaApi extends Error {
  readonly codigo: string;
  readonly status: number;
  readonly statusHttp: number;
  readonly detalhes?: DetalheErroApi[];

  constructor(
    mensagem: string,
    codigo: string = 'ERRO_DESCONHECIDO',
    status: number = 500,
    detalhes?: DetalheErroApi[]
  ) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.codigo = codigo;
    this.status = status;
    this.statusHttp = status;
    this.detalhes = detalhes;
  }
}

export { ErroDaApi as ErroApi };
