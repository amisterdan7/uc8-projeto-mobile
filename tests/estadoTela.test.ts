import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  estadoCarregando,
  estadoErro,
  estadoSucesso,
  semCaso,
  type EstadoTela,
} from '../src/types/estadoTela';

describe('Estados de Tela por União Discriminada (M6-R5)', () => {
  it('deve instanciar estado de carregamento', () => {
    const estado = estadoCarregando<number[]>();
    assert.deepEqual(estado, { tipo: 'carregando' });
  });

  it('deve instanciar estado de erro com mensagem', () => {
    const estado = estadoErro<string>('Erro de conexão');
    assert.deepEqual(estado, { tipo: 'erro', mensagem: 'Erro de conexão' });
  });

  it('deve instanciar estado de sucesso com dados tipados', () => {
    const estado = estadoSucesso<string[]>(['Basic', 'Fit']);
    assert.deepEqual(estado, { tipo: 'sucesso', dados: ['Basic', 'Fit'] });
  });

  it('deve permitir switch exaustivo discriminado', () => {
    function processar(e: EstadoTela<number>): string {
      switch (e.tipo) {
        case 'carregando':
          return 'Em andamento';
        case 'erro':
          return `Falhou: ${e.mensagem}`;
        case 'sucesso':
          return `Recebido: ${e.dados}`;
        default:
          return semCaso(e);
      }
    }

    assert.equal(processar(estadoCarregando()), 'Em andamento');
    assert.equal(processar(estadoErro('404')), 'Falhou: 404');
    assert.equal(processar(estadoSucesso(42)), 'Recebido: 42');
  });

  it('deve disparar exceção ao chamar semCaso', () => {
    assert.throws(
      () => semCaso('invalido' as never),
      /Caso não tratado em união discriminada/
    );
  });
});
