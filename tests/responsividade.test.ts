import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { colunasPara } from '../src/utils/responsividade';

describe('Responsividade (M5-R3) - colunasPara', () => {
  it('deve retornar 1 coluna para larguras de celular menores que 600px', () => {
    assert.equal(colunasPara(360), 1);
    assert.equal(colunasPara(414), 1);
    assert.equal(colunasPara(599), 1);
  });

  it('deve retornar 2 colunas para larguras entre 600px e 899px (tablet/paisagem)', () => {
    assert.equal(colunasPara(600), 2);
    assert.equal(colunasPara(768), 2);
    assert.equal(colunasPara(899), 2);
  });

  it('deve retornar 3 colunas para telas a partir de 900px (desktop/telas grandes)', () => {
    assert.equal(colunasPara(900), 3);
    assert.equal(colunasPara(1024), 3);
    assert.equal(colunasPara(1440), 3);
  });
});
