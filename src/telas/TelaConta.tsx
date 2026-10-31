import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { ErroApi, trocarSenhaPropria } from '@/api';
import { Selo } from '@/components';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaConta() {
  const insets = useSafeAreaInsets();
  const { usuario, permissoes, sair } = useSessao();

  const [modoTrocarSenha, setModoTrocarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [erroTroca, setErroTroca] = useState('');
  const [sucessoTroca, setSucessoTroca] = useState(false);

  function handleConfirmarSaida() {
    Alert.alert(
      'Encerrar Sessão',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => sair(),
        },
      ]
    );
  }

  async function handleSalvarNovaSenha() {
    if (!senhaAtual || !novaSenha) {
      setErroTroca('Preencha a senha atual e a nova senha.');
      return;
    }

    if (novaSenha.length < 6) {
      setErroTroca('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmacaoNovaSenha) {
      setErroTroca('A confirmação da nova senha não confere.');
      return;
    }

    setTrocandoSenha(true);
    setErroTroca('');
    setSucessoTroca(false);

    try {
      await trocarSenhaPropria({
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      });

      setSucessoTroca(true);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacaoNovaSenha('');
      setTimeout(() => {
        setModoTrocarSenha(false);
        setSucessoTroca(false);
      }, 2000);
    } catch (erro: any) {
      if (erro instanceof ErroApi) {
        setErroTroca(erro.message);
      } else {
        setErroTroca('Não foi possível alterar a senha. Verifique a senha atual.');
      }
    } finally {
      setTrocandoSenha(false);
    }
  }

  return (
    <View style={estilosComuns.container}>
      <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
        <Text style={estilosComuns.tituloCabecalho}>Minha Conta</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          estilosComuns.conteudo,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={estilosComuns.cartao}>
          <View style={styles.linhaIdentidade}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={32} color={colors.white} />
            </View>
            <View style={styles.infoUsuario}>
              <Text style={estilosComuns.tituloCartao}>
                {usuario?.nome ?? 'Usuário'}
              </Text>
              <Text style={estilosComuns.textoSecundario}>
                @{usuario?.login}
              </Text>
              <View style={styles.espacoSelo}>
                <Selo
                  status={usuario?.perfil === 'admin' ? 'ativa' : 'inativa'}
                  rotuloPersonalizado={
                    usuario?.perfil === 'admin' ? 'Administrador' : 'Recepção'
                  }
                />
              </View>
            </View>
          </View>
        </View>

        <View style={estilosComuns.cartao}>
          <Text style={styles.tituloSecao}>Permissões Concedidas</Text>
          <View style={styles.gradePermissoes}>
            {usuario?.perfil === 'admin' || permissoes.includes('*') ? (
              <View style={styles.itemPermissao}>
                <MaterialIcons name="verified" size={16} color="#4ade80" />
                <Text style={styles.textoPermissao}>Acesso Total (*)</Text>
              </View>
            ) : (
              permissoes.map((p) => (
                <View key={p} style={styles.itemPermissao}>
                  <MaterialIcons name="check-circle" size={16} color={colors.blue[400]} />
                  <Text style={styles.textoPermissao}>{p}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {modoTrocarSenha ? (
          <View style={estilosComuns.cartao}>
            <Text style={styles.tituloSecao}>Alterar Senha de Acesso</Text>

            <View style={styles.grupoCampo}>
              <Text style={styles.rotulo}>Senha Atual</Text>
              <TextInput
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                placeholder="Informe sua senha atual"
                placeholderTextColor={colors.gray[500]}
                secureTextEntry
                style={estilosComuns.input}
                editable={!trocandoSenha}
              />
            </View>

            <View style={styles.grupoCampo}>
              <Text style={styles.rotulo}>Nova Senha</Text>
              <TextInput
                value={novaSenha}
                onChangeText={setNovaSenha}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.gray[500]}
                secureTextEntry
                style={estilosComuns.input}
                editable={!trocandoSenha}
              />
            </View>

            <View style={styles.grupoCampo}>
              <Text style={styles.rotulo}>Confirmar Nova Senha</Text>
              <TextInput
                value={confirmacaoNovaSenha}
                onChangeText={setConfirmacaoNovaSenha}
                placeholder="Repita a nova senha"
                placeholderTextColor={colors.gray[500]}
                secureTextEntry
                style={estilosComuns.input}
                editable={!trocandoSenha}
              />
            </View>

            {erroTroca ? (
              <Text style={styles.textoErro}>{erroTroca}</Text>
            ) : null}

            {sucessoTroca ? (
              <Text style={styles.textoSucesso}>
                Senha alterada com sucesso!
              </Text>
            ) : null}

            <View style={styles.linhaBotoesSenha}>
              <TouchableOpacity
                style={[styles.botaoSenha, styles.botaoCancelarSenha]}
                onPress={() => setModoTrocarSenha(false)}
                disabled={trocandoSenha}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoSenha, estilosComuns.botaoPrimario]}
                onPress={handleSalvarNovaSenha}
                disabled={trocandoSenha}
              >
                {trocandoSenha ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={estilosComuns.textoBotaoPrimario}>
                    Confirmar Troca
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botaoTrocarSenhaAbertura}
            onPress={() => setModoTrocarSenha(true)}
          >
            <MaterialIcons name="lock-reset" size={20} color={colors.blue[400]} />
            <Text style={styles.textoTrocarSenhaAbertura}>
              Alterar minha senha
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.botaoSair}
          onPress={handleConfirmarSaida}
        >
          <MaterialIcons name="logout" size={20} color={colors.red[400]} />
          <Text style={styles.textoBotaoSair}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  linhaIdentidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.blue[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoUsuario: {
    flex: 1,
    gap: 2,
  },
  espacoSelo: {
    marginTop: 4,
  },
  tituloSecao: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gradePermissoes: {
    gap: 8,
  },
  itemPermissao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoPermissao: {
    color: colors.gray[300],
    fontSize: 13,
  },
  botaoTrocarSenhaAbertura: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray[800],
    padding: 16,
    borderRadius: 12,
  },
  textoTrocarSenhaAbertura: {
    color: colors.blue[400],
    fontWeight: '600',
    fontSize: 15,
  },
  grupoCampo: {
    gap: 4,
    marginTop: 6,
  },
  rotulo: {
    color: colors.gray[300],
    fontSize: 13,
  },
  textoErro: {
    color: colors.red[400],
    fontSize: 13,
    marginTop: 4,
  },
  textoSucesso: {
    color: '#4ade80',
    fontSize: 13,
    marginTop: 4,
  },
  linhaBotoesSenha: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  botaoSenha: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelarSenha: {
    backgroundColor: colors.gray[800],
  },
  textoBotaoCancelar: {
    color: colors.gray[300],
    fontWeight: '600',
  },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 12,
  },
  textoBotaoSair: {
    color: colors.red[400],
    fontWeight: 'bold',
    fontSize: 15,
  },
});
