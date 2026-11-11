import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extrairHost } from '../src/utils/host';

describe('extrairHost (utilitário de host da API)', () => {
  it('deve extrair o host com porta de uma URL HTTP completa', () => {
    assert.equal(extrairHost('http://192.168.1.50:3333/v1'), '192.168.1.50:3333');
    assert.equal(extrairHost('http://localhost:8081'), 'localhost:8081');
  });

  it('deve extrair o host sem porta de uma URL HTTPS', () => {
    assert.equal(extrairHost('https://api.misterfit.com.br/v1/alunos'), 'api.misterfit.com.br');
    assert.equal(extrairHost('https://academia-api.exemplo.org'), 'academia-api.exemplo.org');
  });

  it('deve lidar com valores vazios e indefinidos de forma segura', () => {
    assert.equal(extrairHost(''), '');
    assert.equal(extrairHost(undefined), '');
  });
});
