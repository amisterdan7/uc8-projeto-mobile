import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Aluno, Matricula } from '@/types/entidades';
import type { NavegacaoAppProp, RotasAutenticadasStackParamList } from '@/navegacao/tipos';
import { useDados } from '@/dados';
import { useSessao } from '@/auth';
import { ErroDaApi } from '@/api';
import { extrairErrosCampos } from '../erros/erros';
import { AlunoForm, Carregando, EstadoErro, Selo } from '@/components';
import { cores, espacos } from '../tema/tema';
import { formatarDataBR } from '@/utils/datas';
import { formatarTelefone } from '@/utils/telefone';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

type RotaDetalheProp = RouteProp<RotasAutenticadasStackParamList, 'DetalheAluno'>;

export function TelaDetalheAluno() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavegacaoAppProp>();
  const route = useRoute<RotaDetalheProp>();
  const { alunoId } = route.params;

  const {
    estadoAlunos,
    estadoMatriculas,
    atualizarAluno,
    arquivarAluno,
    restaurarAluno,
    excluirAluno,
  } = useDados();

  const { podeFazer } = useSessao();
  const podeAtualizar = podeFazer('alunos:atualizar');
  const podeDesativar = podeFazer('alunos:desativar');
  const podeExcluir = podeFazer('alunos:excluir');
  const podeCriarMatricula = podeFazer('matriculas:criar');

  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
  const [errosEdicao, setErrosEdicao] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  if (estadoAlunos.tipo === 'carregando') {
    return (
      <View style={estilosComuns.container}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Carregando mensagem="Carregando detalhes do aluno..." />
      </View>
    );
  }

  if (estadoAlunos.tipo === 'erro') {
    return (
      <EstadoErro
        mensagem={estadoAlunos.mensagem}
        onTentarNovamente={() => navigation.goBack()}
      />
    );
  }

  const aluno = estadoAlunos.dados.find((a) => a.id === alunoId);
  if (!aluno) {
    return (
      <EstadoErro
        mensagem="Aluno não encontrado ou foi removido."
        onTentarNovamente={() => navigation.goBack()}
      />
    );
  }

  const matriculasDoAluno =
    estadoMatriculas.tipo === 'sucesso'
      ? estadoMatriculas.dados.filter((m) => m.idAluno === alunoId)
      : [];

  async function handleSalvarEdicao(
    nome: string,
    dataNascimentoISO: string,
    telefone: string
  ) {
    if (!aluno) return;
    setSalvando(true);
    setErrosEdicao({});
    try {
      await atualizarAluno(aluno.id, nome, dataNascimentoISO, telefone);
      setModalEdicaoVisivel(false);
      Alert.alert('Sucesso', 'Dados do aluno atualizados com sucesso.');
    } catch (falha: unknown) {
      if (falha instanceof ErroDaApi && falha.status === 409) {
        Alert.alert(
          'Não foi possível salvar',
          'Já existe um aluno com esse nome e data de nascimento.'
        );
      } else if (falha instanceof ErroDaApi && falha.status === 400 && falha.detalhes) {
        setErrosEdicao(extrairErrosCampos(falha));
        Alert.alert('Dados inválidos', 'Verifique os campos destacados em vermelho.');
      } else {
        const msg =
          falha instanceof Error
            ? falha.message
            : 'Não foi possível atualizar os dados do aluno.';
        Alert.alert('Erro', msg);
      }
    } finally {
      setSalvando(false);
    }
  }

  function handleAlternarAtivo() {
    if (!aluno) return;
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

  function handleExcluir() {
    if (!aluno) return;
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
              navigation.goBack();
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

  return (
    <View style={estilosComuns.container}>
      <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.botaoVoltar}
          accessibilityLabel="Voltar para a lista"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={[estilosComuns.tituloCabecalho, styles.tituloTruncado]}>
          {aluno.nome}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          estilosComuns.conteudo,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={estilosComuns.cartao}>
          <View style={styles.linhaTopo}>
            <Text style={estilosComuns.tituloCartao}>Dados Cadastrais</Text>
            {aluno.ativo ? (
              <Selo status={aluno.statusMatricula ?? 'sem_matricula'} />
            ) : (
              <Selo status="arquivado" />
            )}
          </View>

          <View style={styles.linhaInfo}>
            <MaterialIcons name="cake" size={18} color={colors.gray[400]} />
            <Text style={estilosComuns.textoMutavel}>
              Nascimento: {formatarDataBR(aluno.dataNascimento)}
            </Text>
          </View>

          <View style={styles.linhaInfo}>
            <MaterialIcons name="phone" size={18} color={colors.gray[400]} />
            <Text style={estilosComuns.textoMutavel}>
              Telefone: {formatarTelefone(aluno.telefone)}
            </Text>
          </View>

          {aluno.planoNome ? (
            <View style={styles.linhaInfo}>
              <MaterialIcons name="credit-card" size={18} color={colors.blue[400]} />
              <Text style={styles.textoPlanoAtivo}>
                Plano Atual: {aluno.planoNome}
              </Text>
            </View>
          ) : null}

          {podeCriarMatricula &&
          (aluno.statusMatricula === 'vencida' ||
            aluno.statusMatricula === 'inativa' ||
            aluno.statusMatricula === 'sem_matricula') ? (
            <TouchableOpacity
              style={[estilosComuns.botaoAcao, styles.botaoRenovar]}
              onPress={() => {
                navigation.navigate('Abas', {
                  screen: 'Matriculas',
                  params: { alunoId: aluno.id },
                });
              }}
            >
              <MaterialIcons name="autorenew" size={16} color={colors.green[300]} />
              <Text style={[estilosComuns.textoBotaoAcao, styles.textoRenovar]}>
                Renovar Matrícula
              </Text>
            </TouchableOpacity>
          ) : null}

          {(podeAtualizar || podeDesativar || (podeExcluir && !aluno.ativo)) ? (
            <View style={[estilosComuns.linhaAcoes, { marginTop: 12 }]}>
              {podeAtualizar ? (
                <TouchableOpacity
                  style={estilosComuns.botaoAcao}
                  onPress={() => setModalEdicaoVisivel(true)}
                >
                  <MaterialIcons name="edit" size={16} color={colors.blue[400]} />
                  <Text style={estilosComuns.textoBotaoAcao}>Editar dados</Text>
                </TouchableOpacity>
              ) : null}

              {podeDesativar ? (
                <TouchableOpacity
                  style={estilosComuns.botaoAcao}
                  onPress={handleAlternarAtivo}
                >
                  <MaterialIcons
                    name={aluno.ativo ? 'archive' : 'unarchive'}
                    size={16}
                    color={aluno.ativo ? colors.red[400] : colors.blue[400]}
                  />
                  <Text style={estilosComuns.textoBotaoAcao}>
                    {aluno.ativo ? 'Arquivar' : 'Restaurar'}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {podeExcluir && !aluno.ativo ? (
                <TouchableOpacity
                  style={[estilosComuns.botaoAcao, styles.botaoExcluir]}
                  onPress={handleExcluir}
                >
                  <MaterialIcons
                    name="delete-forever"
                    size={16}
                    color={colors.red[400]}
                  />
                  <Text style={[estilosComuns.textoBotaoAcao, styles.textoExcluir]}>
                    Excluir
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloCartao}>Histórico de Matrículas</Text>
          {matriculasDoAluno.length === 0 ? (
            <Text style={styles.textoVazio}>
              Nenhuma matrícula vinculada a este aluno.
            </Text>
          ) : (
            matriculasDoAluno.map((mat: Matricula) => (
              <View key={mat.id} style={styles.itemMatricula}>
                <View style={styles.linhaTopo}>
                  <Text style={styles.nomePlanoMatricula}>
                    {mat.planoNome ?? `Plano #${mat.idPlano}`}
                  </Text>
                  <Selo status={mat.status} />
                </View>
                <Text style={styles.textoDatasMatricula}>
                  {formatarDataBR(mat.dataInicio)} até {formatarDataBR(mat.dataFimEstimada)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalEdicaoVisivel}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (!salvando) setModalEdicaoVisivel(false);
        }}
      >
        <View
          style={[
            estilosComuns.container,
            { paddingTop: insets.top + 16, paddingHorizontal: 16 },
          ]}
        >
          <AlunoForm
            alunoInicial={aluno}
            salvando={salvando}
            errosExternos={errosEdicao}
            onSubmit={handleSalvarEdicao}
            onCancelar={() => {
              setModalEdicaoVisivel(false);
              setErrosEdicao({});
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  botaoRenovar: {
    borderColor: colors.green[300],
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  textoRenovar: {
    color: colors.green[300],
    fontWeight: 'bold',
  },
  botaoVoltar: {
    padding: 4,
  },
  tituloTruncado: {
    flex: 1,
    textAlign: 'center',
  },
  linhaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  textoPlanoAtivo: {
    color: colors.blue[300],
    fontSize: 14,
    fontWeight: '600',
  },
  botaoExcluir: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  textoExcluir: {
    color: colors.red[400],
  },
  textoVazio: {
    color: colors.gray[400],
    fontSize: 13,
    marginTop: 4,
  },
  itemMatricula: {
    backgroundColor: colors.gray[900],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[800],
    marginTop: 8,
    gap: 4,
  },
  nomePlanoMatricula: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  textoDatasMatricula: {
    color: colors.gray[400],
    fontSize: 12,
  },
});
