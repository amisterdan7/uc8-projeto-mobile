import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapearAluno,
  mapearAlunoParaEnvio,
  mapearMatricula,
  mapearPlano,
  mapearRespostaCriacaoAluno,
  mapearUsuario,
  ERRO_RESPOSTA_INESPERADA,
} from '../src/api/mapeadores';
import {
  fixturesAluno,
  fixturesMatricula,
  fixturesPlano,
  fixturesUsuario,
} from './fixtures';

describe('Mapeadores de Dados e Tolerancia do Contrato (C1)', () => {
  describe('mapearUsuario', () => {
    it('deve mapear UsuarioDTO valido', () => {
      const u = mapearUsuario(fixturesUsuario.valido);
      assert.equal(u.id, 1);
      assert.equal(u.nome, 'Carlos Silva');
      assert.equal(u.login, 'carlos.recepcao');
      assert.equal(u.perfil, 'recepcao');
      assert.equal(u.ativo, true);
    });

    it('deve ignorar campos extras e manter valores essenciais', () => {
      const u = mapearUsuario(fixturesUsuario.comNulosECamposExtras);
      assert.equal(u.id, 2);
      assert.equal(u.nome, 'Ana Administradora');
      assert.equal(u.login, 'ana.admin');
      assert.equal(u.perfil, 'admin');
      assert.equal(u.ativo, true);
      assert.equal('metadados_extras' in u, false);
    });

    it('deve lancar mensagem amigavel se formato divergir', () => {
      assert.throws(
        () => mapearUsuario(fixturesUsuario.invalidoSemId),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );

      assert.throws(
        () => mapearUsuario(fixturesUsuario.invalidoPerfilIncorreto),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );

      assert.throws(
        () => mapearUsuario(null),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );
    });
  });

  describe('mapearPlano', () => {
    it('deve mapear PlanoDTO valido com snake_case para camelCase', () => {
      const p = mapearPlano(fixturesPlano.valido);
      assert.equal(p.id, 10);
      assert.equal(p.nome, 'Fit Plus');
      assert.equal(p.preco, 129.9);
      assert.equal(p.duracaoMeses, 6);
      assert.equal(p.descricao, 'Acesso completo a musculacao e lutas');
      assert.equal(p.destaque, true);
      assert.equal(p.recursos.length, 2);
      assert.equal(p.recursos[0].descricao, 'Livre acesso');
    });

    it('deve aceitar descricao e recursos nulos, ignorando campos adicionais', () => {
      const p = mapearPlano(fixturesPlano.comNulosECamposExtras);
      assert.equal(p.id, 11);
      assert.equal(p.nome, 'Basico');
      assert.equal(p.preco, 79.0);
      assert.equal(p.duracaoMeses, 1);
      assert.equal(p.descricao, null);
      assert.equal(p.destaque, false);
      assert.deepEqual(p.recursos, []);
      assert.equal('campo_desconhecido' in p, false);
    });

    it('deve lancar erro se preco ou duracao nao forem numericos', () => {
      assert.throws(
        () => mapearPlano(fixturesPlano.invalidoPrecoNaoNumerico),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );

      assert.throws(
        () => mapearPlano(fixturesPlano.invalidoSemNome),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );
    });
  });

  describe('mapearAluno', () => {
    it('deve mapear AlunoDTO completo', () => {
      const a = mapearAluno(fixturesAluno.valido);
      assert.equal(a.id, 101);
      assert.equal(a.nome, 'Mariana Santos');
      assert.equal(a.dataNascimento, '1995-07-20');
      assert.equal(a.telefone, '8499887766');
      assert.equal(a.ativo, true);
      assert.equal(a.planoNome, 'Fit Plus');
      assert.equal(a.statusMatricula, 'ativa');
    });

    it('deve aceitar telefone nulo e plano_nome nulo', () => {
      const a = mapearAluno(fixturesAluno.comNulosECamposExtras);
      assert.equal(a.id, 102);
      assert.equal(a.nome, 'Pedro Alvares');
      assert.equal(a.telefone, null);
      assert.equal(a.ativo, false);
      assert.equal(a.planoNome, null);
      assert.equal(a.statusMatricula, 'sem_matricula');
      assert.equal('cpf_antigo' in a, false);
    });

    it('deve rejeitar se faltar data_nascimento ou se telefone tiver tipo incorreto', () => {
      assert.throws(
        () => mapearAluno(fixturesAluno.invalidoDataInexistente),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );

      assert.throws(
        () => mapearAluno(fixturesAluno.invalidoTelefoneNaoString),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );
    });

    it('deve preparar dados para envio limpando telefone ou gerando null', () => {
      const comTel = mapearAlunoParaEnvio('Lucas', '1999-01-01', '(84) 99999-1234');
      assert.equal(comTel.telefone, '84999991234');

      const semTel = mapearAlunoParaEnvio('Lucas', '1999-01-01', '');
      assert.equal(semTel.telefone, null);

      const nuloTel = mapearAlunoParaEnvio('Lucas', '1999-01-01', null);
      assert.equal(nuloTel.telefone, null);
      assert.equal('id_plano' in nuloTel, false);
      assert.equal('data_inicio' in nuloTel, false);

      const comPlanoEInicio = mapearAlunoParaEnvio(
        'Lucas',
        '1999-01-01',
        '(84) 99999-1234',
        10,
        '2026-04-17'
      );
      assert.equal(comPlanoEInicio.id_plano, 10);
      assert.equal(comPlanoEInicio.data_inicio, '2026-04-17');
    });

    it('deve mapear resposta de criacao de aluno com e sem matricula', () => {
      const semMatricula = mapearRespostaCriacaoAluno(fixturesAluno.criadoSemMatricula);
      assert.equal(semMatricula.aluno.id, 105);
      assert.equal(semMatricula.aluno.nome, 'Aluno Sem Plano Inicial');
      assert.equal(semMatricula.aluno.ativo, true);
      assert.equal(semMatricula.aluno.statusMatricula, 'sem_matricula');
      assert.equal(semMatricula.matricula, undefined);

      const comMatricula = mapearRespostaCriacaoAluno(fixturesAluno.criadoComMatricula);
      assert.equal(comMatricula.aluno.id, 106);
      assert.equal(comMatricula.aluno.nome, 'Aluno Com Plano Inicial');
      assert.equal(comMatricula.aluno.statusMatricula, 'ativa');
      assert.ok(comMatricula.matricula);
      assert.equal(comMatricula.matricula.id, 601);
      assert.equal(comMatricula.matricula.idAluno, 106);
      assert.equal(comMatricula.matricula.idPlano, 10);
      assert.equal(comMatricula.matricula.dataInicio, '2026-04-17');
      assert.equal(comMatricula.matricula.dataFimEstimada, '2026-10-17');
      assert.equal(comMatricula.matricula.status, 'ativa');
    });
  });

  describe('mapearMatricula', () => {
    it('deve mapear MatriculaDTO valida', () => {
      const m = mapearMatricula(fixturesMatricula.valida);
      assert.equal(m.id, 501);
      assert.equal(m.idAluno, 101);
      assert.equal(m.idPlano, 10);
      assert.equal(m.dataInicio, '2026-02-01');
      assert.equal(m.dataFimEstimada, '2026-08-01');
      assert.equal(m.status, 'ativa');
      assert.equal(m.alunoNome, 'Mariana Santos');
      assert.equal(m.planoNome, 'Fit Plus');
    });

    it('deve aceitar campos opcionais nulos ou ausentes', () => {
      const m = mapearMatricula(fixturesMatricula.comNulosECamposExtras);
      assert.equal(m.id, 502);
      assert.equal(m.idAluno, 102);
      assert.equal(m.idPlano, 11);
      assert.equal(m.status, 'vencida');
      assert.equal(m.alunoNome, undefined);
      assert.equal(m.planoNome, undefined);
      assert.equal('observacao_financeira' in m, false);
    });

    it('deve rejeitar se status for desconhecido ou ids faltarem', () => {
      assert.throws(
        () => mapearMatricula(fixturesMatricula.invalidaSemIds),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );

      assert.throws(
        () => mapearMatricula(fixturesMatricula.invalidaStatusInexistente),
        (erro: Error) => erro.message.includes(ERRO_RESPOSTA_INESPERADA)
      );
    });
  });
});
