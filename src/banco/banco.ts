import * as SQLite from 'expo-sqlite';
import { ErroDoBanco } from '../erros/erros';
import type { DadosNovoPlano, PlanoAcademia } from '../servicos/planosSupabase';

export interface PendentePlano extends DadosNovoPlano {
  id: number;
}

export type Pendente = PendentePlano;

interface LinhaPlano {
  id: number;
  nome: string;
  preco: number;
  duracao_meses: number;
  descricao: string | null;
}

let bancoAberto: Promise<SQLite.SQLiteDatabase> | undefined;

function banco(): Promise<SQLite.SQLiteDatabase> {
  if (bancoAberto === undefined) {
    bancoAberto = SQLite.openDatabaseAsync('planos.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS planos (
          id INTEGER PRIMARY KEY NOT NULL,
          nome TEXT NOT NULL,
          preco REAL NOT NULL,
          duracao_meses INTEGER NOT NULL,
          descricao TEXT
        );
        CREATE TABLE IF NOT EXISTS pendentes (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          nome TEXT NOT NULL,
          preco REAL NOT NULL,
          duracao_meses INTEGER NOT NULL,
          descricao TEXT
        );
      `);
      return db;
    });
  }
  return bancoAberto;
}

function paraPlano(linha: LinhaPlano): PlanoAcademia {
  return {
    id: linha.id,
    nome: linha.nome,
    preco: linha.preco,
    duracaoMeses: linha.duracao_meses,
    descricao: linha.descricao ?? undefined,
  };
}

async function noBanco<T>(operacao: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  try {
    const db = await banco();
    return await operacao(db);
  } catch (erro: unknown) {
    throw new ErroDoBanco(erro instanceof Error ? erro.message : String(erro));
  }
}

export function listarLocal(): Promise<PlanoAcademia[]> {
  return noBanco(async (db) => {
    const linhas = await db.getAllAsync<LinhaPlano>(
      'SELECT id, nome, preco, duracao_meses, descricao FROM planos ORDER BY id'
    );
    return linhas.map(paraPlano);
  });
}

export function guardarLocal(planos: PlanoAcademia[]): Promise<void> {
  return noBanco((db) =>
    db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM planos');
      for (const plano of planos) {
        await db.runAsync(
          'INSERT INTO planos (id, nome, preco, duracao_meses, descricao) VALUES (?, ?, ?, ?, ?)',
          [
            plano.id,
            plano.nome,
            plano.preco,
            plano.duracaoMeses,
            plano.descricao ?? null,
          ]
        );
      }
    })
  );
}

export function contarLocal(): Promise<number> {
  return noBanco(async (db) => {
    const linha = await db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) AS total FROM planos'
    );
    return linha?.total ?? 0;
  });
}

export function listarPendentes(): Promise<PendentePlano[]> {
  return noBanco((db) =>
    db.getAllAsync<PendentePlano>(
      'SELECT id, nome, preco, duracao_meses, descricao FROM pendentes ORDER BY id'
    )
  );
}

export function guardarPendente(dados: DadosNovoPlano): Promise<PendentePlano> {
  return noBanco(async (db) => {
    const resultado = await db.runAsync(
      'INSERT INTO pendentes (nome, preco, duracao_meses, descricao) VALUES (?, ?, ?, ?)',
      [dados.nome, dados.preco, dados.duracao_meses, dados.descricao ?? null]
    );
    return { id: resultado.lastInsertRowId, ...dados };
  });
}

export function removerPendente(id: number): Promise<void> {
  return noBanco(async (db) => {
    await db.runAsync('DELETE FROM pendentes WHERE id = ?', [id]);
  });
}
