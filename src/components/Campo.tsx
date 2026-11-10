import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores, espacos, raios } from '@/tema/tema';

export interface CampoProps extends TextInputProps {
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  iconeEsquerda?: keyof typeof MaterialIcons.glyphMap;
  permiteAlternarSenha?: boolean;
}

/**
 * Campo de texto com estados visuais de foco (borda laranja), desabilitado e erro,
 * além de suporte completo a acessibilidade (M5-R4).
 */
export function Campo({
  rotulo,
  obrigatorio = false,
  erro,
  iconeEsquerda,
  permiteAlternarSenha = false,
  editable = true,
  accessibilityLabel,
  accessibilityHint,
  secureTextEntry,
  style,
  onFocus,
  onBlur,
  ...outrasProps
}: CampoProps) {
  const [focado, setFocado] = useState(false);
  const [senhaOculta, setSenhaOculta] = useState(Boolean(secureTextEntry));

  const temErro = Boolean(erro && erro.trim().length > 0);
  const desabilitado = editable === false;

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>
        {rotulo}
        {obrigatorio ? <Text style={styles.asterisco}> *</Text> : null}
      </Text>

      <View
        style={[
          styles.caixaInput,
          focado && styles.caixaFocada,
          temErro && styles.caixaErro,
          desabilitado && styles.caixaDesabilitada,
        ]}
      >
        {iconeEsquerda ? (
          <MaterialIcons
            name={iconeEsquerda}
            size={20}
            color={
              temErro
                ? cores.erro
                : focado
                  ? cores.primaria
                  : cores.textoSecundario
            }
            style={styles.iconeEsquerda}
          />
        ) : null}

        <TextInput
          editable={!desabilitado}
          secureTextEntry={permiteAlternarSenha ? senhaOculta : secureTextEntry}
          placeholderTextColor={cores.textoSecundario}
          accessibilityLabel={accessibilityLabel ?? rotulo}
          accessibilityHint={
            accessibilityHint ?? (temErro ? `Erro no campo: ${erro}` : undefined)
          }
          accessibilityState={{ disabled: desabilitado }}
          onFocus={(e) => {
            setFocado(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            if (onBlur) onBlur(e);
          }}
          style={[
            styles.input,
            iconeEsquerda ? styles.inputComIcone : null,
            permiteAlternarSenha ? styles.inputComBotaoOlho : null,
            style,
          ]}
          {...outrasProps}
        />

        {permiteAlternarSenha ? (
          <TouchableOpacity
            style={styles.botaoOlho}
            onPress={() => setSenhaOculta((antigo) => !antigo)}
            accessibilityRole="button"
            accessibilityLabel={senhaOculta ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <MaterialIcons
              name={senhaOculta ? 'visibility' : 'visibility-off'}
              size={20}
              color={cores.textoSecundario}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {temErro ? (
        <View style={styles.linhaErro}>
          <MaterialIcons name="error" size={14} color={cores.erro} />
          <Text style={styles.textoErro}>{erro}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: espacos.xs,
    marginBottom: espacos.xs,
  },
  rotulo: {
    color: cores.textoSecundario,
    fontSize: 13,
    fontWeight: '600',
  },
  asterisco: {
    color: cores.erro,
  },
  caixaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  caixaFocada: {
    borderColor: cores.primaria,
  },
  caixaErro: {
    borderColor: cores.erro,
  },
  caixaDesabilitada: {
    opacity: 0.5,
    backgroundColor: cores.fundo,
  },
  iconeEsquerda: {
    marginRight: espacos.sm,
  },
  input: {
    flex: 1,
    color: cores.texto,
    fontSize: 15,
    paddingVertical: 10,
  },
  inputComIcone: {
    paddingLeft: espacos.xs,
  },
  inputComBotaoOlho: {
    paddingRight: espacos.xs,
  },
  botaoOlho: {
    padding: 6,
  },
  linhaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    marginTop: 2,
  },
  textoErro: {
    color: cores.erro,
    fontSize: 12,
  },
});
