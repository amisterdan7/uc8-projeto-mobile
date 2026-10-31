/**
 * Utilitários para tratamento e máscara de número de telefone celular/fixo padrão Brasil.
 */

/**
 * Remove todos os caracteres não numéricos de uma string de telefone.
 */
export function limparTelefone(valor: string | null | undefined): string {
  if (!valor || typeof valor !== 'string') {
    return '';
  }
  return valor.replace(/\D/g, '');
}

/**
 * Aplica máscara dinâmica (XX) XXXXX-XXXX (ou (XX) XXXX-XXXX) conforme o usuário digita.
 */
export function aplicarMascaraTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  if (digitos.length === 0) {
    return '';
  }
  if (digitos.length <= 2) {
    return `(${digitos}`;
  }
  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`;
}

/**
 * Formata um telefone para exibição ou retorna 'Não informado' se vazio.
 */
export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone || typeof telefone !== 'string' || telefone.trim() === '') {
    return 'Não informado';
  }

  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length === 10 || digitos.length === 11) {
    return aplicarMascaraTelefone(digitos);
  }

  return telefone;
}
