import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ErroDaApi } from '../src/api/cliente';
import {
  ErroDeValidacao,
  ErroDoBanco,
  classificarErro,
  limparEventosErro,
  obterEventosErro,
  registrarErro,
  sanitizar,
} from '../src/erros/erros';

describe('Tratamento Central de Erros (M8-R1, M8-R3)', () => {
  describe('sanitizar', () => {
    it('deve mascarar tokens de autenticação Bearer', () => {
      const entrada = 'Falha com Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.def';
      const saida = sanitizar(entrada);
      assert.match(saida, /Bearer \[TOKEN_OCULTO\]/);
      assert.equal(saida.includes('eyJhbGciOiJIUzI1NiJ9'), false);
    });

    it('deve mascarar emails pessoais', () => {
      const entrada = 'Erro com usuario carlos.drummond@exemplo.com.br';
      const saida = sanitizar(entrada);
      assert.match(saida, /\[EMAIL_OCULTO\]/);
      assert.equal(saida.includes('carlos.drummond@exemplo.com.br'), false);
    });

    it('deve mascarar CPFs e telefones', () => {
      const entrada = 'Dados: CPF 123.456.789-00 e Tel (84) 98888-1234';
      const saida = sanitizar(entrada);
      assert.match(saida, /\[CPF_OCULTO\]/);
      assert.match(saida, /\[TELEFONE_OCULTO\]/);
    });

    it('deve lidar com valores vazios', () => {
      assert.equal(sanitizar(''), '');
    });
  });

  describe('classificarErro', () => {
    it('deve classificar ErroDeValidacao como erro de validacao', () => {
      const erro = new ErroDeValidacao('Nome muito curto');
      const res = classificarErro(erro);
      assert.equal(res.tipo, 'validacao');
      assert.equal(res.mensagem, 'Nome muito curto');
      assert.match(res.detalhe, /ErroDeValidacao: Nome muito curto/);
    });

    it('deve classificar ErroDoBanco como erro de banco', () => {
      const erro = new ErroDoBanco('Falha no disco');
      const res = classificarErro(erro);
      assert.equal(res.tipo, 'banco');
      assert.match(res.mensagem, /aparelho/i);
    });

    it('deve classificar HTTP 401 como erro de api', () => {
      const erro = new ErroDaApi('Não autenticado', 'NAO_AUTENTICADO', 401);
      const res = classificarErro(erro);
      assert.equal(res.tipo, 'api');
      assert.match(res.mensagem, /sessão/i);
    });

    it('deve classificar HTTP 403 como erro de api', () => {
      const erro = new ErroDaApi('Sem permissão', 'SEM_PERMISSAO', 403);
      const res = classificarErro(erro);
      assert.equal(res.tipo, 'api');
      assert.match(res.mensagem, /permissão/i);
    });

    it('deve classificar HTTP 400 como erro de api com detalhes', () => {
      const erro = new ErroDaApi('Data de nascimento inválida', 'VALIDACAO', 400);
      const res = classificarErro(erro);
      assert.equal(res.tipo, 'api');
      assert.equal(res.mensagem, 'Data de nascimento inválida');
    });

    it('deve classificar HTTP 409 como erro de api de conflito', () => {
      const erro = new ErroDaApi('Aluno já possui matrícula ativa', 'CONFLITO', 409);
      const res = classificarErro(erro);
      assert.equal(res.tipo, 'api');
      assert.equal(res.mensagem, 'Aluno já possui matrícula ativa');
    });

    it('deve classificar TIMEOUT ou FALHA_CONEXAO como erro de rede', () => {
      const erroTimeout = new ErroDaApi('Tempo limite', 'TIMEOUT', 408);
      assert.equal(classificarErro(erroTimeout).tipo, 'rede');

      const erroConexao = new ErroDaApi('Falha de rede', 'FALHA_CONEXAO', 503);
      assert.equal(classificarErro(erroConexao).tipo, 'rede');
    });

    it('deve classificar falha nativa de fetch como erro de rede', () => {
      const erroRede = new Error('Network request failed');
      const res = classificarErro(erroRede);
      assert.equal(res.tipo, 'rede');
      assert.match(res.mensagem, /conexão com o servidor/i);
    });
  });

  describe('registrarErro e buffer em memória', () => {
    it('deve registrar eventos no buffer com limite máximo de 50', () => {
      limparEventosErro();
      assert.equal(obterEventosErro().length, 0);

      // Registra 55 erros
      for (let i = 1; i <= 55; i++) {
        registrarErro(`Origem_${i}`, new Error(`Falha ${i}`));
      }

      const eventos = obterEventosErro();
      assert.equal(eventos.length, 50);
      // O primeiro deve ser o item 6 (1 a 5 descartados)
      assert.equal(eventos[0].origem, 'Origem_6');
      assert.equal(eventos[49].origem, 'Origem_55');
    });
  });
});
