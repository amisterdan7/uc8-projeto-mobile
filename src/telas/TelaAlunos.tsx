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
import { registrarErro } from '../erros/erros';
import { useSessao } from '@/auth';
import { colunasPara } from '@/utils/responsividade';
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

  const [busca, setBusca] = useState('');
  const [modalFormularioVisivel, setModalFormularioVisivel] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  async function handlePullToRefresh() {
    setAtualizando(true);
    await recarregarAlunos();
    setAtualizando(false);
  }

  function handleAbrirCriacao() {
    setAlunoEmEdicao(null);
    setModalFormularioVisivel(true);
  }

  function handleAbrirEdicao(aluno: Aluno) {
    setAlunoEmEdicao(aluno);
    setModalFormularioVisivel(true);
  }

  async function handleSalvarAluno(
    nome: string,
    dataNascimentoISO: string,
    telefone: string
  ) {
    setSalvando(true);
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
      Alert.alert('Erro', 'Não foi possível salvar os dados do aluno.');
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
      `Esta ação é irreversível. O aluno "${aluno.nome}" e todas as suas matrículas serão removidos do sistema.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir definitivamente',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirAluno(aluno.id);
            } catch {
              Alert.alert('Erro', 'Falha ao excluir o aluno.');
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
        <EstadoErro
          mensagem={estadoAlunos.mensagem}
          onTentarNovamente={recarregarAlunos}
        />
      );

    case 'sucesso': {
      const listaAlunos = estadoAlunos.dados;
      const termo = busca.trim().toLowerCase();
      const termoNumeros = termo.replace(/\D/g, '');

      const alunosFiltrados = !termo
        ? listaAlunos
        : listaAlunos.filter((aluno) => {
            const nomeMatch = aluno.nome.toLowerCase().includes(termo);
            const telNumeros = aluno.telefone ? aluno.telefone.replace(/\D/g, '') : '';
            const telMatch = termoNumeros.length > 0 && telNumeros.includes(termoNumeros);
            return nomeMatch || telMatch;
          });

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
                  busca
                    ? 'Nenhum aluno encontrado para a busca informada.'
                    : 'Nenhum aluno cadastrado.'
                }
                icone="people-outline"
              />
            }
            renderItem={({ item }) => (
              <View style={numColunas > 1 ? styles.itemGrade : undefined}>
                <AlunoCard
                  aluno={item}
                  podeEditar={podeAtualizar}
                  podeDesativar={podeDesativar}
                  podeExcluir={podeExcluir}
                  onPress={(aluno) => {
                    navigation.navigate('DetalheAluno', { alunoId: aluno.id });
                  }}
                  onEditar={handleAbrirEdicao}
                  onAlternarAtivo={handleAlternarAtivo}
                  onExcluir={handleExcluir}
                />
              </View>
            )}
          />

          <Modal
            visible={modalFormularioVisivel}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => {
              if (!salvando) {
                setModalFormularioVisivel(false);
                setAlunoEmEdicao(null);
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
                onSubmit={handleSalvarAluno}
                onCancelar={() => {
                  setModalFormularioVisivel(false);
                  setAlunoEmEdicao(null);
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
});
