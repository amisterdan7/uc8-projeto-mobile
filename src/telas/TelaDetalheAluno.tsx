import React, { useState } from 'react';
import {
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
import type { RotasAutenticadasStackParamList } from '@/navegacao/tipos';
import { useDados } from '@/dados';
import { useSessao } from '@/auth';
import { AlunoForm, Carregando, EstadoErro, Selo } from '@/components';
import { formatarDataBR } from '@/utils/datas';
import { formatarTelefone } from '@/utils/telefone';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

type RotaDetalheProp = RouteProp<RotasAutenticadasStackParamList, 'DetalheAluno'>;

export function TelaDetalheAluno() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
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

  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
  const [salvando, setSalvando] = useState(false);

  if (estadoAlunos.tipo === 'carregando') {
    return <Carregando mensagem="Carregando detalhes do aluno..." />;
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
    try {
      await atualizarAluno(aluno.id, nome, dataNascimentoISO, telefone);
      setModalEdicaoVisivel(false);
      Alert.alert('Sucesso', 'Dados do aluno atualizados com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar os dados do aluno.');
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
      `Esta ação é irreversível. O aluno "${aluno.nome}" e todas as suas matrículas serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir definitivamente',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirAluno(aluno.id);
              navigation.goBack();
            } catch {
              Alert.alert('Erro', 'Falha ao excluir o aluno.');
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
            onSubmit={handleSalvarEdicao}
            onCancelar={() => setModalEdicaoVisivel(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
