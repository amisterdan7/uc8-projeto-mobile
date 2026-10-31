import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Aluno } from '@/types/entidades';
import {
  aplicarMascaraData,
  dataBRparaISO,
  formatarDataBR,
  validarDataNascimentoBR,
} from '@/utils/datas';
import { aplicarMascaraTelefone, limparTelefone } from '@/utils/telefone';
import { Campo } from './Campo';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

interface AlunoFormProps {
  alunoInicial?: Aluno | null;
  salvando?: boolean;
  onSubmit: (nome: string, dataNascimentoISO: string, telefone: string) => void;
  onCancelar?: () => void;
}

export function AlunoForm({
  alunoInicial,
  salvando = false,
  onSubmit,
  onCancelar,
}: AlunoFormProps) {
  const [nome, setNome] = useState(alunoInicial?.nome ?? '');
  const [nascimentoBR, setNascimentoBR] = useState(
    alunoInicial ? formatarDataBR(alunoInicial.dataNascimento) : ''
  );
  const [telefone, setTelefone] = useState(
    alunoInicial?.telefone ? aplicarMascaraTelefone(alunoInicial.telefone) : ''
  );

  const [erroNome, setErroNome] = useState('');
  const [erroNascimento, setErroNascimento] = useState('');
  const [erroTelefone, setErroTelefone] = useState('');

  function handleNomeChange(texto: string) {
    setNome(texto);
    if (erroNome) setErroNome('');
  }

  function handleDataChange(texto: string) {
    setNascimentoBR(aplicarMascaraData(texto));
    if (erroNascimento) setErroNascimento('');
  }

  function handleTelefoneChange(texto: string) {
    setTelefone(aplicarMascaraTelefone(texto));
    if (erroTelefone) setErroTelefone('');
  }

  function handleSubmit() {
    let temErros = false;
    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 3 || nomeLimpo.length > 100) {
      setErroNome('O nome deve ter entre 3 e 100 caracteres.');
      temErros = true;
    } else {
      setErroNome('');
    }

    const validacaoData = validarDataNascimentoBR(nascimentoBR);
    if (!validacaoData.valida) {
      setErroNascimento(validacaoData.mensagem ?? 'Data de nascimento inválida.');
      temErros = true;
    } else {
      setErroNascimento('');
    }

    const telLimpo = limparTelefone(telefone);
    if (telLimpo.length > 0 && (telLimpo.length < 10 || telLimpo.length > 13)) {
      setErroTelefone('Telefone deve conter DDD e de 10 a 13 dígitos numéricos.');
      temErros = true;
    } else {
      setErroTelefone('');
    }

    if (temErros) {
      return;
    }

    const dataISO = dataBRparaISO(nascimentoBR);
    onSubmit(nomeLimpo, dataISO, telLimpo);
  }

  return (
    <View style={styles.container}>
      <Text style={estilosComuns.tituloCartao}>
        {alunoInicial ? 'Editar Aluno' : 'Novo Aluno'}
      </Text>

      <Campo
        rotulo="Nome completo"
        obrigatorio
        value={nome}
        onChangeText={handleNomeChange}
        placeholder="Ex.: Maria Souza"
        autoCapitalize="words"
        editable={!salvando}
        erro={erroNome}
        iconeEsquerda="person"
      />

      <Campo
        rotulo="Data de Nascimento (DD/MM/AAAA)"
        obrigatorio
        value={nascimentoBR}
        onChangeText={handleDataChange}
        placeholder="Ex.: 15/05/1998"
        keyboardType="number-pad"
        maxLength={10}
        editable={!salvando}
        erro={erroNascimento}
        iconeEsquerda="cake"
      />

      <Campo
        rotulo="Telefone com DDD (opcional)"
        value={telefone}
        onChangeText={handleTelefoneChange}
        placeholder="Ex.: (84) 99999-0000"
        keyboardType="phone-pad"
        maxLength={15}
        editable={!salvando}
        erro={erroTelefone}
        iconeEsquerda="phone"
      />

      <View style={styles.linhaBotoes}>
        {onCancelar ? (
          <TouchableOpacity
            style={[styles.botao, styles.botaoCancelar]}
            onPress={onCancelar}
            disabled={salvando}
          >
            <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.botao, estilosComuns.botaoPrimario, styles.botaoSalvar]}
          onPress={handleSubmit}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={estilosComuns.textoBotaoPrimario}>
              {alunoInicial ? 'Salvar alterações' : 'Cadastrar aluno'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 10,
    marginBottom: 16,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    backgroundColor: colors.gray[800],
  },
  textoBotaoCancelar: {
    color: colors.gray[300],
    fontWeight: '600',
  },
  botaoSalvar: {
    paddingVertical: 12,
  },
});
