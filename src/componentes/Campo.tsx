import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

interface CampoProps {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  erro?: string;
  tipoDeTeclado?: KeyboardTypeOptions;
  desabilitado?: boolean;
  secureTextEntry?: boolean;
  placeholder?: string;
  accessibilityLabel?: string;
}

export function Campo({
  rotulo,
  valor,
  aoMudar,
  erro,
  tipoDeTeclado = 'default',
  desabilitado = false,
  secureTextEntry = false,
  placeholder,
  accessibilityLabel,
}: CampoProps) {
  const [foco, setFoco] = useState(false);

  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        style={[
          estilos.entrada,
          foco && estilos.entradaFocada,
          erro !== undefined && estilos.entradaComErro,
          desabilitado && estilos.entradaDesabilitada,
        ]}
        value={valor}
        onChangeText={aoMudar}
        keyboardType={tipoDeTeclado}
        editable={!desabilitado}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSecundario}
        accessibilityLabel={accessibilityLabel ?? rotulo}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
      />
      {erro !== undefined && <Text style={estilos.mensagemErro}>{erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    marginBottom: espacos.sm + 2,
    gap: espacos.xs,
  },
  rotulo: {
    color: cores.textoSecundario,
    fontSize: 13,
    fontWeight: '600',
  },
  entrada: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    color: cores.texto,
    paddingHorizontal: espacos.md - 2,
    paddingVertical: espacos.sm + 4,
    fontSize: 15,
  },
  entradaFocada: {
    borderColor: cores.primaria,
  },
  entradaComErro: {
    borderColor: cores.erro,
  },
  entradaDesabilitada: {
    opacity: 0.5,
  },
  mensagemErro: {
    color: cores.erro,
    fontSize: 12,
    marginTop: 2,
  },
});
