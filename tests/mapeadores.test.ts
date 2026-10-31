import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapearAluno,
  mapearAlunoParaEnvio,
  mapearMatricula,
  mapearPlano,
  mapearUsuario,
} from '../src/api/mapeadores';
import type {
  AlunoDTO,
  MatriculaDTO,
  PlanoDTO,
  UsuarioDTO,
} from '../src/api/tipos';

describe('Mapeadores de Dados (DTO <-> Domínio)', () => {
  it('deve mapear UsuarioDTO corretamente', () => {
    const dto: UsuarioDTO = {
      id: 1,
      nome: 'Administrador Geral',
      login: 'admin.mister',
      perfil: 'admin',
    };
    const usuario = mapearUsuario(dto);
    assert.deepEqual(usuario, {
      id: 1,
      nome: 'Administrador Geral',
      login: 'admin.mister',
      perfil: 'admin',
    });
  });

  it('deve mapear PlanoDTO para camelCase', () => {
    const dto: PlanoDTO = {
      id: 10,
      nome: 'Plano Fit Plus',
      preco: 129.9,
      duracao_meses: 6,
      descricao: 'Acesso completo a musculação e lutas',
      destaque: true,
      recursos: [{ descricao: 'Livre acesso' }, { descricao: 'Armário' }],
    };
    const plano = mapearPlano(dto);
    assert.equal(plano.id, 10);
    assert.equal(plano.nome, 'Plano Fit Plus');
    assert.equal(plano.duracaoMeses, 6);
    assert.equal(plano.destaque, true);
    assert.equal(plano.recursos.length, 2);
  });

  it('deve mapear AlunoDTO preservando status e campos', () => {
    const dto: AlunoDTO = {
      id: 42,
      nome: 'Carlos Drummond',
      data_nascimento: '1985-10-31',
      telefone: '84999998888',
      ativo: true,
      plano_nome: 'Fit',
      status_matricula: 'ativa',
    };
    const aluno = mapearAluno(dto);
    assert.equal(aluno.id, 42);
    assert.equal(aluno.nome, 'Carlos Drummond');
    assert.equal(aluno.dataNascimento, '1985-10-31');
    assert.equal(aluno.telefone, '84999998888');
    assert.equal(aluno.ativo, true);
    assert.equal(aluno.planoNome, 'Fit');
    assert.equal(aluno.statusMatricula, 'ativa');
  });

  it('deve preparar dados de aluno para envio convertendo telefone vazio para null', () => {
    const comTelefone = mapearAlunoParaEnvio(
      'Mariana Lima',
      '1992-04-12',
      '(84) 98888-1234'
    );
    assert.deepEqual(comTelefone, {
      nome: 'Mariana Lima',
      data_nascimento: '1992-04-12',
      telefone: '84988881234',
    });

    const semTelefone = mapearAlunoParaEnvio('Mariana Lima', '1992-04-12', '   ');
    assert.deepEqual(semTelefone, {
      nome: 'Mariana Lima',
      data_nascimento: '1992-04-12',
      telefone: null,
    });
  });

  it('deve mapear MatriculaDTO corretamente com campos snake_case', () => {
    const dto: MatriculaDTO = {
      id: 7,
      id_aluno: 15,
      id_plano: 2,
      data_inicio: '2026-01-01',
      data_fim_estimada: '2026-07-01',
      status: 'ativa',
      aluno_nome: 'Roberto Carlos',
      plano_nome: 'Semestral',
    };
    const matricula = mapearMatricula(dto);
    assert.equal(matricula.id, 7);
    assert.equal(matricula.idAluno, 15);
    assert.equal(matricula.idPlano, 2);
    assert.equal(matricula.dataInicio, '2026-01-01');
    assert.equal(matricula.dataFimEstimada, '2026-07-01');
    assert.equal(matricula.status, 'ativa');
    assert.equal(matricula.alunoNome, 'Roberto Carlos');
    assert.equal(matricula.planoNome, 'Semestral');
  });
});
