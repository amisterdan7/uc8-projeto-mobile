import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

interface EstadoErroProps {
  mensagem?: string;
  onTentarNovamente?: () => void;
}

export function EstadoErro({
  mensagem = 'Ocorreu um erro ao carregar as informações.',
  onTentarNovamente,
}: EstadoErroProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="error-outline" size={48} color={colors.red[400]} />
      <Text style={styles.titulo}>Ops, algo deu errado</Text>
      <Text style={styles.mensagem}>{mensagem}</Text>

      {onTentarNovamente ? (
        <TouchableOpacity style={styles.botao} onPress={onTentarNovamente}>
          <MaterialIcons name="refresh" size={18} color={colors.white} />
          <Text style={styles.textoBotao}>Tentar novamente</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.night,
    padding: 24,
  },
  titulo: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  mensagem: {
    color: colors.gray[400],
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.blue[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  textoBotao: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
