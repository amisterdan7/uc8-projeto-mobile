import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ErroDaApi } from '../src/erros/ErroDaApi';
import { decidirAoFalharSessao } from '../src/utils/sessao';

describe('Restauração de Sessão - decidirAoFalharSessao', () => {
  it('deve retornar limpar para 401 NAO_AUTENTICADO', () => {
    const erro = new ErroDaApi('Token inválido ou expirado.', 'NAO_AUTENTICADO', 401);
    assert.equal(decidirAoFalharSessao(erro), 'limpar');
  });

  it('deve retornar limpar para 403 USUARIO_DESATIVADO', () => {
    const erro = new ErroDaApi('Usuário desativado.', 'USUARIO_DESATIVADO', 403);
    assert.equal(decidirAoFalharSessao(erro), 'limpar');
  });

  it('deve retornar manter para FALHA_CONEXAO', () => {
    const erro = new ErroDaApi('Sem conexão com o servidor.', 'FALHA_CONEXAO', 503);
    assert.equal(decidirAoFalharSessao(erro), 'manter');
  });

  it('deve retornar manter para TIMEOUT', () => {
    const erro = new ErroDaApi('Tempo limite excedido.', 'TIMEOUT', 408);
    assert.equal(decidirAoFalharSessao(erro), 'manter');
  });

  it('deve retornar manter para erro HTTP 503', () => {
    const erro = new ErroDaApi('Servidor indisponível.', 'HTTP_503', 503);
    assert.equal(decidirAoFalharSessao(erro), 'manter');
  });

  it('deve retornar manter para erro comum (new Error)', () => {
    const erro = new Error('Network request failed');
    assert.equal(decidirAoFalharSessao(erro), 'manter');
  });
});
