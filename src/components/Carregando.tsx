import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { cores, espacos } from '@/tema/tema';

interface CarregandoProps {
  mensagem?: string;
}

export function Carregando({ mensagem = 'Carregando...' }: CarregandoProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={cores.primaria} />
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
    backgroundColor: cores.fundo,
    padding: espacos.lg,
  },
  texto: {
    color: cores.textoSecundario,
    fontSize: 15,
  },
});
