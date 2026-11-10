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
  telefoneParaLigacao,
  urlWhatsApp,
} from '../src/utils/telefone';
import { formatarMoedaBRL } from '../src/utils/moeda';
import {
  agruparMatriculasPorAluno,
  alunosElegiveisParaMatricula,
} from '../src/utils/matriculas';
import type { Aluno, Matricula } from '../src/types/entidades';

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

  it('deve gerar link de ligação apenas se houver 10 ou mais dígitos', () => {
    assert.equal(telefoneParaLigacao('(84) 99999-1234'), 'tel:84999991234');
    assert.equal(telefoneParaLigacao('(84) 3222-1111'), 'tel:8432221111');
    assert.equal(telefoneParaLigacao('9999-1234'), null);
    assert.equal(telefoneParaLigacao(''), null);
    assert.equal(telefoneParaLigacao(null), null);
  });

  it('deve gerar URL de WhatsApp apenas para 10 ou 11 dígitos', () => {
    assert.equal(urlWhatsApp('(84) 99999-1234'), 'https://wa.me/5584999991234');
    assert.equal(urlWhatsApp('8432221111'), 'https://wa.me/558432221111');
    assert.equal(urlWhatsApp('99991234'), null);
    assert.equal(urlWhatsApp('5584999991234'), null);
    assert.equal(urlWhatsApp(null), null);
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

describe('Agrupamento de Matrículas e Elegibilidade (M4)', () => {
  it('deve agrupar matrículas por aluno (1, 2 e 3 matrículas) preservando a ordem', () => {
    const lista: Matricula[] = [
      {
        id: 10,
        idAluno: 1,
        idPlano: 2,
        dataInicio: '2026-04-01',
        dataFimEstimada: '2026-07-01',
        status: 'ativa',
        alunoNome: 'Ana',
        planoNome: 'Trimestral',
      },
      {
        id: 20,
        idAluno: 2,
        idPlano: 1,
        dataInicio: '2026-03-01',
        dataFimEstimada: '2026-04-01',
        status: 'vencida',
        alunoNome: 'Bruno',
        planoNome: 'Mensal',
      },
      {
        id: 9,
        idAluno: 1,
        idPlano: 1,
        dataInicio: '2026-03-01',
        dataFimEstimada: '2026-04-01',
        status: 'vencida',
        alunoNome: 'Ana',
        planoNome: 'Mensal',
      },
      {
        id: 30,
        idAluno: 3,
        idPlano: 3,
        dataInicio: '2026-04-10',
        dataFimEstimada: '2026-10-10',
        status: 'ativa',
        alunoNome: 'Carla',
        planoNome: 'Semestral',
      },
      {
        id: 19,
        idAluno: 2,
        idPlano: 1,
        dataInicio: '2026-02-01',
        dataFimEstimada: '2026-03-01',
        status: 'inativa',
        alunoNome: 'Bruno',
        planoNome: 'Mensal',
      },
      {
        id: 8,
        idAluno: 1,
        idPlano: 1,
        dataInicio: '2026-01-01',
        dataFimEstimada: '2026-02-01',
        status: 'inativa',
        alunoNome: 'Ana',
        planoNome: 'Mensal',
      },
    ];

    const grupos = agruparMatriculasPorAluno(lista);
    assert.equal(grupos.length, 3);

    // Ordem dos alunos preservada: Ana (1), Bruno (2), Carla (3)
    assert.deepEqual(
      grupos.map((g) => g.idAluno),
      [1, 2, 3]
    );

    // Ana: 3 matrículas (1 atual + 2 no histórico na mesma ordem)
    assert.equal(grupos[0].atual.id, 10);
    assert.deepEqual(
      grupos[0].historico.map((m) => m.id),
      [9, 8]
    );

    // Bruno: 2 matrículas (1 atual + 1 no histórico)
    assert.equal(grupos[1].atual.id, 20);
    assert.deepEqual(
      grupos[1].historico.map((m) => m.id),
      [19]
    );

    // Carla: 1 matrícula (1 atual + 0 no histórico)
    assert.equal(grupos[2].atual.id, 30);
    assert.equal(grupos[2].historico.length, 0);
  });

  it('deve filtrar apenas alunos ativos com matrícula vencida, inativa ou sem_matricula', () => {
    const alunos: Aluno[] = [
      {
        id: 1,
        nome: 'Ativo Com Matricula Ativa',
        dataNascimento: '1990-01-01',
        telefone: null,
        ativo: true,
        statusMatricula: 'ativa',
      },
      {
        id: 2,
        nome: 'Ativo Vencido',
        dataNascimento: '1991-01-01',
        telefone: null,
        ativo: true,
        statusMatricula: 'vencida',
      },
      {
        id: 3,
        nome: 'Ativo Inativo',
        dataNascimento: '1992-01-01',
        telefone: null,
        ativo: true,
        statusMatricula: 'inativa',
      },
      {
        id: 4,
        nome: 'Ativo Sem Matricula',
        dataNascimento: '1993-01-01',
        telefone: null,
        ativo: true,
        statusMatricula: 'sem_matricula',
      },
      {
        id: 5,
        nome: 'Arquivado Vencido',
        dataNascimento: '1994-01-01',
        telefone: null,
        ativo: false,
        statusMatricula: 'vencida',
      },
    ];

    const elegiveis = alunosElegiveisParaMatricula(alunos);
    assert.deepEqual(
      elegiveis.map((a) => a.id),
      [2, 3, 4]
    );
  });
});
