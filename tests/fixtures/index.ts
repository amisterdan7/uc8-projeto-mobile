/**
 * Fixtures de teste para validacao de DTOs da API v1.
 * Contem cenarios: validos, com valores nulos e campos extras, e invalidos.
 */

export const fixturesUsuario = {
  valido: {
    id: 1,
    nome: 'Carlos Silva',
    login: 'carlos.recepcao',
    perfil: 'recepcao' as const,
    ativo: true,
  },
  comNulosECamposExtras: {
    id: 2,
    nome: 'Ana Administradora',
    login: 'ana.admin',
    perfil: 'admin' as const,
    ativo: true,
    metadados_extras: { ip: '127.0.0.1', versao: 2 },
    token_legado: null,
  },
  invalidoSemId: {
    nome: 'Sem ID',
    login: 'sem.id',
    perfil: 'admin' as const,
  },
  invalidoPerfilIncorreto: {
    id: 3,
    nome: 'Perfil Invalido',
    login: 'perfil.inv',
    perfil: 'aluno',
  },
};

export const fixturesPlano = {
  valido: {
    id: 10,
    nome: 'Fit Plus',
    preco: 129.9,
    duracao_meses: 6,
    descricao: 'Acesso completo a musculacao e lutas',
    destaque: true,
    recursos: [{ descricao: 'Livre acesso' }, { descricao: 'Armario' }],
  },
  comNulosECamposExtras: {
    id: 11,
    nome: 'Basico',
    preco: 79.0,
    duracao_meses: 1,
    descricao: null,
    destaque: false,
    recursos: null,
    campo_desconhecido: 'ignorar',
    taxa_adesao: 0,
  },
  invalidoPrecoNaoNumerico: {
    id: 12,
    nome: 'Invalido',
    preco: 'gratis',
    duracao_meses: 1,
  },
  invalidoSemNome: {
    id: 13,
    preco: 50.0,
    duracao_meses: 1,
  },
};

export const fixturesAluno = {
  valido: {
    id: 101,
    nome: 'Mariana Santos',
    data_nascimento: '1995-07-20',
    telefone: '8499887766',
    ativo: true,
    plano_nome: 'Fit Plus',
    status_matricula: 'ativa' as const,
  },
  comNulosECamposExtras: {
    id: 102,
    nome: 'Pedro Alvares',
    data_nascimento: '1988-03-15',
    telefone: null,
    ativo: false,
    plano_nome: null,
    status_matricula: 'sem_matricula' as const,
    cpf_antigo: '12345678900',
    historico_visitas: [],
  },
  invalidoDataInexistente: {
    id: 103,
    nome: 'Aluno Sem Data',
    ativo: true,
  },
  invalidoTelefoneNaoString: {
    id: 104,
    nome: 'Telefone Numero',
    data_nascimento: '1990-01-01',
    telefone: 84999998888,
  },
  criadoSemMatricula: {
    id: 105,
    nome: 'Aluno Sem Plano Inicial',
    data_nascimento: '2000-05-12',
    telefone: '84988887777',
  },
  criadoComMatricula: {
    id: 106,
    nome: 'Aluno Com Plano Inicial',
    data_nascimento: '1998-11-23',
    telefone: '84977776666',
    matricula: {
      id: 601,
      id_aluno: 106,
      id_plano: 10,
      data_inicio: '2026-04-17',
      data_fim_estimada: '2026-10-17',
      status: 'ativa' as const,
    },
  },
};

export const fixturesMatricula = {
  valida: {
    id: 501,
    id_aluno: 101,
    id_plano: 10,
    data_inicio: '2026-02-01',
    data_fim_estimada: '2026-08-01',
    status: 'ativa' as const,
    aluno_nome: 'Mariana Santos',
    plano_nome: 'Fit Plus',
  },
  comNulosECamposExtras: {
    id: 502,
    id_aluno: 102,
    id_plano: 11,
    data_inicio: '2026-01-01',
    data_fim_estimada: '2026-02-01',
    status: 'vencida' as const,
    aluno_nome: undefined,
    plano_nome: null,
    observacao_financeira: 'pago em dinheiro',
  },
  invalidaSemIds: {
    id: 503,
    data_inicio: '2026-01-01',
    status: 'ativa',
  },
  invalidaStatusInexistente: {
    id: 504,
    id_aluno: 101,
    id_plano: 10,
    data_inicio: '2026-01-01',
    data_fim_estimada: '2026-02-01',
    status: 'cancelada_pelo_aluno',
  },
};
