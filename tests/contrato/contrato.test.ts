import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { requisitarApi, definirTokenApi, ErroDaApi } from '../../src/api/cliente';
import { autenticarUsuario } from '../../src/api/auth';
import { criarPlano, atualizarPlano, excluirPlano, listarPlanos } from '../../src/api/planos';
import { listarUsuarios } from '../../src/api/usuarios';
import { criarAluno, excluirAluno } from '../../src/api/alunos';

if (process.env.API_URL && !process.env.EXPO_PUBLIC_API_URL) {
  process.env.EXPO_PUBLIC_API_URL = process.env.API_URL;
}

const adminLogin = process.env.TESTE_ADMIN_LOGIN;
const adminSenha = process.env.TESTE_ADMIN_SENHA;
const recepcaoLogin = process.env.TESTE_RECEPCAO_LOGIN;
const recepcaoSenha = process.env.TESTE_RECEPCAO_SENHA;
const urlApi = process.env.EXPO_PUBLIC_API_URL;

const credenciaisCompletas = Boolean(
  urlApi && adminLogin && adminSenha && recepcaoLogin && recepcaoSenha
);

const confirmouEscrita = process.env.CONFIRMO_ESCREVER === 'sim';

if (!credenciaisCompletas) {
  console.log(
    '\n[AVISO] Testes de contrato ignorados: variáveis TESTE_ADMIN_LOGIN, TESTE_ADMIN_SENHA, TESTE_RECEPCAO_LOGIN, TESTE_RECEPCAO_SENHA ou EXPO_PUBLIC_API_URL não fornecidas.\n'
  );
}

describe(
  'Testes de Contrato da API v1',
  {
    skip: !credenciaisCompletas
      ? 'Variáveis de ambiente de teste de contrato ausentes'
      : false,
  },
  () => {
    let tokenAdmin = '';
    let tokenRecepcao = '';

    it('1. Login admin: recebe token e perfil admin', async () => {
      const resposta = await autenticarUsuario(adminLogin!, adminSenha!);
      assert.ok(resposta.token, 'Token do admin deve estar preenchido');
      assert.equal(resposta.usuario.perfil, 'admin', 'Perfil deve ser admin');
      assert.ok(
        resposta.permissoes.includes('planos:criar'),
        'Admin deve ter permissao planos:criar'
      );
      tokenAdmin = resposta.token;
    });

    it('2. Login recepção: recebe token e perfil recepção', async () => {
      const resposta = await autenticarUsuario(recepcaoLogin!, recepcaoSenha!);
      assert.ok(resposta.token, 'Token da recepcao deve estar preenchido');
      assert.equal(resposta.usuario.perfil, 'recepcao', 'Perfil deve ser recepcao');
      tokenRecepcao = resposta.token;
    });

    it('3. Recepção tenta POST /planos -> recebe 403', async () => {
      definirTokenApi(tokenRecepcao);
      try {
        await requisitarApi('/planos', {
          method: 'POST',
          body: {
            nome: '[TESTE-CONTRATO] Plano Nao Autorizado',
            preco: 99,
            duracao_meses: 1,
          },
        });
        assert.fail('Recepcao nao deveria conseguir criar plano (esperado 403)');
      } catch (erro: unknown) {
        assert.ok(erro instanceof ErroDaApi, 'Erro deve ser instancia de ErroDaApi');
        assert.equal(erro.status, 403, 'Status deve ser 403');
      }
    });

    it('4. Recepção tenta GET /usuarios -> recebe 403', async () => {
      definirTokenApi(tokenRecepcao);
      try {
        await listarUsuarios();
        assert.fail('Recepcao nao deveria listar usuarios (esperado 403)');
      } catch (erro: unknown) {
        assert.ok(erro instanceof ErroDaApi, 'Erro deve ser instancia de ErroDaApi');
        assert.equal(erro.status, 403, 'Status deve ser 403');
      }
    });

    it(
      '5. Admin cria um plano de teste com prefixo [TESTE-CONTRATO], edita, lista e exclui',
      {
        skip: !confirmouEscrita
          ? 'Mutação de dados requer CONFIRMO_ESCREVER=sim no ambiente'
          : false,
      },
      async () => {
        definirTokenApi(tokenAdmin);
        let idPlanoCriado: number | null = null;
        try {
          const planoCriado = await criarPlano({
            nome: '[TESTE-CONTRATO] Plano Musculacao',
            preco: 120,
            duracao_meses: 1,
            descricao: 'Criado para teste de contrato',
          });
          idPlanoCriado = planoCriado.id;
          assert.ok(idPlanoCriado > 0, 'ID do plano criado deve ser positivo');
          assert.equal(planoCriado.nome, '[TESTE-CONTRATO] Plano Musculacao');

          const planoAtualizado = await atualizarPlano(idPlanoCriado, {
            nome: '[TESTE-CONTRATO] Plano Musculacao Editado',
            preco: 150,
            duracao_meses: 3,
            descricao: 'Descricao atualizada',
          });
          assert.equal(
            planoAtualizado.nome,
            '[TESTE-CONTRATO] Plano Musculacao Editado'
          );

          const lista = await listarPlanos();
          const encontrado = lista.find((p) => p.id === idPlanoCriado);
          assert.ok(encontrado, 'Plano criado deve estar na listagem');
        } finally {
          if (idPlanoCriado !== null) {
            try {
              await excluirPlano(idPlanoCriado);
            } catch {
              // Limpeza no finally para nao deixar residuos
            }
          }
        }
      }
    );

    it(
      '6. Aluno com CPF inválido retorna 400 com detalhes [{ campo: "cpf" }]',
      {
        skip: !confirmouEscrita
          ? 'Mutação de dados requer CONFIRMO_ESCREVER=sim no ambiente'
          : false,
      },
      async () => {
        definirTokenApi(tokenAdmin);
        try {
          await requisitarApi('/alunos', {
            method: 'POST',
            body: {
              nome: '[TESTE-CONTRATO] Aluno CPF Invalido',
              data_nascimento: '1992-04-10',
              cpf: 'cpf_totalmente_invalido',
            },
          });
          assert.fail('Deveria falhar validacao de CPF com 400');
        } catch (erro: unknown) {
          assert.ok(erro instanceof ErroDaApi);
          assert.equal(erro.status, 400);
          const detalheCpf = erro.detalhes?.find((d) => d.campo === 'cpf');
          assert.ok(
            detalheCpf,
            'Detalhes de erro devem conter campo cpf'
          );
        }
      }
    );

    it(
      '7. Aluno duplicado (mesmo nome + nascimento) retorna 409',
      {
        skip: !confirmouEscrita
          ? 'Mutação de dados requer CONFIRMO_ESCREVER=sim no ambiente'
          : false,
      },
      async () => {
        definirTokenApi(tokenAdmin);
        let idAluno: number | null = null;
        const nomeDuplicado = `[TESTE-CONTRATO] Duplicado ${Date.now()}`;
        const dataNasc = '1994-08-20';

        try {
          const primeiro = await criarAluno(nomeDuplicado, dataNasc);
          idAluno = primeiro.aluno.id;

          try {
            await criarAluno(nomeDuplicado, dataNasc);
            assert.fail('Deveria ter retornado conflito 409');
          } catch (erroDuplicado: unknown) {
            assert.ok(erroDuplicado instanceof ErroDaApi);
            assert.equal(erroDuplicado.status, 409);
          }
        } finally {
          if (idAluno !== null) {
            try {
              await excluirAluno(idAluno);
            } catch {
              // Limpeza no finally
            }
          }
        }
      }
    );
  }
);
