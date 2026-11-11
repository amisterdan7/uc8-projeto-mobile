import React, { useCallback, useState } from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { contarLocal } from '../../banco/banco';
import { registrarErro } from '../../erros/erros';
import { cores, espacos, raio } from '../../tema/tema';

export function TelaSobrePlanos() {
  const { width, height, fontScale } = useWindowDimensions();
  const [guardados, setGuardados] = useState('...');

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      contarLocal()
        .then((total) => {
          if (!cancelado) {
            setGuardados(String(total));
          }
        })
        .catch((erro: unknown) => {
          registrarErro('contagem', erro);
          if (!cancelado) {
            setGuardados('indisponível');
          }
        });

      return () => {
        cancelado = true;
      };
    }, [])
  );

  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>Academia MisterFit - Modo Curso</Text>
      <Text style={estilos.subtitulo}>
        Exercício acadêmico com Supabase direto por fetch, cache offline em SQLite e fila de sincronização.
      </Text>

      <View style={estilos.cartao}>
        <Text style={estilos.secao}>Ambiente</Text>
        <Text style={estilos.medida}>Modo: Curso (Supabase direto + SQLite)</Text>
        <Text style={estilos.medida}>Entidade central: Planos de Treino</Text>
        <Text style={estilos.medida}>
          Janela: {Math.round(width)} x {Math.round(height)} dp
        </Text>
        <Text style={estilos.medida}>Densidade: {PixelRatio.get()}x</Text>
        <Text style={estilos.medida}>Escala da fonte: {fontScale}</Text>
        <Text style={estilos.medida}>Guardados no aparelho: {guardados}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacos.md,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: espacos.xs,
  },
  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 14,
    marginBottom: espacos.md,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
    gap: espacos.xs,
  },
  secao: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: espacos.xs,
  },
  medida: {
    color: cores.textoSecundario,
    fontSize: 13,
  },
});
