import type { Aluno } from "@/types/entidades";

export const alunosMock: Aluno[] = [
  {
    id: 1,
    nome: "Caio Pereira",
    dataNascimento: "2000-05-14",
    telefone: "(84) 99999-0000",
    ativo: true,
  },
  {
    id: 2,
    nome: "João Silva",
    dataNascimento: "1998-11-02",
    telefone: null,
    ativo: false,
  },
  {
    id: 3,
    nome: "Maria Oliveira",
    dataNascimento: "2001-03-22",
    telefone: "(84) 98888-1111",
    ativo: true,
  },
  {
    id: 4,
    nome: "Pedro Santos",
    dataNascimento: "1999-07-15",
    telefone: "(84) 97777-2222",
    ativo: false,
  },
  {
    id: 5,
    nome: "Ana Costa",
    dataNascimento: "2002-09-30",
    telefone: "(84) 96666-3333",
    ativo: true,
  },
];


export function carregarAlunos(): Promise<Aluno[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(alunosMock), 700);
  });
}