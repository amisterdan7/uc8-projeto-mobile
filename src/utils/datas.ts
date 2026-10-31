/**
 * Utilitários para formatação e validação de datas.
 * REGRA: Não utiliza `new Date(texto)` para formatação a fim de evitar
 * distorções de fuso horário (ex.: fuso de Brasília UTC-3 subtraindo 3 horas e exibindo o dia anterior).
 */

/**
 * Converte data ISO (AAAA-MM-DD ou AAAA-MM-DDTHH:mm:ss...) para formato brasileiro DD/MM/AAAA.
 * Retorna string vazia se o valor for inválido ou nulo.
 */
export function formatarDataBR(dataIso: string | null | undefined): string {
  if (!dataIso || typeof dataIso !== 'string') {
    return '';
  }

  // Pega apenas a porção da data caso contenha horário
  const apenasData = dataIso.split('T')[0].trim();
  const partes = apenasData.split('-');

  if (partes.length !== 3) {
    return dataIso;
  }

  const [ano, mes, dia] = partes;
  if (!ano || !mes || !dia || ano.length !== 4) {
    return dataIso;
  }

  return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
}

/**
 * Converte data brasileira DD/MM/AAAA para formato ISO AAAA-MM-DD.
 */
export function dataBRparaISO(dataBR: string | null | undefined): string {
  if (!dataBR || typeof dataBR !== 'string') {
    return '';
  }

  const partes = dataBR.trim().split('/');
  if (partes.length !== 3) {
    return '';
  }

  const [dia, mes, ano] = partes;
  if (!dia || !mes || !ano || ano.length !== 4) {
    return '';
  }

  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

/**
 * Valida se uma data no formato DD/MM/AAAA é uma data real de calendário,
 * a partir do ano 1900 e estritamente anterior à data de hoje.
 */
export function validarDataNascimentoBR(dataBR: string): { valida: boolean; mensagem?: string } {
  if (!dataBR || typeof dataBR !== 'string') {
    return { valida: false, mensagem: 'Data de nascimento é obrigatória.' };
  }

  const partes = dataBR.trim().split('/');
  if (partes.length !== 3) {
    return { valida: false, mensagem: 'Formato inválido. Use DD/MM/AAAA.' };
  }

  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const ano = parseInt(partes[2], 10);

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
    return { valida: false, mensagem: 'Data de nascimento contém caracteres inválidos.' };
  }

  if (ano < 1900) {
    return { valida: false, mensagem: 'O ano deve ser igual ou superior a 1900.' };
  }

  if (mes < 1 || mes > 12) {
    return { valida: false, mensagem: 'Mês deve estar entre 01 e 12.' };
  }

  const diasNoMes = [
    31,
    (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (dia < 1 || dia > diasNoMes[mes - 1]) {
    return { valida: false, mensagem: 'Dia inválido para o mês informado.' };
  }

  // Compara com a data atual (YYYY-MM-DD local)
  const agora = new Date();
  const hojeAno = agora.getFullYear();
  const hojeMes = agora.getMonth() + 1;
  const hojeDia = agora.getDate();

  const isoData = `${ano.toString().padStart(4, '0')}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
  const isoHoje = `${hojeAno.toString().padStart(4, '0')}-${hojeMes.toString().padStart(2, '0')}-${hojeDia.toString().padStart(2, '0')}`;

  if (isoData >= isoHoje) {
    return { valida: false, mensagem: 'Data de nascimento deve ser anterior à data de hoje.' };
  }

  return { valida: true };
}

/**
 * Aplica máscara progressiva DD/MM/AAAA durante a digitação.
 */
export function aplicarMascaraData(valor: string): string {
  const apenasDigitos = valor.replace(/\D/g, '').slice(0, 8);

  if (apenasDigitos.length <= 2) {
    return apenasDigitos;
  }
  if (apenasDigitos.length <= 4) {
    return `${apenasDigitos.slice(0, 2)}/${apenasDigitos.slice(2)}`;
  }
  return `${apenasDigitos.slice(0, 2)}/${apenasDigitos.slice(2, 4)}/${apenasDigitos.slice(4)}`;
}
