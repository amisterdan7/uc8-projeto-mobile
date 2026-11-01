import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAcademia } from '@/contexto';
import { useSessao } from '@/auth';
import { semCaso } from '@/types/estadoTela';
import { colunasPara } from '@/utils/responsividade';
import { Campo, Carregando, EstadoErro, EstadoVazio, Selo } from '@/components';
import { ErroDaApi } from '@/api/cliente';
import { extrairErrosCampos } from '@/erros';
import type { PerfilUsuario, Usuario } from '@/types/entidades';
import { cores, larguraLarga } from '../tema/tema';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaUsuarios() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;
  const numColunas = colunasPara(width);

  const {
    estadoUsuarios,
    recarregarUsuarios,
    criarUsuario,
    alterarAtivoUsuario,
    redefinirSenhaUsuario,
  } = useAcademia();

  const { usuario: usuarioLogado, podeFazer } = useSessao();
  const podeCriar = podeFazer('usuarios:criar');
  const podeAlterarAtivo = podeFazer('usuarios:alterar-ativo');
  const podeRedefinirSenha = podeFazer('usuarios:redefinir-senha');

  const [atualizando, setAtualizando] = useState(false);

  // Estados do modal de criacao
  const [modalCriacaoVisivel, setModalCriacaoVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('recepcao');
  const [salvandoUsuario, setSalvandoUsuario] = useState(false);
  const [errosCriacao, setErrosCriacao] = useState<Record<string, string>>({});

  // Estados do modal de redefinicao de senha
  const [modalSenhaVisivel, setModalSenhaVisivel] = useState(false);
  const [usuarioAlvoSenha, setUsuarioAlvoSenha] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState('');

  async function handlePullToRefresh() {
    setAtualizando(true);
    await recarregarUsuarios();
    setAtualizando(false);
  }

  function handleAbrirCriacao() {
    setNome('');
    setLogin('');
    setSenha('');
    setPerfil('recepcao');
    setErrosCriacao({});
    setModalCriacaoVisivel(true);
  }

  function handleAbrirRedefinicaoSenha(alvo: Usuario) {
    setUsuarioAlvoSenha(alvo);
    setNovaSenha('');
    setErroSenha('');
    setModalSenhaVisivel(true);
  }

  async function handleSubmeterCriacao() {
    setErrosCriacao({});
    let temErro = false;
    const novosErros: Record<string, string> = {};

    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 3 || nomeLimpo.length > 100) {
      novosErros.nome = 'O nome deve ter entre 3 e 100 caracteres.';
      temErro = true;
    }

    const loginLimpo = login.trim().toLowerCase();
    const regexLogin = /^[a-z0-9_.-]{3,30}$/;
    if (!regexLogin.test(loginLimpo)) {
      novosErros.login =
        'Login deve ter de 3 a 30 caracteres (apenas letras minúsculas, números, ponto, hífen ou sublinhado).';
      temErro = true;
    }

    if (senha.length < 8 || senha.length > 128) {
      novosErros.senha = 'A senha deve conter entre 8 e 128 caracteres.';
      temErro = true;
    }

    if (temErro) {
      setErrosCriacao(novosErros);
      return;
    }

    setSalvandoUsuario(true);
    try {
      await criarUsuario({
        nome: nomeLimpo,
        login: loginLimpo,
        senha,
        perfil,
      });

      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso.');
      setModalCriacaoVisivel(false);
    } catch (falha: unknown) {
      if (falha instanceof ErroDaApi && falha.status === 400 && falha.detalhes) {
        setErrosCriacao(extrairErrosCampos(falha));
        Alert.alert('Dados inválidos', 'Verifique os campos destacados.');
      } else if (falha instanceof ErroDaApi && falha.status === 409) {
        novosErros.login = 'Já existe um usuário cadastrado com este login.';
        setErrosCriacao(novosErros);
      } else {
        const msg = falha instanceof Error ? falha.message : 'Falha ao cadastrar usuário.';
        Alert.alert('Erro', msg);
      }
    } finally {
      setSalvandoUsuario(false);
    }
  }

  async function handleSubmeterNovaSenha() {
    if (!usuarioAlvoSenha) return;
    if (novaSenha.length < 8 || novaSenha.length > 128) {
      setErroSenha('A senha deve conter entre 8 e 128 caracteres.');
      return;
    }

    setSalvandoSenha(true);
    setErroSenha('');
    try {
      await redefinirSenhaUsuario(usuarioAlvoSenha.id, novaSenha);
      Alert.alert(
        'Sucesso',
        `Senha do usuário "${usuarioAlvoSenha.nome}" redefinida com sucesso.`
      );
      setModalSenhaVisivel(false);
      setUsuarioAlvoSenha(null);
    } catch (falha: unknown) {
      const msg = falha instanceof Error ? falha.message : 'Falha ao redefinir senha.';
      setErroSenha(msg);
    } finally {
      setSalvandoSenha(false);
    }
  }

  function handleAlternarAtivo(alvo: Usuario) {
    if (alvo.id === usuarioLogado?.id) {
      Alert.alert('Operação não permitida', 'Não é possível desativar o próprio usuário.');
      return;
    }

    const novoStatus = !(alvo.ativo ?? true);
    const acao = novoStatus ? 'ativar' : 'desativar';

    Alert.alert(
      `Confirmar ${acao}`,
      `Deseja realmente ${acao} o usuário "${alvo.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: novoStatus ? 'Ativar' : 'Desativar',
          style: novoStatus ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await alterarAtivoUsuario(alvo.id, novoStatus);
              Alert.alert('Sucesso', `Usuário ${acao}do com sucesso.`);
            } catch (falha: unknown) {
              if (falha instanceof ErroDaApi && falha.status === 409) {
                Alert.alert(
                  'Não foi possível desativar',
                  'Não é possível desativar o próprio usuário.'
                );
              } else {
                const msg =
                  falha instanceof Error ? falha.message : `Falha ao ${acao} usuário.`;
                Alert.alert('Erro', msg);
              }
            }
          },
        },
      ]
    );
  }

  // Renderização por união discriminada (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
  switch (estadoUsuarios.tipo) {
    case 'carregando':
      return (
        <View style={estilosComuns.container}>
          <ActivityIndicator size="large" color={cores.primaria} />
          <Carregando mensagem="Carregando usuários do sistema..." />
        </View>
      );

    case 'erro':
      return (
        <View style={estilosComuns.container}>
          <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
            <View>
              <Text style={estilosComuns.tituloCabecalho}>Equipe e Usuários</Text>
              <Text style={estilosComuns.subtituloCabecalho}>
                Falha ao carregar
              </Text>
            </View>
            {podeCriar ? (
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={handleAbrirCriacao}
                accessibilityLabel="Adicionar novo usuário"
              >
                <MaterialIcons name="person-add" size={20} color={colors.white} />
                <Text style={styles.textoBotaoAdicionar}>Novo Usuário</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <EstadoErro
            mensagem={estadoUsuarios.mensagem}
            onTentarNovamente={recarregarUsuarios}
          />
        </View>
      );

    case 'pronto':
      return (
        <View style={estilosComuns.container}>
          <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
            <Text style={estilosComuns.tituloCabecalho}>Equipe e Usuários</Text>
            {podeCriar ? (
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={handleAbrirCriacao}
                accessibilityLabel="Adicionar novo usuário"
              >
                <MaterialIcons name="person-add" size={20} color={colors.white} />
                <Text style={styles.textoBotaoAdicionar}>Novo Usuário</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            key={duasColunas ? 'duas' : 'uma'}
            data={estadoUsuarios.dados}
            numColumns={duasColunas ? 2 : 1}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={[
              estilosComuns.conteudo,
              { paddingBottom: insets.bottom + 20 },
            ]}
            columnWrapperStyle={numColunas > 1 ? styles.linhaColunas : undefined}
            refreshControl={
              <RefreshControl
                refreshing={atualizando}
                onRefresh={handlePullToRefresh}
                tintColor={colors.blue[400]}
              />
            }
            ListEmptyComponent={
              <EstadoVazio
                mensagem="Nenhum usuário cadastrado."
                icone="people"
              />
            }
            renderItem={({ item }) => {
              const ehProprioUsuario = item.id === usuarioLogado?.id;
              const ativo = item.ativo !== false;

              return (
                <View
                  style={[
                    estilosComuns.cartao,
                    styles.cartaoResponsivo,
                    !ativo && styles.cartaoDesativado,
                  ]}
                >
                  <View style={styles.linhaTopoUsuario}>
                    <View style={{ flex: 1 }}>
                      <Text style={estilosComuns.tituloCartao}>{item.nome}</Text>
                      <Text style={estilosComuns.textoMutavel}>Login: {item.login}</Text>
                    </View>
                    <View style={styles.linhaSelos}>
                      <Selo status={item.perfil === 'admin' ? 'admin' : 'recepcao'} />
                      <Selo status={ativo ? 'ativa' : 'inativa'} />
                    </View>
                  </View>

                  {ehProprioUsuario ? (
                    <Text style={styles.avisoProprioUsuario}>
                      (Sua conta atual - use Minha Conta para alterar senha)
                    </Text>
                  ) : (
                    <View style={[estilosComuns.linhaAcoes, { marginTop: 12 }]}>
                      {podeAlterarAtivo ? (
                        <TouchableOpacity
                          style={estilosComuns.botaoAcao}
                          onPress={() => handleAlternarAtivo(item)}
                        >
                          <MaterialIcons
                            name={ativo ? 'block' : 'check-circle'}
                            size={15}
                            color={ativo ? colors.red[400] : colors.blue[400]}
                          />
                          <Text style={estilosComuns.textoBotaoAcao}>
                            {ativo ? 'Desativar' : 'Ativar'}
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      {podeRedefinirSenha ? (
                        <TouchableOpacity
                          style={estilosComuns.botaoAcao}
                          onPress={() => handleAbrirRedefinicaoSenha(item)}
                        >
                          <MaterialIcons
                            name="lock-reset"
                            size={15}
                            color={colors.blue[400]}
                          />
                          <Text style={estilosComuns.textoBotaoAcao}>
                            Redefinir Senha
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  )}
                </View>
              );
            }}
          />

          {/* Modal Criar Usuario */}
          <Modal
            visible={modalCriacaoVisivel}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => {
              if (!salvandoUsuario) setModalCriacaoVisivel(false);
            }}
          >
            <View
              style={[
                estilosComuns.container,
                { paddingTop: insets.top + 16, paddingHorizontal: 16 },
              ]}
            >
              <Text style={estilosComuns.tituloCartao}>Novo Usuário da Equipe</Text>

              <Campo
                rotulo="Nome Completo"
                obrigatorio
                value={nome}
                onChangeText={(t) => {
                  setNome(t);
                  if (errosCriacao.nome) {
                    setErrosCriacao((prev) => ({ ...prev, nome: '' }));
                  }
                }}
                placeholder="Ex.: Lucas Fernandes"
                editable={!salvandoUsuario}
                erro={errosCriacao.nome}
                iconeEsquerda="person"
              />

              <Campo
                rotulo="Login (3 a 30 caracteres minúsculos)"
                obrigatorio
                value={login}
                onChangeText={(t) => {
                  setLogin(t.toLowerCase());
                  if (errosCriacao.login) {
                    setErrosCriacao((prev) => ({ ...prev, login: '' }));
                  }
                }}
                placeholder="Ex.: lucas.fernandes"
                autoCapitalize="none"
                editable={!salvandoUsuario}
                erro={errosCriacao.login}
                iconeEsquerda="badge"
              />

              <Campo
                rotulo="Senha Inicial (8 a 128 caracteres)"
                obrigatorio
                value={senha}
                onChangeText={(t) => {
                  setSenha(t);
                  if (errosCriacao.senha) {
                    setErrosCriacao((prev) => ({ ...prev, senha: '' }));
                  }
                }}
                placeholder="Digite a senha inicial"
                secureTextEntry
                editable={!salvandoUsuario}
                erro={errosCriacao.senha}
                iconeEsquerda="lock"
              />

              <View style={styles.grupoPerfil}>
                <Text style={styles.rotuloPerfil}>Perfil de Acesso *</Text>
                <View style={styles.linhaOpcoesPerfil}>
                  <TouchableOpacity
                    style={[
                      styles.opcaoPerfil,
                      perfil === 'recepcao' && styles.opcaoPerfilSelecionada,
                    ]}
                    onPress={() => setPerfil('recepcao')}
                  >
                    <Text
                      style={[
                        styles.textoOpcaoPerfil,
                        perfil === 'recepcao' && styles.textoOpcaoSelecionada,
                      ]}
                    >
                      Recepção
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.opcaoPerfil,
                      perfil === 'admin' && styles.opcaoPerfilSelecionada,
                    ]}
                    onPress={() => setPerfil('admin')}
                  >
                    <Text
                      style={[
                        styles.textoOpcaoPerfil,
                        perfil === 'admin' && styles.textoOpcaoSelecionada,
                      ]}
                    >
                      Administrador
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.linhaBotoesModal}>
                <TouchableOpacity
                  style={[styles.botaoModal, styles.botaoCancelarModal]}
                  onPress={() => setModalCriacaoVisivel(false)}
                  disabled={salvandoUsuario}
                >
                  <Text style={styles.textoCancelarModal}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.botaoModal, estilosComuns.botaoPrimario]}
                  onPress={handleSubmeterCriacao}
                  disabled={salvandoUsuario}
                >
                  {salvandoUsuario ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={estilosComuns.textoBotaoPrimario}>Cadastrar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal Redefinir Senha */}
          <Modal
            visible={modalSenhaVisivel}
            animationType="fade"
            transparent
            onRequestClose={() => {
              if (!salvandoSenha) setModalSenhaVisivel(false);
            }}
          >
            <View style={styles.fundoModalTransparente}>
              <View style={styles.caixaModalSenha}>
                <Text style={estilosComuns.tituloCartao}>
                  Redefinir Senha
                </Text>
                <Text style={estilosComuns.textoMutavel}>
                  Usuário: {usuarioAlvoSenha?.nome} ({usuarioAlvoSenha?.login})
                </Text>

                <Campo
                  rotulo="Nova Senha (8 a 128 caracteres)"
                  obrigatorio
                  value={novaSenha}
                  onChangeText={(t) => {
                    setNovaSenha(t);
                    if (erroSenha) setErroSenha('');
                  }}
                  placeholder="Digite a nova senha"
                  secureTextEntry
                  editable={!salvandoSenha}
                  erro={erroSenha}
                  iconeEsquerda="lock-reset"
                />

                <View style={styles.linhaBotoesModal}>
                  <TouchableOpacity
                    style={[styles.botaoModal, styles.botaoCancelarModal]}
                    onPress={() => setModalSenhaVisivel(false)}
                    disabled={salvandoSenha}
                  >
                    <Text style={styles.textoCancelarModal}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botaoModal, estilosComuns.botaoPrimario]}
                    onPress={handleSubmeterNovaSenha}
                    disabled={salvandoSenha}
                  >
                    {salvandoSenha ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={estilosComuns.textoBotaoPrimario}>Redefinir</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      );

    default:
      return semCaso(estadoUsuarios);
  }
}

const styles = StyleSheet.create({
  linhaColunas: {
    gap: 12,
  },
  cartaoResponsivo: {
    flex: 1,
  },
  cartaoDesativado: {
    opacity: 0.6,
  },
  linhaTopoUsuario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  linhaSelos: {
    flexDirection: 'row',
    gap: 6,
  },
  avisoProprioUsuario: {
    color: colors.gray[400],
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.blue[500],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoBotaoAdicionar: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  grupoPerfil: {
    marginTop: 10,
    gap: 8,
  },
  rotuloPerfil: {
    color: colors.gray[300],
    fontSize: 13,
    fontWeight: '600',
  },
  linhaOpcoesPerfil: {
    flexDirection: 'row',
    gap: 12,
  },
  opcaoPerfil: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[800],
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  opcaoPerfilSelecionada: {
    borderColor: colors.blue[500],
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  textoOpcaoPerfil: {
    color: colors.gray[400],
    fontSize: 14,
    fontWeight: '600',
  },
  textoOpcaoSelecionada: {
    color: colors.blue[400],
  },
  linhaBotoesModal: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  botaoModal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelarModal: {
    backgroundColor: colors.gray[800],
  },
  textoCancelarModal: {
    color: colors.gray[300],
    fontWeight: '600',
    fontSize: 14,
  },
  fundoModalTransparente: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  caixaModalSenha: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 12,
  },
});
