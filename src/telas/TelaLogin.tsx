import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessao } from '@/auth';
import { ErroApi } from '@/api';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaLogin() {
  const insets = useSafeAreaInsets();
  const { entrar } = useSessao();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  async function handleEntrar() {
    const usuarioLimpo = usuario.trim();

    if (!usuarioLimpo || !senha) {
      setMensagemErro('Informe o usuário e a senha para acessar.');
      return;
    }

    setCarregando(true);
    setMensagemErro('');

    try {
      await entrar(usuarioLimpo, senha);
    } catch (erro: any) {
      if (erro instanceof ErroApi) {
        setMensagemErro(erro.message);
      } else {
        setMensagemErro('Não foi possível realizar o login. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilosComuns.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.conteudoScroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cabecalhoLogo}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tituloApp}>MisterFit</Text>
          <Text style={styles.subtituloApp}>
            Acesso da Equipe (Admin e Recepção)
          </Text>
        </View>

        <View style={styles.cartaoFormulario}>
          <View style={styles.grupoCampo}>
            <Text style={styles.rotulo}>Usuário</Text>
            <View style={styles.campoComIcone}>
              <MaterialIcons
                name="person"
                size={20}
                color={colors.gray[400]}
                style={styles.iconeEsquerda}
              />
              <TextInput
                value={usuario}
                onChangeText={(texto) => {
                  setUsuario(texto);
                  if (mensagemErro) setMensagemErro('');
                }}
                placeholder="Ex.: admin ou recepcao"
                placeholderTextColor={colors.gray[500]}
                autoCapitalize="none"
                autoCorrect={false}
                style={[estilosComuns.input, styles.inputComIcone]}
                editable={!carregando}
              />
            </View>
          </View>

          <View style={styles.grupoCampo}>
            <Text style={styles.rotulo}>Senha</Text>
            <View style={styles.campoComIcone}>
              <MaterialIcons
                name="lock"
                size={20}
                color={colors.gray[400]}
                style={styles.iconeEsquerda}
              />
              <TextInput
                value={senha}
                onChangeText={(texto) => {
                  setSenha(texto);
                  if (mensagemErro) setMensagemErro('');
                }}
                placeholder="Sua senha de acesso"
                placeholderTextColor={colors.gray[500]}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                style={[estilosComuns.input, styles.inputComIcone, styles.inputSenha]}
                editable={!carregando}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha((antigo) => !antigo)}
                style={styles.botaoOlho}
              >
                <MaterialIcons
                  name={mostrarSenha ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.gray[400]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {mensagemErro ? (
            <View style={styles.caixaErro}>
              <MaterialIcons
                name="error-outline"
                size={18}
                color={colors.red[400]}
              />
              <Text style={styles.textoErro}>{mensagemErro}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              estilosComuns.botaoPrimario,
              styles.botaoEntrar,
              carregando && styles.botaoDesabilitado,
            ]}
            onPress={handleEntrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={estilosComuns.textoBotaoPrimario}>Acessar Sistema</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.rodapeAjuda}>
          Em caso de problemas de acesso, contate o administrador do sistema.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  conteudoScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  cabecalhoLogo: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logo: {
    width: 64,
    height: 64,
  },
  tituloApp: {
    color: colors.white,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtituloApp: {
    color: colors.gray[400],
    fontSize: 14,
  },
  cartaoFormulario: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 16,
  },
  grupoCampo: {
    gap: 6,
  },
  rotulo: {
    color: colors.gray[300],
    fontSize: 14,
    fontWeight: '600',
  },
  campoComIcone: {
    position: 'relative',
    justifyContent: 'center',
  },
  iconeEsquerda: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputComIcone: {
    paddingLeft: 44,
  },
  inputSenha: {
    paddingRight: 44,
  },
  botaoOlho: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  caixaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 10,
  },
  textoErro: {
    color: colors.red[400],
    fontSize: 13,
    flex: 1,
  },
  botaoEntrar: {
    marginTop: 8,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  rodapeAjuda: {
    color: colors.gray[600],
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
  },
});
