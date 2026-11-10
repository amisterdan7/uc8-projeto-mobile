import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cores, espacos, larguraLarga, pesos, raio, raios } from '../src/tema/tema';
import { colors } from '../src/styles/colors';

describe('Tokens do Tema MisterFit (V1, V6, A1)', () => {
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

  it('deve exportar a tabela de pesos de fonte Inter com chaves numericas 300 a 800 (A1)', () => {
    assert.equal(pesos[300], '300');
    assert.equal(pesos[400], '400');
    assert.equal(pesos[500], '500');
    assert.equal(pesos[600], '600');
    assert.equal(pesos[700], '700');
    assert.equal(pesos[800], '800');
    assert.equal(pesos.normal, '400');
    assert.equal(pesos.negrito, '700');
  });

  it('deve garantir existencia segura de escalas de cores numericas em colors (A1)', () => {
    assert.equal(colors.yellow[300], cores.alerta);
    assert.equal(colors.yellow[400], cores.alerta);
    assert.equal(colors.gray[400], cores.textoSecundario);
    assert.equal(colors.blue[400], cores.primaria);
    assert.equal(colors.red[400], cores.erro);
    assert.equal(colors.green[300], cores.sucesso);
  });
});
