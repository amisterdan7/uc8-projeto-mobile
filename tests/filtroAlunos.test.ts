import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filtrarAlunos, normalizarTexto } from '../src/utils/filtroAlunos';
import type { Aluno } from '../src/types/entidades';

const alunosExemplo: Aluno[] = [
  {
    id: 1,
    nome: 'João da Silva',
    dataNascimento: '1990-05-10',
    telefone: '(11) 98765-4321',
    ativo: true,
    statusMatricula: 'ativa',
    planoNome: 'Plano Pro',
  },
  {
    id: 2,
    nome: 'Maria Conceição',
    dataNascimento: '1985-02-15',
    telefone: '(22) 99922-3344',
    ativo: true,
    statusMatricula: 'vencida',
    planoNome: 'Plano Básico',
  },
  {
    id: 3,
    nome: 'Édson José Arantes',
    dataNascimento: '1970-10-23',
    telefone: null,
    ativo: true,
    statusMatricula: 'sem_matricula',
  },
  {
    id: 4,
    nome: 'Ana Cláudia Santos',
    dataNascimento: '1998-12-01',
    telefone: null,
    ativo: false,
    statusMatricula: 'inativa',
  },
];

describe('Função Pura: filtrarAlunos (src/utils/filtroAlunos.ts)', () => {
  it('deve normalizar texto removendo acentos e convertendo para minúsculo', () => {
    assert.equal(normalizarTexto('João'), 'joao');
    assert.equal(normalizarTexto('Conceição'), 'conceicao');
    assert.equal(normalizarTexto('ÉDSON JOSÉ'), 'edson jose');
    assert.equal(normalizarTexto('  Cláudia  '), 'claudia');
  });

  it('deve retornar todos os alunos quando o termo de busca for vazio, nulo ou espaços', () => {
    assert.equal(filtrarAlunos(alunosExemplo, '').length, 4);
    assert.equal(filtrarAlunos(alunosExemplo, '   ').length, 4);
    assert.equal(filtrarAlunos(alunosExemplo, null).length, 4);
    assert.equal(filtrarAlunos(alunosExemplo, undefined).length, 4);
  });

  it('deve filtrar ignorando acentos (termo sem acento acha aluno com acento e vice-versa)', () => {
    const resultado1 = filtrarAlunos(alunosExemplo, 'joao');
    assert.equal(resultado1.length, 1);
    assert.equal(resultado1[0].id, 1);

    const resultado2 = filtrarAlunos(alunosExemplo, 'conceicao');
    assert.equal(resultado2.length, 1);
    assert.equal(resultado2[0].id, 2);

    const resultado3 = filtrarAlunos(alunosExemplo, 'edson');
    assert.equal(resultado3.length, 1);
    assert.equal(resultado3[0].id, 3);

    const resultado4 = filtrarAlunos(alunosExemplo, 'jose');
    assert.equal(resultado4.length, 1);
    assert.equal(resultado4[0].id, 3);
  });

  it('deve filtrar ignorando maiúsculas e minúsculas', () => {
    const resultado1 = filtrarAlunos(alunosExemplo, 'MARIA');
    assert.equal(resultado1.length, 1);
    assert.equal(resultado1[0].id, 2);

    const resultado2 = filtrarAlunos(alunosExemplo, 'silva');
    assert.equal(resultado2.length, 1);
    assert.equal(resultado2[0].id, 1);

    const resultado3 = filtrarAlunos(alunosExemplo, 'aNa');
    assert.equal(resultado3.length, 1);
    assert.equal(resultado3[0].id, 4);
  });

  it('deve filtrar por telefone com ou sem máscara', () => {
    // Busca por dígitos puros acha telefone formatado
    const buscaDigitos = filtrarAlunos(alunosExemplo, '987654321');
    assert.equal(buscaDigitos.length, 1);
    assert.equal(buscaDigitos[0].id, 1);

    // Busca parcial por "9992" acha "(22) 99922-3344"
    const buscaParcial = filtrarAlunos(alunosExemplo, '9992');
    assert.equal(buscaParcial.length, 1);
    assert.equal(buscaParcial[0].id, 2);

    // Busca com DDD e formatação parcial
    const buscaFormatada = filtrarAlunos(alunosExemplo, '(22) 99922');
    assert.equal(buscaFormatada.length, 1);
    assert.equal(buscaFormatada[0].id, 2);

    // Busca apenas pelos primeiros dígitos
    const buscaDdd = filtrarAlunos(alunosExemplo, '2299922');
    assert.equal(buscaDdd.length, 1);
    assert.equal(buscaDdd[0].id, 2);
  });

  it('deve lidar com alunos de telefone nulo ou indefinido sem gerar erros', () => {
    // Busca por telefone numérico não deve quebrar nem trazer alunos com telefone nulo
    const resultado = filtrarAlunos(alunosExemplo, '999999999');
    assert.equal(resultado.length, 0);

    // Busca por nome de aluno cujo telefone é nulo deve encontrá-lo perfeitamente
    const buscaNomeSemTel = filtrarAlunos(alunosExemplo, 'Arantes');
    assert.equal(buscaNomeSemTel.length, 1);
    assert.equal(buscaNomeSemTel[0].id, 3);

    const buscaNomeTelNulo = filtrarAlunos(alunosExemplo, 'Cláudia');
    assert.equal(buscaNomeTelNulo.length, 1);
    assert.equal(buscaNomeTelNulo[0].id, 4);
  });

  it('deve retornar lista vazia quando nenhum aluno corresponder ao critério', () => {
    const resultado = filtrarAlunos(alunosExemplo, 'Aluno Totalmente Inexistente');
    assert.equal(resultado.length, 0);

    const resultadoTel = filtrarAlunos(alunosExemplo, '00000000000');
    assert.equal(resultadoTel.length, 0);
  });
});
