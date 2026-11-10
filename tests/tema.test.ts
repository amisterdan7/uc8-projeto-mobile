import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cores, espacos, larguraLarga, raio, raios } from '../src/tema/tema';

describe('Tokens do Tema MisterFit (V1, V6)', () => {
  it('deve exportar as cores oficiais do desktop da Academia MisterFit', () => {
    assert.equal(cores.fundo, '#121214');
    assert.equal(cores.cartao, '#1e1e22');
    assert.equal(cores.superficie, '#1e1e22');
    assert.equal(cores.borda, '#27272a');
    assert.equal(cores.texto, '#ffffff');
    assert.equal(cores.textoSecundario, '#a1a1aa');
    assert.equal(cores.primaria, '#ff5b24');
    assert.equal(cores.sucesso, '#10b981');
    assert.equal(cores.alerta, '#f59e0b');
    assert.equal(cores.erro, '#ef4444');
    assert.equal(cores.info, '#06b6d4');
  });

  it('deve exportar os raios 6, 8, 12 e 16', () => {
    assert.equal(raios.sm, 6);
    assert.equal(raios.md, 8);
    assert.equal(raios.lg, 12);
    assert.equal(raios.xl, 16);
    assert.equal(raios.pequeno, 6);
    assert.equal(raios.medio, 8);
    assert.equal(raios.grande, 12);
    assert.equal(raios.cartaoPlano, 16);
    assert.equal(raio, 8);
  });

  it('deve exportar os espaçamentos xs 4, sm 8, md 16, lg 24 e larguraLarga 600', () => {
    assert.deepEqual(espacos, {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    });
    assert.equal(larguraLarga, 600);
  });
});
