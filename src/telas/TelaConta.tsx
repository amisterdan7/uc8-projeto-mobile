import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessao } from '@/auth';
import { useAcademia } from '@/contexto';
import { Campo, Selo } from '@/components';
import { ErroDaApi } from '@/api/cliente';
import { extrairErrosCampos } from '@/erros';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaConta() {
  const insets = useSafeAreaInsets();
  const { usuario, permissoes, sair } = useSessao();
  const { trocarSenhaPropria } = useAcademia();

  const [modoTrocarSenha, setModoTrocarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  const [erroGeral, setErroGeral] = useState('');
  const [erroSenhaAtual, setErroSenhaAtual] = useState('');
  const [erroNovaSenha, setErroNovaSenha] = useState('');
  const [erroConfirmacao, setErroConfirmacao] = useState('');
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

  function limparErros() {
    setErroGeral('');
    setErroSenhaAtual('');
    setErroNovaSenha('');
    setErroConfirmacao('');
  }

  async function handleSalvarNovaSenha() {
    limparErros();
    let temErro = false;

    if (!senhaAtual) {
      setErroSenhaAtual('Informe a senha atual.');
      temErro = true;
    }

    if (!novaSenha) {
      setErroNovaSenha('Informe a nova senha.');
      temErro = true;
    } else if (novaSenha.length < 8 || novaSenha.length > 128) {
      setErroNovaSenha('A nova senha deve ter entre 8 e 128 caracteres.');
      temErro = true;
    }

    if (novaSenha !== confirmacaoNovaSenha) {
      setErroConfirmacao('A confirmação da nova senha não confere.');
      temErro = true;
    }

    if (temErro) return;

    setTrocandoSenha(true);
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
    } catch (falha: unknown) {
      if (falha instanceof ErroDaApi) {
        if (falha.status === 400) {
          const errosCampos = extrairErrosCampos(falha);
          if (errosCampos.senha_atual) {
            setErroSenhaAtual(errosCampos.senha_atual);
          } else {
            // Senha atual errada na API retorna 400 com mensagem no body
            setErroSenhaAtual(falha.message || 'Senha atual incorreta.');
          }

          if (errosCampos.nova_senha) {
            setErroNovaSenha(errosCampos.nova_senha);
          }
        } else {
          setErroGeral(falha.message);
        }
      } else {
        setErroGeral('Não foi possível alterar a senha. Verifique a conexão.');
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
              <Text style={estilosComuns.tituloCartao}>{usuario?.nome}</Text>
              <Text style={estilosComuns.textoMutavel}>Login: {usuario?.login}</Text>
              <View style={styles.espacoSelo}>
                <Selo status={usuario?.perfil === 'admin' ? 'admin' : 'recepcao'} />
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
            <Text style={styles.tituloSecao}>Trocar Minha Senha</Text>

            <Campo
              rotulo="Senha Atual"
              obrigatorio
              value={senhaAtual}
              onChangeText={(t) => {
                setSenhaAtual(t);
                if (erroSenhaAtual) setErroSenhaAtual('');
              }}
              placeholder="Informe sua senha atual"
              secureTextEntry
              editable={!trocandoSenha}
              erro={erroSenhaAtual}
              iconeEsquerda="lock"
            />

            <Campo
              rotulo="Nova Senha (8 a 128 caracteres)"
              obrigatorio
              value={novaSenha}
              onChangeText={(t) => {
                setNovaSenha(t);
                if (erroNovaSenha) setErroNovaSenha('');
              }}
              placeholder="Digite a nova senha"
              secureTextEntry
              editable={!trocandoSenha}
              erro={erroNovaSenha}
              iconeEsquerda="lock-outline"
            />

            <Campo
              rotulo="Confirmar Nova Senha"
              obrigatorio
              value={confirmacaoNovaSenha}
              onChangeText={(t) => {
                setConfirmacaoNovaSenha(t);
                if (erroConfirmacao) setErroConfirmacao('');
              }}
              placeholder="Repita a nova senha"
              secureTextEntry
              editable={!trocandoSenha}
              erro={erroConfirmacao}
              iconeEsquerda="check"
            />

            {erroGeral ? (
              <Text style={styles.textoErro}>{erroGeral}</Text>
            ) : null}

            {sucessoTroca ? (
              <Text style={styles.textoSucesso}>
                Senha alterada com sucesso!
              </Text>
            ) : null}

            <View style={styles.linhaBotoesSenha}>
              <TouchableOpacity
                style={[styles.botaoSenha, styles.botaoCancelarSenha]}
                onPress={() => {
                  setModoTrocarSenha(false);
                  limparErros();
                }}
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
            onPress={() => {
              setModoTrocarSenha(true);
              limparErros();
            }}
          >
            <MaterialIcons name="lock-reset" size={20} color={colors.blue[400]} />
            <Text style={styles.textoTrocarSenhaAbertura}>
              Trocar minha senha
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
  textoErro: {
    color: colors.red[400],
    fontSize: 13,
    marginTop: 4,
  },
  textoSucesso: {
    color: '#4ade80',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  linhaBotoesSenha: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
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
    fontSize: 14,
  },
  botaoTrocarSenhaAbertura: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray[800],
    borderRadius: 12,
    paddingVertical: 14,
  },
  textoTrocarSenhaAbertura: {
    color: colors.blue[400],
    fontSize: 14,
    fontWeight: '600',
  },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.red[400],
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  textoBotaoSair: {
    color: colors.red[400],
    fontSize: 14,
    fontWeight: 'bold',
  },
});
