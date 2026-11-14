import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ehEnderecoLocal } from '../src/utils/urlApi';

describe('Validação de Endereço da API - ehEnderecoLocal', () => {
  it('deve retornar true para http://localhost:3333', () => {
    assert.equal(ehEnderecoLocal('http://localhost:3333'), true);
  });

  it('deve retornar true para http://127.0.0.1:3333 e ::1', () => {
    assert.equal(ehEnderecoLocal('http://127.0.0.1:3333'), true);
    assert.equal(ehEnderecoLocal('http://[::1]:3333'), true);
    assert.equal(ehEnderecoLocal('::1'), true);
  });

  it('deve retornar false para endereço IP na rede local (http://192.168.0.64:3333)', () => {
    assert.equal(ehEnderecoLocal('http://192.168.0.64:3333'), false);
  });

  it('deve retornar false para string vazia', () => {
    assert.equal(ehEnderecoLocal(''), false);
    assert.equal(ehEnderecoLocal('   '), false);
  });

  it('deve retornar false para URL com /v1 no fim', () => {
    assert.equal(ehEnderecoLocal('http://192.168.0.64:3333/v1'), false);
    assert.equal(ehEnderecoLocal('https://api.exemplo.com/v1'), false);
  });
});
