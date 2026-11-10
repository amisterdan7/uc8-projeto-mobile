import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessao } from '@/auth';
import { Campo } from '@/components';
import { registrarErro } from '@/erros';
import { cores, espacos, raios } from '@/tema/tema';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaLogin() {
  const insets = useSafeAreaInsets();
  const { entrar } = useSessao();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [erroUsuario, setErroUsuario] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [mensagemErroGeral, setMensagemErroGeral] = useState('');

  async function handleEntrar() {
    const usuarioLimpo = usuario.trim();
    let temErros = false;

    if (!usuarioLimpo) {
      setErroUsuario('Informe seu usuário de acesso.');
      temErros = true;
    } else {
      setErroUsuario('');
    }

    if (!senha) {
      setErroSenha('Informe sua senha.');
      temErros = true;
    } else {
      setErroSenha('');
    }

    if (temErros) {
      return;
    }

    setCarregando(true);
    setMensagemErroGeral('');

    try {
      await entrar(usuarioLimpo, senha);
    } catch (erro: unknown) {
      const classificado = registrarErro('TelaLogin.entrar', erro);
      setMensagemErroGeral(classificado.mensagem);
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
          <Campo
            rotulo="Usuário"
            obrigatorio
            value={usuario}
            onChangeText={(texto) => {
              setUsuario(texto);
              if (erroUsuario) setErroUsuario('');
              if (mensagemErroGeral) setMensagemErroGeral('');
            }}
            placeholder="Ex.: admin ou recepcao"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!carregando}
            erro={erroUsuario}
            iconeEsquerda="person"
          />

          <Campo
            rotulo="Senha"
            obrigatorio
            value={senha}
            onChangeText={(texto) => {
              setSenha(texto);
              if (erroSenha) setErroSenha('');
              if (mensagemErroGeral) setMensagemErroGeral('');
            }}
            placeholder="Sua senha de acesso"
            secureTextEntry
            permiteAlternarSenha
            autoCapitalize="none"
            autoCorrect={false}
            editable={!carregando}
            erro={erroSenha}
            iconeEsquerda="lock"
          />

          {mensagemErroGeral ? (
            <View style={styles.caixaErro}>
              <MaterialIcons
                name="error-outline"
                size={18}
                color={colors.red[400]}
              />
              <Text style={styles.textoErro}>{mensagemErroGeral}</Text>
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
    backgroundColor: cores.cartao,
    borderRadius: raios.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: 12,
  },
  caixaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.erroSuave,
    borderWidth: 1,
    borderColor: cores.erroBorda,
    borderRadius: raios.md,
    padding: 10,
    marginVertical: espacos.xs,
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
