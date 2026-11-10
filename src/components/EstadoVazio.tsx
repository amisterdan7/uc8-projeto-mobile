import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores, espacos } from '@/tema/tema';

interface EstadoVazioProps {
  mensagem?: string;
  icone?: keyof typeof MaterialIcons.glyphMap;
}

export function EstadoVazio({
  mensagem = 'Nenhum registro encontrado.',
  icone = 'inbox',
}: EstadoVazioProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icone} size={44} color={cores.textoSecundario} />
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: espacos.lg,
    gap: 12,
  },
  texto: {
    color: cores.textoSecundario,
    fontSize: 15,
    textAlign: 'center',
  },
});
