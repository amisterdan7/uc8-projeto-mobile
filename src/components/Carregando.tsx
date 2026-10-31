import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/styles/colors';

interface CarregandoProps {
  mensagem?: string;
}

export function Carregando({ mensagem = 'Carregando...' }: CarregandoProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.blue[400]} />
      <Text style={styles.texto}>{mensagem}</Text>
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
  texto: {
    color: colors.gray[300],
    fontSize: 15,
  },
});
