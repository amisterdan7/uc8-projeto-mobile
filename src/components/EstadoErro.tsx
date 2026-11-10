import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores, espacos, raios } from '@/tema/tema';

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
      <MaterialIcons name="error-outline" size={48} color={cores.erro} />
      <Text style={styles.titulo}>Ops, algo deu errado</Text>
      <Text style={styles.mensagem}>{mensagem}</Text>

      {onTentarNovamente ? (
        <TouchableOpacity style={styles.botao} onPress={onTentarNovamente}>
          <MaterialIcons name="refresh" size={18} color={cores.texto} />
          <Text style={styles.textoBotao}>Tentar de novo</Text>
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
    backgroundColor: cores.fundo,
    padding: espacos.lg,
  },
  titulo: {
    color: cores.texto,
    fontSize: 18,
    fontWeight: 'bold',
  },
  mensagem: {
    color: cores.textoSecundario,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.primaria,
    paddingHorizontal: espacos.md,
    paddingVertical: 12,
    borderRadius: raios.md,
    marginTop: espacos.sm,
    minHeight: 44,
  },
  textoBotao: {
    color: cores.texto,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
