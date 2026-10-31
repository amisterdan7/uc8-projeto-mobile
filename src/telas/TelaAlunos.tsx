import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Aluno } from '@/types/entidades';
import { semCaso } from '@/types/estadoTela';
import type { NavegacaoAppProp } from '@/navegacao/tipos';
import { useDados } from '@/dados';
import { useAcademia, useAcervo } from '../contexto';
import { extrairErrosCampos, registrarErro } from '../erros/erros';
import { ErroDaApi } from '@/api';
import { useSessao } from '@/auth';
import { colunasPara, filtrarAlunos } from '@/utils';
import { AlunoCard, AlunoForm, Carregando, EstadoErro, EstadoVazio } from '@/components';
import { cores, espacos, larguraLarga } from '../tema/tema';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaAlunos() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavegacaoAppProp>();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;
  const numColunas = colunasPara(width);

  const { estado: estadoAcademia } = useAcervo();

  const {
    estadoAlunos,
    recarregarAlunos,
    criarAluno,
    atualizarAluno,
    arquivarAluno,
    restaurarAluno,
    excluirAluno,
  } = useDados();

  const { podeFazer } = useSessao();
  const podeCriar = podeFazer('alunos:criar');
  const podeAtualizar = podeFazer('alunos:atualizar');
  const podeDesativar = podeFazer('alunos:desativar');
  const podeExcluir = podeFazer('alunos:excluir');
  const podeCriarMatricula = podeFazer('matriculas:criar');

  const [busca, setBusca] = useState('');
  const [modalFormularioVisivel, setModalFormularioVisivel] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | null>(null);
  const [errosFormulario, setErrosFormulario] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  async function handlePullToRefresh() {
    setAtualizando(true);
    await recarregarAlunos();
    setAtualizando(false);
  }

  function handleAbrirCriacao() {
    setAlunoEmEdicao(null);
    setErrosFormulario({});
    setModalFormularioVisivel(true);
  }

  function handleAbrirEdicao(aluno: Aluno) {
    setAlunoEmEdicao(aluno);
    setErrosFormulario({});
    setModalFormularioVisivel(true);
  }

  function handleRenovar(aluno: Aluno) {
    navigation.navigate('Abas', {
      screen: 'Matriculas',
      params: { alunoId: aluno.id },
    });
  }

  async function handleSalvarAluno(
    nome: string,
    dataNascimentoISO: string,
    telefone: string
  ) {
    setSalvando(true);
    setErrosFormulario({});
    try {
      if (alunoEmEdicao) {
        await atualizarAluno(alunoEmEdicao.id, nome, dataNascimentoISO, telefone);
        Alert.alert('Sucesso', 'Dados do aluno atualizados com sucesso.');
      } else {
        await criarAluno(nome, dataNascimentoISO, telefone);
        Alert.alert('Sucesso', 'Aluno cadastrado com sucesso.');
      }
      setModalFormularioVisivel(false);
      setAlunoEmEdicao(null);
    } catch (falha: unknown) {
      registrarErro('cadastro', falha);
      if (falha instanceof ErroDaApi && falha.status === 409) {
        Alert.alert(
          'Não foi possível salvar',
          'Já existe um aluno com esse nome e data de nascimento.'
        );
      } else if (falha instanceof ErroDaApi && falha.status === 400 && falha.detalhes) {
        setErrosFormulario(extrairErrosCampos(falha));
        Alert.alert('Dados inválidos', 'Verifique os campos destacados em vermelho.');
      } else {
        const msg =
          falha instanceof Error
            ? falha.message
            : 'Não foi possível salvar os dados do aluno.';
        Alert.alert('Erro', msg);
      }
    } finally {
      setSalvando(false);
    }
  }

  function handleAlternarAtivo(aluno: Aluno) {
    const novoStatus = !aluno.ativo;
    const acaoTexto = novoStatus ? 'restaurar' : 'arquivar';

    Alert.alert(
      `Confirmar ${acaoTexto}`,
      `Deseja realmente ${acaoTexto} o aluno "${aluno.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: novoStatus ? 'Restaurar' : 'Arquivar',
          style: novoStatus ? 'default' : 'destructive',
          onPress: async () => {
            try {
              if (novoStatus) {
                await restaurarAluno(aluno.id);
              } else {
                await arquivarAluno(aluno.id);
              }
            } catch {
              Alert.alert('Erro', `Falha ao ${acaoTexto} aluno.`);
            }
          },
        },
      ]
    );
  }

  function handleExcluir(aluno: Aluno) {
    Alert.alert(
      'Excluir Aluno Definitivamente',
      `A exclusão permanente só é possível para alunos sem histórico de matrículas. Deseja prosseguir com a exclusão de "${aluno.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir definitivamente',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirAluno(aluno.id);
              Alert.alert('Sucesso', 'Aluno excluído com sucesso.');
            } catch (erro: unknown) {
              if (erro instanceof ErroDaApi && erro.status === 409) {
                Alert.alert(
                  'Não é possível excluir',
                  'Este aluno tem histórico de matrículas. Arquive em vez de excluir.'
                );
              } else {
                const msg =
                  erro instanceof Error ? erro.message : 'Falha ao excluir o aluno.';
                Alert.alert('Erro', msg);
              }
            }
          },
        },
      ]
    );
  }

  // Renderização através de união discriminada e switch exaustivo (M6-R5)
  switch (estadoAlunos.tipo) {
    case 'carregando':
      return (
        <View style={estilosComuns.container}>
          <ActivityIndicator size="large" color={cores.primaria} />
          <Carregando mensagem="Carregando alunos..." />
        </View>
      );

    case 'erro':
      return (
        <View style={estilosComuns.container}>
          <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
            <View>
              <Text style={estilosComuns.tituloCabecalho}>Alunos</Text>
              <Text style={estilosComuns.subtituloCabecalho}>
                Falha ao carregar
              </Text>
            </View>

            {podeCriar ? (
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={handleAbrirCriacao}
                accessibilityRole="button"
                accessibilityLabel="Cadastrar novo aluno"
              >
                <MaterialIcons name="person-add" size={18} color={colors.white} />
                <Text style={styles.textoBotaoAdicionar}>Novo Aluno</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.cartaoErroTopo}>
            <View style={styles.linhaErroTopo}>
              <MaterialIcons name="error-outline" size={24} color={colors.red[400]} />
              <View style={styles.colunaTextoErro}>
                <Text style={styles.tituloErroTopo}>
                  Não foi possível carregar os alunos
                </Text>
                <Text style={styles.mensagemErroTopo}>{estadoAlunos.mensagem}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botaoTentarDeNovo}
              onPress={recarregarAlunos}
              accessibilityRole="button"
              accessibilityLabel="Tentar carregar alunos de novo"
            >
              <MaterialIcons name="refresh" size={18} color={colors.white} />
              <Text style={styles.textoBotaoTentarDeNovo}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    case 'sucesso': {
      const listaAlunos = estadoAlunos.dados;
      const alunosFiltrados = filtrarAlunos(listaAlunos, busca);

      return (
        <View style={estilosComuns.container}>
          <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
            <View>
              <Text style={estilosComuns.tituloCabecalho}>Alunos</Text>
              <Text style={estilosComuns.subtituloCabecalho}>
                {listaAlunos.length} cadastrado(s)
              </Text>
            </View>

            {podeCriar ? (
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={handleAbrirCriacao}
                accessibilityRole="button"
                accessibilityLabel="Cadastrar novo aluno"
              >
                <MaterialIcons name="person-add" size={18} color={colors.white} />
                <Text style={styles.textoBotaoAdicionar}>Novo Aluno</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.blocoBusca}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.gray[400]}
              style={styles.iconeBusca}
            />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou telefone..."
              placeholderTextColor={colors.gray[500]}
              style={[estilosComuns.input, styles.inputBusca]}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Campo de busca de alunos por nome ou telefone"
            />
            {busca ? (
              <TouchableOpacity
                onPress={() => setBusca('')}
                style={styles.botaoLimparBusca}
                accessibilityLabel="Limpar busca"
              >
                <MaterialIcons name="close" size={18} color={colors.gray[400]} />
              </TouchableOpacity>
            ) : null}
          </View>

          {estadoAcademia.tipo === 'pronto' && estadoAcademia.origem === 'aparelho' && (
            <Text style={{ color: cores.alerta, paddingHorizontal: espacos.md, marginBottom: espacos.sm }}>
              Mostrando os alunos guardados no aparelho: {estadoAcademia.motivo}
            </Text>
          )}

          <FlatList
            key={duasColunas ? 'duas' : 'uma'}
            data={alunosFiltrados}
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
                mensagem={
                  busca.trim()
                    ? 'Nenhum aluno encontrado para a busca.'
                    : 'Nenhum aluno cadastrado.'
                }
                icone="people-outline"
              />
            }
            renderItem={({ item }) => {
              const podeRenovar =
                podeCriarMatricula &&
                Boolean(
                  item.statusMatricula === 'vencida' ||
                    item.statusMatricula === 'inativa' ||
                    item.statusMatricula === 'sem_matricula'
                );

              return (
                <View style={numColunas > 1 ? styles.itemGrade : undefined}>
                  <AlunoCard
                    aluno={item}
                    podeEditar={podeAtualizar}
                    podeDesativar={podeDesativar}
                    podeExcluir={podeExcluir}
                    podeRenovar={podeRenovar}
                    onPress={(aluno) => {
                      navigation.navigate('DetalheAluno', { alunoId: aluno.id });
                    }}
                    onEditar={handleAbrirEdicao}
                    onAlternarAtivo={handleAlternarAtivo}
                    onExcluir={handleExcluir}
                    onRenovar={handleRenovar}
                  />
                </View>
              );
            }}
          />

          <Modal
            visible={modalFormularioVisivel}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => {
              if (!salvando) {
                setModalFormularioVisivel(false);
                setAlunoEmEdicao(null);
                setErrosFormulario({});
              }
            }}
          >
            <View
              style={[
                estilosComuns.container,
                { paddingTop: insets.top + 16, paddingHorizontal: 16 },
              ]}
            >
              <AlunoForm
                alunoInicial={alunoEmEdicao}
                salvando={salvando}
                errosExternos={errosFormulario}
                onSubmit={handleSalvarAluno}
                onCancelar={() => {
                  setModalFormularioVisivel(false);
                  setAlunoEmEdicao(null);
                  setErrosFormulario({});
                }}
              />
            </View>
          </Modal>
        </View>
      );
    }

    default:
      return semCaso(estadoAlunos);
  }
}

const styles = StyleSheet.create({
  linhaColunas: {
    gap: 12,
  },
  itemGrade: {
    flex: 1,
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
  blocoBusca: {
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  iconeBusca: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  inputBusca: {
    paddingLeft: 42,
    paddingRight: 38,
  },
  botaoLimparBusca: {
    position: 'absolute',
    right: 28,
    zIndex: 1,
    padding: 4,
  },
  cartaoErroTopo: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.red[500],
    borderWidth: 1,
    borderRadius: 8,
    gap: 12,
  },
  linhaErroTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colunaTextoErro: {
    flex: 1,
    gap: 2,
  },
  tituloErroTopo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.white,
  },
  mensagemErroTopo: {
    fontSize: 13,
    color: colors.gray[300],
  },
  botaoTentarDeNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.blue[500],
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  textoBotaoTentarDeNovo: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
