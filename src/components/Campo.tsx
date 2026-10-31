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
import { colors } from '@/styles/colors';

export interface CampoProps extends TextInputProps {
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  iconeEsquerda?: keyof typeof MaterialIcons.glyphMap;
  permiteAlternarSenha?: boolean;
}

/**
 * Campo de texto com estados visuais de foco, desabilitado e erro,
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
            color={temErro ? colors.red[400] : focado ? colors.blue[400] : colors.gray[400]}
            style={styles.iconeEsquerda}
          />
        ) : null}

        <TextInput
          editable={!desabilitado}
          secureTextEntry={permiteAlternarSenha ? senhaOculta : secureTextEntry}
          placeholderTextColor={colors.gray[500]}
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
              color={colors.gray[400]}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {temErro ? (
        <View style={styles.linhaErro}>
          <MaterialIcons name="error" size={14} color={colors.red[400]} />
          <Text style={styles.textoErro}>{erro}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: 4,
  },
  rotulo: {
    color: colors.gray[300],
    fontSize: 13,
    fontWeight: '600',
  },
  asterisco: {
    color: colors.red[400],
  },
  caixaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray[800],
    borderRadius: 8,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  caixaFocada: {
    borderColor: colors.blue[400],
  },
  caixaErro: {
    borderColor: colors.red[500],
  },
  caixaDesabilitada: {
    opacity: 0.5,
    backgroundColor: colors.night,
  },
  iconeEsquerda: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    paddingVertical: 10,
  },
  inputComIcone: {
    paddingLeft: 4,
  },
  inputComBotaoOlho: {
    paddingRight: 4,
  },
  botaoOlho: {
    padding: 6,
  },
  linhaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  textoErro: {
    color: colors.red[400],
    fontSize: 12,
  },
});
