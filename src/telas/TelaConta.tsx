import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessao } from '@/auth';
import { useAcademia } from '@/contexto';
import type { NavegacaoAppProp } from '@/navegacao/tipos';
import { Campo, Selo } from '@/components';
import { ErroDaApi } from '@/api/cliente';
import {
  extrairErrosCampos,
  limparEventosErro,
  obterEventosErro,
  type EventoErro,
} from '@/erros';
import { formatarDataBR } from '@/utils/datas';
import { extrairHost } from './TelaSobre';
import { cores } from '@/tema/tema';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaConta() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavegacaoAppProp>();
  const { width, height, fontScale } = useWindowDimensions();
  const { usuario, permissoes, podeFazer, sair } = useSessao();
  const { trocarSenhaPropria } = useAcademia();

  const podeListarUsuarios = podeFazer('usuarios:listar');

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

  const [eventos, setEventos] = useState<ReadonlyArray<EventoErro>>(() =>
    obterEventosErro()
  );

  const nomeApp = Constants.expoConfig?.name ?? 'Academia MisterFit';
  const versaoApp = Constants.expoConfig?.version ?? '1.0.0';
  const hostApi = extrairHost(process.env.EXPO_PUBLIC_API_URL);

  useFocusEffect(
    useCallback(() => {
      setEventos(obterEventosErro());
    }, [])
  );

  function handleRecarregarLogs() {
    setEventos(obterEventosErro());
  }

  function handleLimparLogs() {
    limparEventosErro();
    setEventos([]);
  }

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
        <Text style={estilosComuns.tituloCabecalho}>Conta</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          estilosComuns.conteudo,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={estilosComuns.cartao}>
          <Text style={styles.tituloSecao}>Minha conta</Text>

          <View style={styles.linhaIdentidade}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={32} color={colors.white} />
            </View>
            <View style={styles.infoUsuario}>
              <Text style={estilosComuns.tituloCartao}>{usuario?.nome}</Text>
              <Text style={estilosComuns.textoMutavel}>
                Login: {usuario?.login}
              </Text>
              <View style={styles.espacoSelo}>
                <Selo
                  status={usuario?.perfil === 'admin' ? 'admin' : 'recepcao'}
                />
              </View>
            </View>
          </View>

          <View style={styles.blocoPermissoes}>
            <Text style={styles.subtituloSecao}>Permissões concedidas</Text>
            <View style={styles.gradePermissoes}>
              {usuario?.perfil === 'admin' || permissoes.includes('*') ? (
                <View style={styles.itemPermissao}>
                  <MaterialIcons name="verified" size={16} color={cores.sucesso} />
                  <Text style={styles.textoPermissao}>Acesso Total (*)</Text>
                </View>
              ) : (
                permissoes.map((p) => (
                  <View key={p} style={styles.itemPermissao}>
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color={colors.blue[400]}
                    />
                    <Text style={styles.textoPermissao}>{p}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {modoTrocarSenha ? (
            <View style={styles.blocoTrocaSenha}>
              <Text style={styles.subtituloSecao}>Trocar minha senha</Text>

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
              <MaterialIcons
                name="lock-reset"
                size={20}
                color={colors.blue[400]}
              />
              <Text style={styles.textoTrocarSenhaAbertura}>
                Trocar minha senha
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {podeListarUsuarios ? (
          <View style={estilosComuns.cartao}>
            <Text style={styles.tituloSecao}>Equipe</Text>
            <Text style={estilosComuns.textoMutavel}>
              Gerencie os usuários da academia, perfis de acesso e redefinição
              de senha.
            </Text>
            <TouchableOpacity
              style={styles.botaoAbrirEquipe}
              onPress={() => navigation.navigate('Usuarios')}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar usuários da equipe"
            >
              <View style={styles.esquerdaBotaoEquipe}>
                <MaterialIcons
                  name="security"
                  size={20}
                  color={colors.blue[300]}
                />
                <Text style={styles.textoBotaoEquipe}>
                  Gerenciar usuários da equipe
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={colors.gray[400]}
              />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={estilosComuns.cartao}>
          <Text style={styles.tituloSecao}>Sobre o app</Text>

          <View style={styles.itemDado}>
            <Text style={styles.rotuloDado}>Aplicativo:</Text>
            <Text style={styles.valorDado}>
              {nomeApp} (v{versaoApp})
            </Text>
          </View>

          <View style={styles.itemDado}>
            <Text style={styles.rotuloDado}>Origem dos dados:</Text>
            <Text style={styles.valorDado}>API v1, online</Text>
          </View>

          <View style={styles.itemDado}>
            <Text style={styles.rotuloDado}>Host da API:</Text>
            <Text style={styles.valorDado}>{hostApi}</Text>
          </View>

          <View style={styles.itemDado}>
            <Text style={styles.rotuloDado}>Medidas da janela:</Text>
            <Text style={styles.valorDado}>
              {Math.round(width)} x {Math.round(height)} dp ({PixelRatio.get()}
              x, fonte {fontScale})
            </Text>
          </View>

          <View style={styles.cabecalhoEventos}>
            <Text style={styles.subtituloSecao}>
              Eventos de erro recentes ({eventos.length})
            </Text>
            <View style={styles.botoesEventos}>
              <TouchableOpacity
                style={styles.botaoAcaoLog}
                onPress={handleRecarregarLogs}
                accessibilityRole="button"
                accessibilityLabel="Atualizar eventos de erro"
              >
                <MaterialIcons
                  name="refresh"
                  size={16}
                  color={colors.blue[300]}
                />
                <Text style={styles.textoAcaoLog}>Atualizar</Text>
              </TouchableOpacity>

              {eventos.length > 0 ? (
                <TouchableOpacity
                  style={styles.botaoAcaoLog}
                  onPress={handleLimparLogs}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar eventos de erro"
                >
                  <MaterialIcons
                    name="delete-sweep"
                    size={16}
                    color={colors.red[400]}
                  />
                  <Text style={[styles.textoAcaoLog, { color: colors.red[400] }]}>
                    Limpar
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {eventos.length === 0 ? (
            <View style={styles.cartaoSemErros}>
              <MaterialIcons
                name="check-circle-outline"
                size={18}
                color={colors.green[300]}
              />
              <Text style={estilosComuns.textoMutavel}>
                Nenhum erro registrado nesta sessão.
              </Text>
            </View>
          ) : (
            <View style={styles.listaLogs}>
              {eventos.map((item, idx) => {
                const hora = item.dataHora.slice(11, 19);
                const dataIso = item.dataHora.slice(0, 10);
                const dataBR = formatarDataBR(dataIso);

                return (
                  <View key={`${item.dataHora}-${idx}`} style={styles.itemLog}>
                    <View style={styles.linhaLogTopo}>
                      <Text style={styles.origemLog}>{item.origem}</Text>
                      <Text style={styles.tipoLog}>
                        [{item.tipo.toUpperCase()}]
                      </Text>
                    </View>
                    <View style={styles.linhaLogDetalhe}>
                      <Text style={styles.dataLog}>
                        {dataBR} às {hora}
                      </Text>
                      {item.statusOuCodigo ? (
                        <Text style={styles.codigoLog}>
                          Código: {item.statusOuCodigo}
                        </Text>
                      ) : null}
                    </View>
                    {item.detalhe ? (
                      <Text style={styles.detalheLog}>{item.detalhe}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.botaoSair}
          onPress={handleConfirmarSaida}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <MaterialIcons name="logout" size={20} color={colors.red[400]} />
          <Text style={styles.textoBotaoSair}>Sair</Text>
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
    marginBottom: 4,
  },
  subtituloSecao: {
    color: colors.gray[200],
    fontSize: 14,
    fontWeight: '600',
  },
  blocoPermissoes: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[800],
    gap: 6,
  },
  gradePermissoes: {
    gap: 6,
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
  blocoTrocaSenha: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[800],
    gap: 8,
  },
  textoErro: {
    color: colors.red[400],
    fontSize: 13,
    marginTop: 4,
  },
  textoSucesso: {
    color: cores.sucesso,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  linhaBotoesSenha: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
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
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
  },
  textoTrocarSenhaAbertura: {
    color: colors.blue[400],
    fontSize: 14,
    fontWeight: '600',
  },
  botaoAbrirEquipe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.blue[500],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
  },
  esquerdaBotaoEquipe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoBotaoEquipe: {
    color: colors.blue[300],
    fontSize: 14,
    fontWeight: '600',
  },
  itemDado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[800],
    gap: 8,
  },
  rotuloDado: {
    fontSize: 13,
    color: colors.gray[400],
  },
  valorDado: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    flexShrink: 1,
    textAlign: 'right',
  },
  cabecalhoEventos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  botoesEventos: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoAcaoLog: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  textoAcaoLog: {
    color: colors.blue[300],
    fontSize: 12,
    fontWeight: '600',
  },
  cartaoSemErros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.gray[900],
  },
  listaLogs: {
    gap: 8,
    marginTop: 6,
  },
  itemLog: {
    backgroundColor: colors.gray[900],
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 4,
  },
  linhaLogTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  origemLog: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.white,
  },
  tipoLog: {
    fontSize: 11,
    fontWeight: 'bold',
    color: cores.alerta,
  },
  linhaLogDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataLog: {
    fontSize: 11,
    color: colors.gray[400],
  },
  codigoLog: {
    fontSize: 11,
    color: colors.gray[400],
  },
  detalheLog: {
    fontSize: 12,
    color: colors.gray[300],
    marginTop: 2,
  },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cores.erroSuave,
    borderWidth: 1,
    borderColor: cores.erro,
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
