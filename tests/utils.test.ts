import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  aplicarMascaraData,
  dataBRparaISO,
  formatarDataBR,
  validarDataNascimentoBR,
} from '../src/utils/datas';
import {
  aplicarMascaraTelefone,
  formatarTelefone,
  limparTelefone,
} from '../src/utils/telefone';
import { formatarMoedaBRL } from '../src/utils/moeda';

describe('Utilitários de Data', () => {
  it("deve formatar data ISO '2026-10-08' para '08/10/2026' sem usar Date", () => {
    assert.equal(formatarDataBR('2026-10-08'), '08/10/2026');
  });

  it('deve extrair e formatar data ISO com horário sem sofrer com fuso', () => {
    assert.equal(formatarDataBR('2026-10-08T00:00:00.000Z'), '08/10/2026');
  });

  it('deve lidar com valores vazios e nulos com segurança', () => {
    assert.equal(formatarDataBR(null), '');
    assert.equal(formatarDataBR(undefined), '');
    assert.equal(formatarDataBR(''), '');
  });

  it("deve converter data brasileira '08/10/2026' para ISO '2026-10-08'", () => {
    assert.equal(dataBRparaISO('08/10/2026'), '2026-10-08');
  });

  it('deve validar datas de nascimento reais no passado', () => {
    const resValido = validarDataNascimentoBR('15/05/1995');
    assert.equal(resValido.valida, true);
  });

  it('deve rejeitar anos inferiores a 1900', () => {
    const res = validarDataNascimentoBR('01/01/1899');
    assert.equal(res.valida, false);
    assert.match(res.mensagem || '', /1900/);
  });

  it('deve rejeitar datas futuras ou no dia de hoje', () => {
    const res = validarDataNascimentoBR('01/01/2099');
    assert.equal(res.valida, false);
    assert.match(res.mensagem || '', /anterior/);
  });

  it('deve rejeitar dias inexistentes no calendário (ex: 31 de abril)', () => {
    const res = validarDataNascimentoBR('31/04/2000');
    assert.equal(res.valida, false);
  });

  it('deve aplicar máscara progressiva em digitação de data', () => {
    assert.equal(aplicarMascaraData('08'), '08');
    assert.equal(aplicarMascaraData('0810'), '08/10');
    assert.equal(aplicarMascaraData('08102026'), '08/10/2026');
  });
});

describe('Utilitários de Telefone', () => {
  it('deve limpar caracteres não numéricos', () => {
    assert.equal(limparTelefone('(84) 99999-1234'), '84999991234');
    assert.equal(limparTelefone(''), '');
    assert.equal(limparTelefone(null), '');
  });

  it('deve aplicar máscara em telefone celular de 11 dígitos', () => {
    assert.equal(aplicarMascaraTelefone('84999991234'), '(84) 99999-1234');
  });

  it('deve formatar telefone com mensagem padrão quando vazio', () => {
    assert.equal(formatarTelefone(null), 'Não informado');
    assert.equal(formatarTelefone(''), 'Não informado');
    assert.equal(formatarTelefone('84988887777'), '(84) 98888-7777');
  });
});

describe('Utilitários de Moeda', () => {
  it('deve formatar valores em BRL', () => {
    const formatado = formatarMoedaBRL(89.9);
    // Deve conter R$ e 89,90
    assert.match(formatado, /R\$\s?89,90/);
  });

  it('deve retornar R$ 0,00 para valor nulo ou indefinido', () => {
    const formatado = formatarMoedaBRL(null);
    assert.match(formatado, /R\$\s?0,00/);
  });
});
