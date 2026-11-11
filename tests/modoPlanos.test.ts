import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ehPlanoRemoto,
  ehListaDePlanos,
  paraPlano,
  type PlanoRemoto,
  type DadosNovoPlano,
  type PlanoAcademia,
} from '../src/servicos/planosSupabase';
import {
  validarDadosPlano,
  sincronizarFila,
  type PendenteSincronizavel,
} from '../src/servicos/planosSincronizacao';
import { ErroDeValidacao } from '../src/erros/erros';
import { ErroDaApi } from '../src/api/cliente';

describe('Modo Planos (Supabase/SQLite) - Funções Puras e Lógica de Negócio (M6-R4, M7-R5, M8-R4)', () => {
  describe('Type Guards (ehPlanoRemoto e ehListaDePlanos)', () => {
    it('deve validar um objeto PlanoRemoto válido', () => {
      const objetoValido = {
        id: 1,
        nome: 'Mensal',
        preco: 99.9,
        duracao_meses: 1,
        descricao: 'Plano básico',
      };
      assert.equal(ehPlanoRemoto(objetoValido), true);
    });

    it('deve aceitar preco como string vinda da API Postgres numeric', () => {
      const objetoNumeric = {
        id: 2,
        nome: 'Trimestral',
        preco: '269.70',
        duracao_meses: 3,
        descricao: null,
      };
      assert.equal(ehPlanoRemoto(objetoNumeric), true);
    });

    it('deve rejeitar valores nulos ou tipos incorretos', () => {
      assert.equal(ehPlanoRemoto(null), false);
      assert.equal(ehPlanoRemoto(undefined), false);
      assert.equal(ehPlanoRemoto('texto'), false);
      assert.equal(ehPlanoRemoto({ id: 'invalido' }), false);
      assert.equal(
        ehPlanoRemoto({ id: 1, nome: 'Sem preco', duracao_meses: 1, descricao: null }),
        false
      );
    });

    it('deve validar listas homogêneas de planos remotos', () => {
      const listaValida = [
        { id: 1, nome: 'A', preco: 10, duracao_meses: 1, descricao: null },
        { id: 2, nome: 'B', preco: 20, duracao_meses: 2, descricao: 'Desc' },
      ];
      assert.equal(ehListaDePlanos(listaValida), true);

      const listaInvalida = [
        { id: 1, nome: 'A', preco: 10, duracao_meses: 1, descricao: null },
        { id: 'errado' },
      ];
      assert.equal(ehListaDePlanos(listaInvalida), false);
      assert.equal(ehListaDePlanos('não é array'), false);
    });
  });

  describe('Conversão (paraPlano)', () => {
    it('deve mapear snake_case para camelCase e converter preco para number', () => {
      const remoto: PlanoRemoto = {
        id: 10,
        nome: 'Anual VIP',
        preco: '899.00',
        duracao_meses: 12,
        descricao: 'Acesso total',
      };
      const plano = paraPlano(remoto);
      assert.equal(plano.id, 10);
      assert.equal(plano.nome, 'Anual VIP');
      assert.equal(plano.preco, 899.0);
      assert.equal(plano.duracaoMeses, 12);
      assert.equal(plano.descricao, 'Acesso total');
    });

    it('deve converter descricao null para undefined', () => {
      const remoto: PlanoRemoto = {
        id: 11,
        nome: 'Básico',
        preco: 50,
        duracao_meses: 1,
        descricao: null,
      };
      const plano = paraPlano(remoto);
      assert.equal(plano.descricao, undefined);
    });
  });

  describe('Validação de Entrada (validarDadosPlano)', () => {
    it('deve aceitar dados válidos de plano', () => {
      assert.doesNotThrow(() => {
        validarDadosPlano({
          nome: 'Semestral',
          preco: 450,
          duracao_meses: 6,
          descricao: 'Treino semestral',
        });
      });
    });

    it('deve rejeitar nome vazio', () => {
      assert.throws(
        () => {
          validarDadosPlano({
            nome: '   ',
            preco: 100,
            duracao_meses: 1,
          });
        },
        { name: 'ErroDeValidacao', message: /Informe o nome do plano/ }
      );
    });

    it('deve rejeitar preco negativo ou NaN', () => {
      assert.throws(
        () => {
          validarDadosPlano({
            nome: 'Plano Negativo',
            preco: -10,
            duracao_meses: 1,
          });
        },
        { name: 'ErroDeValidacao', message: /maior ou igual a zero/ }
      );

      assert.throws(
        () => {
          validarDadosPlano({
            nome: 'Plano NaN',
            preco: NaN,
            duracao_meses: 1,
          });
        },
        { name: 'ErroDeValidacao' }
      );
    });

    it('deve rejeitar duracao_meses menor que 1 ou decimal', () => {
      assert.throws(
        () => {
          validarDadosPlano({
            nome: 'Plano Zero Meses',
            preco: 100,
            duracao_meses: 0,
          });
        },
        { name: 'ErroDeValidacao', message: /mínimo 1 mês/ }
      );

      assert.throws(
        () => {
          validarDadosPlano({
            nome: 'Plano Quebrado',
            preco: 100,
            duracao_meses: 2.5,
          });
        },
        { name: 'ErroDeValidacao' }
      );
    });
  });

  describe('Lógica de Sincronização da Fila (sincronizarFila)', () => {
    it('deve enviar pendentes com sucesso e removê-los da fila', async () => {
      const pendentes: PendenteSincronizavel[] = [
        { id: 1, nome: 'P1', preco: 100, duracao_meses: 1 },
        { id: 2, nome: 'P2', preco: 200, duracao_meses: 2 },
      ];
      const enviados: DadosNovoPlano[] = [];
      const removidos: number[] = [];
      const falhas: string[] = [];

      await sincronizarFila(
        async () => pendentes,
        async (dados): Promise<PlanoAcademia> => {
          enviados.push(dados);
          return {
            id: 99,
            nome: dados.nome,
            preco: dados.preco,
            duracaoMeses: dados.duracao_meses,
            descricao: dados.descricao ?? undefined,
          };
        },
        async (id) => {
          removidos.push(id);
        },
        (origem) => falhas.push(origem)
      );

      assert.equal(enviados.length, 2);
      assert.deepEqual(removidos, [1, 2]);
      assert.equal(falhas.length, 0);
    });

    it('deve descartar pendente recusado pela API (ErroDaApi) e continuar', async () => {
      const pendentes: PendenteSincronizavel[] = [
        { id: 1, nome: 'Recusado', preco: 100, duracao_meses: 1 },
        { id: 2, nome: 'Aceito', preco: 200, duracao_meses: 2 },
      ];
      const removidos: number[] = [];
      const falhas: string[] = [];

      await sincronizarFila(
        async () => pendentes,
        async (dados): Promise<PlanoAcademia> => {
          if (dados.nome === 'Recusado') {
            throw new ErroDaApi('Dados inválidos', 'HTTP_400', 400);
          }
          return {
            id: 2,
            nome: dados.nome,
            preco: dados.preco,
            duracaoMeses: dados.duracao_meses,
            descricao: dados.descricao ?? undefined,
          };
        },
        async (id) => {
          removidos.push(id);
        },
        (origem) => falhas.push(origem)
      );

      assert.deepEqual(removidos, [1, 2]);
      assert.deepEqual(falhas, ['pendente descartado']);
    });

    it('deve interromper o envio em caso de falha de rede para não reordenar', async () => {
      const pendentes: PendenteSincronizavel[] = [
        { id: 1, nome: 'FalhaRede', preco: 100, duracao_meses: 1 },
        { id: 2, nome: 'NuncaChega', preco: 200, duracao_meses: 2 },
      ];
      const removidos: number[] = [];
      const falhas: string[] = [];

      await sincronizarFila(
        async () => pendentes,
        async () => {
          throw new TypeError('Network request failed');
        },
        async (id) => {
          removidos.push(id);
        },
        (origem) => falhas.push(origem)
      );

      // Não removeu nenhum pois falhou a rede no primeiro
      assert.equal(removidos.length, 0);
    });
  });
});
