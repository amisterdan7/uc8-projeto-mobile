import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

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
      <MaterialIcons name={icone} size={44} color={colors.gray[600]} />
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  texto: {
    color: colors.gray[400],
    fontSize: 15,
    textAlign: 'center',
  },
});
