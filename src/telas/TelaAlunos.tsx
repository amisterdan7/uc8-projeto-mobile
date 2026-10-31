import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Aluno } from '@/types/entidades';
import {
  alterarStatusAtivoAluno,
  atualizarAluno,
  criarAluno,
  ErroApi,
  excluirAluno,
  listarAlunos,
} from '@/api';
import { useSessao } from '@/auth';
import { AlunoCard, AlunoForm, Carregando, EstadoErro, EstadoVazio } from '@/components';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaAlunos() {
  const insets = useSafeAreaInsets();
  const { podeFazer } = useSessao();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState('');
  const [modalFormularioVisivel, setModalFormularioVisivel] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | null>(null);
  const [salvando, setSalvando] = useState(false);

  const podeCriar = podeFazer('alunos:criar');
  const podeAtualizar = podeFazer('alunos:atualizar');
  const podeDesativar = podeFazer('alunos:desativar');
  const podeExcluir = podeFazer('alunos:excluir');

  async function carregarDados(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro(null);

    try {
      const lista = await listarAlunos();
      setAlunos(lista);
    } catch (e: any) {
      if (e instanceof ErroApi) {
        setErro(e.message);
      } else {
        setErro('Não foi possível carregar a lista de alunos.');
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handlePullToRefresh() {
    setAtualizando(true);
    carregarDados(true);
  }

  const alunosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return alunos;

    const termoNumeros = termo.replace(/\D/g, '');

    return alunos.filter((aluno) => {
      const nomeMatch = aluno.nome.toLowerCase().includes(termo);
      const telNumeros = aluno.telefone ? aluno.telefone.replace(/\D/g, '') : '';
      const telMatch = termoNumeros.length > 0 && telNumeros.includes(termoNumeros);
      return nomeMatch || telMatch;
    });
  }, [alunos, busca]);

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
      await carregarDados(true);
    } catch (e: any) {
      const msg = e instanceof ErroApi ? e.message : 'Não foi possível salvar os dados do aluno.';
      Alert.alert('Erro', msg);
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
              await alterarStatusAtivoAluno(aluno.id, novoStatus);
              await carregarDados(true);
            } catch (e: any) {
              const msg = e instanceof ErroApi ? e.message : `Falha ao ${acaoTexto} aluno.`;
              Alert.alert('Erro', msg);
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
              await carregarDados(true);
            } catch (e: any) {
              const msg = e instanceof ErroApi ? e.message : 'Falha ao excluir aluno.';
              Alert.alert('Erro', msg);
            }
          },
        },
      ]
    );
  }

  if (carregando) {
    return <Carregando mensagem="Carregando alunos..." />;
  }

  if (erro) {
    return (
      <EstadoErro
        mensagem={erro}
        onTentarNovamente={() => carregarDados(false)}
      />
    );
  }

  return (
    <View style={estilosComuns.container}>
      <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={estilosComuns.tituloCabecalho}>Alunos</Text>
          <Text style={estilosComuns.subtituloCabecalho}>
            {alunos.length} cadastrado(s)
          </Text>
        </View>

        {podeCriar ? (
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={handleAbrirCriacao}
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
        />
        {busca ? (
          <TouchableOpacity
            onPress={() => setBusca('')}
            style={styles.botaoLimparBusca}
          >
            <MaterialIcons name="close" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={alunosFiltrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          estilosComuns.conteudo,
          { paddingBottom: insets.bottom + 20 },
        ]}
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
          <AlunoCard
            aluno={item}
            podeEditar={podeAtualizar}
            podeDesativar={podeDesativar}
            podeExcluir={podeExcluir}
            onEditar={handleAbrirEdicao}
            onAlternarAtivo={handleAlternarAtivo}
            onExcluir={handleExcluir}
          />
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

const styles = StyleSheet.create({
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
