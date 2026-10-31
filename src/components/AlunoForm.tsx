import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
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
  const [erro, setErro] = useState('');

  function handleDataChange(texto: string) {
    setNascimentoBR(aplicarMascaraData(texto));
  }

  function handleTelefoneChange(texto: string) {
    setTelefone(aplicarMascaraTelefone(texto));
  }

  function handleSubmit() {
    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 3 || nomeLimpo.length > 100) {
      setErro('O nome deve ter entre 3 e 100 caracteres.');
      return;
    }

    const validacaoData = validarDataNascimentoBR(nascimentoBR);
    if (!validacaoData.valida) {
      setErro(validacaoData.mensagem ?? 'Data de nascimento inválida.');
      return;
    }

    const telLimpo = limparTelefone(telefone);
    if (telLimpo.length > 0 && (telLimpo.length < 10 || telLimpo.length > 13)) {
      setErro('Telefone deve conter DDD e de 10 a 13 dígitos numéricos.');
      return;
    }

    setErro('');
    const dataISO = dataBRparaISO(nascimentoBR);
    onSubmit(nomeLimpo, dataISO, telLimpo);
  }

  return (
    <View style={styles.container}>
      <Text style={estilosComuns.tituloCartao}>
        {alunoInicial ? 'Editar Aluno' : 'Novo Aluno'}
      </Text>

      <View style={styles.grupoCampo}>
        <Text style={styles.rotulo}>Nome completo *</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Maria Souza"
          placeholderTextColor={colors.gray[500]}
          style={estilosComuns.input}
          autoCapitalize="words"
          editable={!salvando}
        />
      </View>

      <View style={styles.grupoCampo}>
        <Text style={styles.rotulo}>Data de Nascimento (DD/MM/AAAA) *</Text>
        <TextInput
          value={nascimentoBR}
          onChangeText={handleDataChange}
          placeholder="Ex.: 15/05/1998"
          placeholderTextColor={colors.gray[500]}
          keyboardType="number-pad"
          maxLength={10}
          style={estilosComuns.input}
          editable={!salvando}
        />
      </View>

      <View style={styles.grupoCampo}>
        <Text style={styles.rotulo}>Telefone com DDD (opcional)</Text>
        <TextInput
          value={telefone}
          onChangeText={handleTelefoneChange}
          placeholder="Ex.: (84) 99999-0000"
          placeholderTextColor={colors.gray[500]}
          keyboardType="phone-pad"
          maxLength={15}
          style={estilosComuns.input}
          editable={!salvando}
        />
      </View>

      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}

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
    gap: 12,
    marginBottom: 16,
  },
  grupoCampo: {
    gap: 4,
  },
  rotulo: {
    color: colors.gray[300],
    fontSize: 13,
    fontWeight: '600',
  },
  textoErro: {
    color: colors.red[400],
    fontSize: 13,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
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
