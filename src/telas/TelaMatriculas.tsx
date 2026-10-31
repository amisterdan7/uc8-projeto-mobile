import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Aluno, Matricula, Plano } from '@/types/entidades';
import {
  atualizarStatusMatricula,
  criarMatricula,
  ErroApi,
  excluirMatricula,
  listarAlunos,
  listarMatriculas,
  listarPlanos,
} from '@/api';
import { useSessao } from '@/auth';
import {
  Carregando,
  EstadoErro,
  EstadoVazio,
  Selo,
} from '@/components';
import {
  aplicarMascaraData,
  dataBRparaISO,
  formatarDataBR,
} from '@/utils/datas';
import { formatarMoedaBRL } from '@/utils/moeda';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaMatriculas() {
  const insets = useSafeAreaInsets();
  const { podeFazer } = useSessao();

  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para criação de nova matrícula
  const [modalCriacaoVisivel, setModalCriacaoVisivel] = useState(false);
  const [alunosAtivos, setAlunosAtivos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<number | null>(null);
  const [planoSelecionadoId, setPlanoSelecionadoId] = useState<number | null>(null);
  const [dataInicioBR, setDataInicioBR] = useState('');
  const [carregandoFormulario, setCarregandoFormulario] = useState(false);
  const [salvandoMatricula, setSalvandoMatricula] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');

  const podeCriar = podeFazer('matriculas:criar');
  const podeAtualizarStatus = podeFazer('matriculas:atualizar-status');
  const podeExcluir = podeFazer('matriculas:excluir');

  async function carregarDados(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro(null);

    try {
      const lista = await listarMatriculas();
      setMatriculas(lista);
    } catch (e: any) {
      if (e instanceof ErroApi) {
        setErro(e.message);
      } else {
        setErro('Não foi possível carregar as matrículas.');
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

  async function handleAbrirCriacao() {
    setModalCriacaoVisivel(true);
    setCarregandoFormulario(true);
    setErroFormulario('');
    setAlunoSelecionadoId(null);
    setPlanoSelecionadoId(null);
    setDataInicioBR('');

    try {
      const [todosAlunos, todosPlanos] = await Promise.all([
        listarAlunos(),
        listarPlanos(),
      ]);

      // Apenas alunos com ativo === true podem ser matriculados
      const apenasAtivos = todosAlunos.filter((a) => a.ativo);
      setAlunosAtivos(apenasAtivos);
      setPlanos(todosPlanos);

      if (apenasAtivos.length > 0) {
        setAlunoSelecionadoId(apenasAtivos[0].id);
      }
      if (todosPlanos.length > 0) {
        setPlanoSelecionadoId(todosPlanos[0].id);
      }
    } catch (e: any) {
      setErroFormulario('Não foi possível carregar alunos ou planos para a matrícula.');
    } finally {
      setCarregandoFormulario(false);
    }
  }

  async function handleSubmeterCriacao() {
    if (!alunoSelecionadoId || !planoSelecionadoId) {
      setErroFormulario('Selecione um aluno e um plano.');
      return;
    }

    let dataISO: string | undefined = undefined;
    if (dataInicioBR.trim()) {
      if (dataInicioBR.length !== 10) {
        setErroFormulario('Data de início deve estar no formato DD/MM/AAAA ou ser deixada vazia (hoje).');
        return;
      }
      dataISO = dataBRparaISO(dataInicioBR);
    }

    setSalvandoMatricula(true);
    setErroFormulario('');

    try {
      const nova = await criarMatricula(
        alunoSelecionadoId,
        planoSelecionadoId,
        dataISO
      );

      setModalCriacaoVisivel(false);
      const dataFimFormatada = formatarDataBR(nova.dataFimEstimada);
      Alert.alert(
        'Matrícula Criada com Sucesso!',
        `A matrícula foi registrada. Término estimado calculado pela API: ${dataFimFormatada}.`
      );
      await carregarDados(true);
    } catch (e: any) {
      const msg = e instanceof ErroApi ? e.message : 'Falha ao registrar matrícula.';
      setErroFormulario(msg);
    } finally {
      setSalvandoMatricula(false);
    }
  }

  function handleAlternarStatus(item: Matricula) {
    const novoStatus = item.status === 'ativa' ? 'inativa' : 'ativa';
    const acao = novoStatus === 'ativa' ? 'reativar' : 'inativar';

    Alert.alert(
      `Confirmar ${acao}`,
      `Deseja realmente ${acao} a matrícula de "${item.alunoNome ?? 'Aluno'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: novoStatus === 'ativa' ? 'Reativar' : 'Inativar',
          style: novoStatus === 'ativa' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await atualizarStatusMatricula(item.id, novoStatus);
              await carregarDados(true);
            } catch (e: any) {
              const msg = e instanceof ErroApi ? e.message : `Falha ao ${acao} matrícula.`;
              Alert.alert('Erro', msg);
            }
          },
        },
      ]
    );
  }

  function handleExcluirMatricula(item: Matricula) {
    Alert.alert(
      'Excluir Matrícula',
      `Deseja excluir definitivamente esta matrícula inativa de "${item.alunoNome ?? 'Aluno'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirMatricula(item.id);
              await carregarDados(true);
            } catch (e: any) {
              const msg = e instanceof ErroApi ? e.message : 'Falha ao excluir matrícula.';
              Alert.alert('Erro', msg);
            }
          },
        },
      ]
    );
  }

  if (carregando) {
    return <Carregando mensagem="Carregando matrículas..." />;
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
          <Text style={estilosComuns.tituloCabecalho}>Matrículas</Text>
          <Text style={estilosComuns.subtituloCabecalho}>
            {matriculas.length} matrícula(s) registrada(s)
          </Text>
        </View>

        {podeCriar ? (
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={handleAbrirCriacao}
          >
            <MaterialIcons name="add-task" size={18} color={colors.white} />
            <Text style={styles.textoBotaoAdicionar}>Nova Matrícula</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={matriculas}
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
            mensagem="Nenhuma matrícula cadastrada até o momento."
            icone="assignment"
          />
        }
        renderItem={({ item }) => {
          const isAtiva = item.status === 'ativa';
          const isInativa = item.status === 'inativa';

          return (
            <View style={estilosComuns.cartao}>
              <View style={styles.linhaTopo}>
                <View style={styles.colunaAluno}>
                  <Text style={estilosComuns.tituloCartao}>
                    {item.alunoNome ?? `Aluno #${item.idAluno}`}
                  </Text>
                  <Text style={styles.textoPlano}>
                    Plano: {item.planoNome ?? `Plano #${item.idPlano}`}
                  </Text>
                </View>

                <Selo status={item.status} />
              </View>

              <View style={styles.blocoDatas}>
                <View style={styles.itemData}>
                  <MaterialIcons name="event" size={15} color={colors.gray[400]} />
                  <Text style={estilosComuns.textoMutavel}>
                    Início: {formatarDataBR(item.dataInicio)}
                  </Text>
                </View>

                <View style={styles.itemData}>
                  <MaterialIcons name="event-available" size={15} color={colors.gray[400]} />
                  <Text style={estilosComuns.textoMutavel}>
                    Término estimado: {formatarDataBR(item.dataFimEstimada)}
                  </Text>
                </View>
              </View>

              {(podeAtualizarStatus || (podeExcluir && isInativa)) ? (
                <View style={estilosComuns.linhaAcoes}>
                  {podeAtualizarStatus ? (
                    <TouchableOpacity
                      style={estilosComuns.botaoAcao}
                      onPress={() => handleAlternarStatus(item)}
                    >
                      <MaterialIcons
                        name={isAtiva ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={16}
                        color={isAtiva ? colors.red[400] : '#4ade80'}
                      />
                      <Text style={estilosComuns.textoBotaoAcao}>
                        {isAtiva ? 'Inativar' : 'Reativar'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {podeExcluir && isInativa ? (
                    <TouchableOpacity
                      style={[estilosComuns.botaoAcao, styles.botaoExcluir]}
                      onPress={() => handleExcluirMatricula(item)}
                    >
                      <MaterialIcons
                        name="delete-outline"
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
          );
        }}
      />

      <Modal
        visible={modalCriacaoVisivel}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (!salvandoMatricula) setModalCriacaoVisivel(false);
        }}
      >
        <View
          style={[
            estilosComuns.container,
            { paddingTop: insets.top + 16, paddingHorizontal: 16 },
          ]}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.cartaoModal}>
              <Text style={estilosComuns.tituloCabecalho}>Nova Matrícula</Text>

              {carregandoFormulario ? (
                <ActivityIndicator
                  color={colors.blue[400]}
                  style={{ marginVertical: 32 }}
                />
              ) : (
                <>
                  <View style={styles.grupoCampo}>
                    <Text style={styles.rotulo}>Selecione o Aluno (Apenas Ativos) *</Text>
                    {alunosAtivos.length === 0 ? (
                      <Text style={styles.avisoNenhum}>
                        Nenhum aluno ativo encontrado para matricular.
                      </Text>
                    ) : (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carrosselOpcoes}
                      >
                        {alunosAtivos.map((a) => {
                          const selecionado = alunoSelecionadoId === a.id;
                          return (
                            <TouchableOpacity
                              key={a.id}
                              style={[
                                styles.chipOpcao,
                                selecionado && styles.chipSelecionado,
                              ]}
                              onPress={() => setAlunoSelecionadoId(a.id)}
                            >
                              <Text
                                style={[
                                  styles.textoChip,
                                  selecionado && styles.textoChipSelecionado,
                                ]}
                              >
                                {a.nome}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.rotulo}>Selecione o Plano *</Text>
                    <View style={styles.gradePlanos}>
                      {planos.map((p) => {
                        const selecionado = planoSelecionadoId === p.id;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            style={[
                              styles.cardOpcaoPlano,
                              selecionado && styles.cardPlanoSelecionado,
                            ]}
                            onPress={() => setPlanoSelecionadoId(p.id)}
                          >
                            <Text style={styles.nomePlano}>{p.nome}</Text>
                            <Text style={styles.precoPlano}>
                              {formatarMoedaBRL(p.preco)}
                            </Text>
                            <Text style={styles.duracaoPlano}>
                              {p.duracaoMeses === 1
                                ? '1 mês'
                                : `${p.duracaoMeses} meses`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.rotulo}>
                      Data de Início (opcional, padrão: hoje no servidor)
                    </Text>
                    <TextInput
                      value={dataInicioBR}
                      onChangeText={(t) => setDataInicioBR(aplicarMascaraData(t))}
                      placeholder="DD/MM/AAAA (deixe vazio para hoje)"
                      placeholderTextColor={colors.gray[500]}
                      keyboardType="number-pad"
                      maxLength={10}
                      style={estilosComuns.input}
                      editable={!salvandoMatricula}
                    />
                  </View>

                  {erroFormulario ? (
                    <Text style={styles.textoErro}>{erroFormulario}</Text>
                  ) : null}

                  <View style={styles.linhaBotoesForm}>
                    <TouchableOpacity
                      style={[styles.botaoForm, styles.botaoCancelar]}
                      onPress={() => setModalCriacaoVisivel(false)}
                      disabled={salvandoMatricula}
                    >
                      <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.botaoForm,
                        estilosComuns.botaoPrimario,
                        alunosAtivos.length === 0 && styles.botaoDesabilitado,
                      ]}
                      onPress={handleSubmeterCriacao}
                      disabled={salvandoMatricula || alunosAtivos.length === 0}
                    >
                      {salvandoMatricula ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Text style={estilosComuns.textoBotaoPrimario}>
                          Efetivar Matrícula
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
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
  linhaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  colunaAluno: {
    flex: 1,
    gap: 2,
  },
  textoPlano: {
    color: colors.blue[300],
    fontSize: 14,
    fontWeight: '500',
  },
  blocoDatas: {
    gap: 4,
    marginTop: 4,
  },
  itemData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  botaoExcluir: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  textoExcluir: {
    color: colors.red[400],
  },
  cartaoModal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 16,
  },
  grupoCampo: {
    gap: 8,
  },
  rotulo: {
    color: colors.gray[300],
    fontSize: 13,
    fontWeight: '600',
  },
  avisoNenhum: {
    color: colors.gray[400],
    fontStyle: 'italic',
    fontSize: 13,
  },
  carrosselOpcoes: {
    gap: 8,
    paddingVertical: 4,
  },
  chipOpcao: {
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipSelecionado: {
    backgroundColor: colors.blue[500],
    borderColor: colors.blue[400],
  },
  textoChip: {
    color: colors.gray[300],
    fontSize: 13,
  },
  textoChipSelecionado: {
    color: colors.white,
    fontWeight: 'bold',
  },
  gradePlanos: {
    gap: 8,
  },
  cardOpcaoPlano: {
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPlanoSelecionado: {
    borderColor: colors.blue[400],
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  nomePlano: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  precoPlano: {
    color: '#4ade80',
    fontWeight: 'bold',
    fontSize: 14,
  },
  duracaoPlano: {
    color: colors.gray[400],
    fontSize: 12,
  },
  textoErro: {
    color: colors.red[400],
    fontSize: 13,
  },
  linhaBotoesForm: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  botaoForm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    backgroundColor: colors.gray[800],
  },
  textoBotaoCancelar: {
    color: colors.gray[300],
    fontWeight: '600',
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
});
