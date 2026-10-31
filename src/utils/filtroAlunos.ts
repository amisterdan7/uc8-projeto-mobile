import type { Aluno } from '@/types/entidades';

/**
 * Remove diacríticos (acentos) e converte para minúsculas.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra a lista de alunos por nome ou telefone.
 * - Ignora acentos e maiúsculas/minúsculas.
 * - Suporta busca de telefone com ou sem máscara.
 * - Trata telefone nulo com segurança.
 * - Retorna lista intacta se o termo de busca estiver vazio.
 */
export function filtrarAlunos(
  alunos: ReadonlyArray<Aluno>,
  termoBusca?: string | null
): Aluno[] {
  if (!termoBusca || termoBusca.trim() === '') {
    return [...alunos];
  }

  const termoNormalizado = normalizarTexto(termoBusca);
  const digitosBusca = termoBusca.replace(/\D/g, '');

  return alunos.filter((aluno) => {
    // Busca por nome (sem acento, minúsculo)
    const nomeNormalizado = normalizarTexto(aluno.nome);
    if (nomeNormalizado.includes(termoNormalizado)) {
      return true;
    }

    // Busca por telefone
    if (!aluno.telefone) {
      return false;
    }

    // Se o termo digitado contiver dígitos, compara com os dígitos do telefone do aluno
    if (digitosBusca.length > 0) {
      const digitosAluno = aluno.telefone.replace(/\D/g, '');
      if (digitosAluno.includes(digitosBusca)) {
        return true;
      }
    }

    // Também compara texto do telefone diretamente
    const telefoneNormalizado = normalizarTexto(aluno.telefone);
    return telefoneNormalizado.includes(termoNormalizado);
  });
}
