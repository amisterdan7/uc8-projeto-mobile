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
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Matricula } from '@/types/entidades';
import type { AbasAppParamList, NavegacaoAppProp } from '@/navegacao/tipos';
import { semCaso } from '@/types/estadoTela';
import { useAcademia } from '@/contexto';
import { useSessao } from '@/auth';
import { ErroDaApi } from '@/api';
import { Campo, Carregando, EstadoErro, EstadoVazio, Selo } from '@/components';
import { extrairErrosCampos, registrarErro } from '../erros/erros';
import { cores, larguraLarga } from '../tema/tema';
import { colunasPara } from '@/utils/responsividade';
import {
  aplicarMascaraData,
  dataBRparaISO,
  formatarDataBR,
  validarDataCivilBR,
} from '@/utils/datas';
import { formatarMoedaBRL } from '@/utils/moeda';
import {
  agruparMatriculasPorAluno,
  alunosElegiveisParaMatricula,
} from '@/utils/matriculas';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaMatriculas() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavegacaoAppProp>();
  const route = useRoute<RouteProp<AbasAppParamList, 'Matriculas'>>();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;
  const numColunas = colunasPara(width);

  const {
    estadoMatriculas,
    estadoAlunos,
    estadoPlanos,
    recarregarMatriculas,
    recarregarAlunos,
    criarMatricula,
    mudarStatusMatricula,
    excluirMatricula,
  } = useAcademia();

  const { podeFazer } = useSessao();
  const podeCriar = podeFazer('matriculas:criar');
  const podeCriarAluno = podeFazer('alunos:criar') && podeCriar;
  const podeAtualizarStatus = podeFazer('matriculas:atualizar-status');
  const podeExcluir = podeFazer('matriculas:excluir');

  const [modalCriacaoVisivel, setModalCriacaoVisivel] = useState(false);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<number | null>(null);
  const [planoSelecionadoId, setPlanoSelecionadoId] = useState<number | null>(null);
  const [dataInicioBR, setDataInicioBR] = useState('');
  const [salvandoMatricula, setSalvandoMatricula] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});
  const [atualizando, setAtualizando] = useState(false);
  const [historicosAbertos, setHistoricosAbertos] = useState<Record<number, boolean>>({});

  const alunosElegiveis =
    estadoAlunos.tipo === 'pronto'
      ? alunosElegiveisParaMatricula(estadoAlunos.dados)
      : [];
  const planosDisponiveis =
    estadoPlanos.tipo === 'pronto' ? estadoPlanos.dados : [];

  useEffect(() => {
    const params = route.params as
      | { alunoId?: number; abrirCriacao?: boolean }
      | undefined;

    if (!podeCriar) return;

    if (params?.alunoId) {
      setErroFormulario('');
      setErrosCampos({});
      setDataInicioBR('');
      setAlunoSelecionadoId(params.alunoId);
      if (planosDisponiveis.length > 0 && !planoSelecionadoId) {
        setPlanoSelecionadoId(planosDisponiveis[0].id);
      }
      setModalCriacaoVisivel(true);
    } else if (params?.abrirCriacao) {
      handleAbrirCriacao();
    }
  }, [route.params, podeCriar, estadoPlanos.tipo]);

  async function handlePullToRefresh() {
    setAtualizando(true);
    await Promise.all([recarregarMatriculas(), recarregarAlunos()]);
    setAtualizando(false);
  }

  function alternarHistorico(idAluno: number) {
    setHistoricosAbertos((anterior) => ({
      ...anterior,
      [idAluno]: !anterior[idAluno],
    }));
  }

  function handleAbrirCriacao() {
    setErroFormulario('');
    setErrosCampos({});
    setDataInicioBR('');

    setAlunoSelecionadoId(
      alunosElegiveis.length > 0 ? alunosElegiveis[0].id : null
    );
    setPlanoSelecionadoId(
      planosDisponiveis.length > 0 ? planosDisponiveis[0].id : null
    );
    setModalCriacaoVisivel(true);
  }

  function handleIrParaCadastroAluno() {
    setModalCriacaoVisivel(false);
    navigation.navigate('Abas', {
      screen: 'Alunos',
      params: { abrirCadastro: true },
    });
  }

  async function handleSubmeterCriacao() {
    if (!alunoSelecionadoId || !planoSelecionadoId) {
      setErroFormulario('Selecione um aluno elegível e um plano.');
      return;
    }

    let dataISO: string | undefined = undefined;
    if (dataInicioBR.trim()) {
      const validacao = validarDataCivilBR(dataInicioBR.trim());
      if (!validacao.valida) {
        setErroFormulario(
          validacao.mensagem ??
            'Data de início deve estar no formato DD/MM/AAAA ou ficar em branco.'
        );
        return;
      }
      dataISO = dataBRparaISO(dataInicioBR.trim());
    }

    setSalvandoMatricula(true);
    setErroFormulario('');
    setErrosCampos({});

    try {
      const nova = await criarMatricula(
        alunoSelecionadoId,
        planoSelecionadoId,
        dataISO
      );

      setModalCriacaoVisivel(false);
      const dataFimFormatada = formatarDataBR(nova.dataFimEstimada);
      Alert.alert(
        'Sucesso',
        `Matrícula criada. Vence em ${dataFimFormatada}.`
      );
    } catch (falha: unknown) {
      registrarErro('cadastro matricula', falha);
      if (falha instanceof ErroDaApi && falha.status === 409) {
        const msgTexto = (falha.message || '').toLowerCase();
        if (msgTexto.includes('arquivado')) {
          setErroFormulario('O aluno está arquivado e não pode receber nova matrícula.');
        } else if (msgTexto.includes('ativa')) {
          setErroFormulario('O aluno já possui uma matrícula ativa não vencida.');
        } else {
          setErroFormulario(falha.message || 'Conflito ao registrar matrícula.');
        }
      } else if (falha instanceof ErroDaApi && falha.status === 400 && falha.detalhes) {
        setErrosCampos(extrairErrosCampos(falha));
        setErroFormulario('Verifique os campos destacados.');
      } else {
        const msg =
          falha instanceof Error
            ? falha.message
            : 'Falha ao registrar matrícula no servidor.';
        setErroFormulario(msg);
      }
    } finally {
      setSalvandoMatricula(false);
    }
  }

  function handleAlternarStatus(item: Matricula) {
    const novoStatus = item.status === 'ativa' ? 'inativa' : 'ativa';
    const acao = novoStatus === 'ativa' ? 'reativar' : 'inativar';

    Alert.alert(
      `Confirmar ${acao}`,
      `Deseja realmente ${acao} a matrícula atual de "${item.alunoNome ?? 'Aluno'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: novoStatus === 'ativa' ? 'Reativar' : 'Inativar',
          style: novoStatus === 'ativa' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await mudarStatusMatricula(item.id, novoStatus);
            } catch (falha: unknown) {
              if (falha instanceof ErroDaApi && falha.status === 409) {
                Alert.alert(
                  'Não foi possível reativar',
                  'Já existe uma matrícula ativa para este aluno.'
                );
              } else {
                const msg =
                  falha instanceof Error ? falha.message : `Falha ao ${acao} matrícula.`;
                Alert.alert('Erro', msg);
              }
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
            } catch {
              Alert.alert('Erro', 'Falha ao excluir matrícula.');
            }
          },
        },
      ]
    );
  }

  // Renderização através de união discriminada e switch exaustivo (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
  switch (estadoMatriculas.tipo) {
    case 'carregando':
      return <Carregando mensagem="Carregando matrículas..." />;

    case 'erro':
      return (
        <View style={estilosComuns.container}>
          <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
            <View>
              <Text style={estilosComuns.tituloCabecalho}>Matrículas</Text>
              <Text style={estilosComuns.subtituloCabecalho}>
                Falha ao carregar
              </Text>
            </View>

            {podeCriar ? (
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={handleAbrirCriacao}
                accessibilityRole="button"
                accessibilityLabel="Criar nova matrícula"
              >
                <MaterialIcons name="add-task" size={18} color={colors.white} />
                <Text style={styles.textoBotaoAdicionar}>Nova matrícula</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <EstadoErro
            mensagem={estadoMatriculas.mensagem}
            onTentarNovamente={recarregarMatriculas}
          />
        </View>
      );

    case 'pronto': {
      const listaMatriculas = estadoMatriculas.dados;
      const gruposPorAluno = agruparMatriculasPorAluno(listaMatriculas);

      return (
        <View style={estilosComuns.container}>
          <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
            <View>
              <Text style={estilosComuns.tituloCabecalho}>Matrículas</Text>
              <Text style={estilosComuns.subtituloCabecalho}>
                {gruposPorAluno.length} aluno(s) com matrícula
              </Text>
            </View>

            {podeCriar ? (
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={handleAbrirCriacao}
                accessibilityRole="button"
                accessibilityLabel="Criar nova matrícula"
              >
                <MaterialIcons name="add-task" size={18} color={colors.white} />
                <Text style={styles.textoBotaoAdicionar}>Nova matrícula</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            key={duasColunas ? 'duas' : 'uma'}
            data={gruposPorAluno}
            numColumns={duasColunas ? 2 : 1}
            keyExtractor={(grupo) => String(grupo.idAluno)}
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
                mensagem="Nenhuma matrícula cadastrada até o momento."
                icone="assignment"
              />
            }
            renderItem={({ item: grupo }) => {
              const { atual, historico } = grupo;
              const isAtiva = atual.status === 'ativa';
              const isInativa = atual.status === 'inativa';
              const historicoAberto = Boolean(historicosAbertos[grupo.idAluno]);

              return (
                <View
                  style={[
                    estilosComuns.cartao,
                    numColunas > 1 ? styles.itemGrade : undefined,
                  ]}
                >
                  <View style={styles.linhaTopo}>
                    <View style={styles.colunaAluno}>
                      <Text style={estilosComuns.tituloCartao}>
                        {grupo.alunoNome}
                      </Text>
                      <Text style={styles.rotuloMatriculaAtual}>
                        Matrícula atual •{' '}
                        {atual.planoNome ?? `Plano #${atual.idPlano}`}
                      </Text>
                    </View>

                    <Selo status={atual.status} />
                  </View>

                  <View style={styles.blocoDatas}>
                    <View style={styles.itemData}>
                      <MaterialIcons name="event" size={15} color={colors.gray[400]} />
                      <Text style={estilosComuns.textoMutavel}>
                        Início: {formatarDataBR(atual.dataInicio)}
                      </Text>
                    </View>

                    <View style={styles.itemData}>
                      <MaterialIcons
                        name="event-available"
                        size={15}
                        color={colors.gray[400]}
                      />
                      <Text style={estilosComuns.textoMutavel}>
                        {atual.status === 'vencida' ? 'Venceu em: ' : 'Vence em: '}
                        {formatarDataBR(atual.dataFimEstimada)}
                      </Text>
                    </View>
                  </View>

                  {(podeAtualizarStatus || (podeExcluir && isInativa)) ? (
                    <View style={estilosComuns.linhaAcoes}>
                      {podeAtualizarStatus ? (
                        <TouchableOpacity
                          style={estilosComuns.botaoAcao}
                          onPress={() => handleAlternarStatus(atual)}
                        >
                          <MaterialIcons
                            name={
                              isAtiva
                                ? 'pause-circle-outline'
                                : 'play-circle-outline'
                            }
                            size={16}
                            color={isAtiva ? cores.erro : cores.sucesso}
                          />
                          <Text style={estilosComuns.textoBotaoAcao}>
                            {isAtiva ? 'Inativar' : 'Reativar'}
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      {podeExcluir && isInativa ? (
                        <TouchableOpacity
                          style={[estilosComuns.botaoAcao, styles.botaoExcluir]}
                          onPress={() => handleExcluirMatricula(atual)}
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={16}
                            color={colors.red[400]}
                          />
                          <Text
                            style={[
                              estilosComuns.textoBotaoAcao,
                              styles.textoExcluir,
                            ]}
                          >
                            Excluir
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}

                  {historico.length > 0 ? (
                    <View style={styles.secaoHistorico}>
                      <TouchableOpacity
                        style={styles.botaoToggleHistorico}
                        onPress={() => alternarHistorico(grupo.idAluno)}
                        accessibilityRole="button"
                        accessibilityLabel={`Histórico (${historico.length})`}
                      >
                        <MaterialIcons
                          name={historicoAberto ? 'expand-less' : 'expand-more'}
                          size={18}
                          color={colors.blue[300]}
                        />
                        <Text style={styles.textoToggleHistorico}>
                          Histórico ({historico.length})
                        </Text>
                      </TouchableOpacity>

                      {historicoAberto ? (
                        <View style={styles.listaHistorico}>
                          {historico.map((matAntiga) => (
                            <View key={matAntiga.id} style={styles.itemHistorico}>
                              <View style={styles.linhaTopoHistorico}>
                                <Text style={styles.nomePlanoHistorico}>
                                  {matAntiga.planoNome ??
                                    `Plano #${matAntiga.idPlano}`}
                                </Text>
                                <Selo status={matAntiga.status} />
                              </View>
                              <Text style={styles.datasHistorico}>
                                {formatarDataBR(matAntiga.dataInicio)} até{' '}
                                {formatarDataBR(matAntiga.dataFimEstimada)}
                              </Text>
                            </View>
                          ))}
                        </View>
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
                  <View style={styles.topoModal}>
                    <Text style={estilosComuns.tituloCabecalho}>
                      Nova matrícula
                    </Text>

                    {podeCriarAluno ? (
                      <TouchableOpacity
                        style={styles.atalhoAlunoNovo}
                        onPress={handleIrParaCadastroAluno}
                        accessibilityRole="button"
                        accessibilityLabel="Aluno novo? Cadastrar"
                      >
                        <MaterialIcons
                          name="person-add-alt"
                          size={16}
                          color={colors.blue[300]}
                        />
                        <Text style={styles.textoAtalhoAlunoNovo}>
                          Aluno novo? Cadastrar
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.avisoHistorico}>
                    <MaterialIcons
                      name="history"
                      size={18}
                      color={colors.blue[300]}
                    />
                    <Text style={styles.textoAvisoHistorico}>
                      A matrícula anterior fica no histórico.
                    </Text>
                  </View>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.rotulo}>
                      Aluno elegível (vencida, inativa ou sem matrícula) *
                    </Text>
                    {alunosElegiveis.length === 0 ? (
                      <Text style={styles.avisoNenhum}>
                        Nenhum aluno precisa de matrícula agora.
                      </Text>
                    ) : (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carrosselOpcoes}
                      >
                        {alunosElegiveis.map((a) => {
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
                    <Text style={styles.rotulo}>Plano *</Text>
                    <View style={styles.gradePlanos}>
                      {planosDisponiveis.map((p) => {
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
                            <View style={styles.colunaNomePlanoModal}>
                              <Text style={styles.nomePlano}>{p.nome}</Text>
                              <Text style={styles.duracaoPlano}>
                                {p.duracaoMeses === 1
                                  ? '1 mês'
                                  : `${p.duracaoMeses} meses`}
                              </Text>
                            </View>
                            <Text style={styles.precoPlano}>
                              {formatarMoedaBRL(p.preco)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <Campo
                    rotulo="Data de início (opcional, padrão: hoje)"
                    value={dataInicioBR}
                    onChangeText={(t) => {
                      setDataInicioBR(aplicarMascaraData(t));
                      if (erroFormulario) setErroFormulario('');
                      if (errosCampos['data_inicio']) {
                        setErrosCampos((antigos) => ({
                          ...antigos,
                          data_inicio: '',
                        }));
                      }
                    }}
                    placeholder="DD/MM/AAAA (em branco usa hoje)"
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!salvandoMatricula}
                    erro={errosCampos['data_inicio']}
                    iconeEsquerda="event"
                  />

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
                        (alunosElegiveis.length === 0 ||
                          planosDisponiveis.length === 0) &&
                          styles.botaoDesabilitado,
                      ]}
                      onPress={handleSubmeterCriacao}
                      disabled={
                        salvandoMatricula ||
                        alunosElegiveis.length === 0 ||
                        planosDisponiveis.length === 0
                      }
                    >
                      {salvandoMatricula ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Text style={estilosComuns.textoBotaoPrimario}>
                          Confirmar matrícula
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>
        </View>
      );
    }

    default:
      return semCaso(estadoMatriculas);
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
    backgroundColor: cores.primaria,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotaoAdicionar: {
    color: cores.texto,
    fontWeight: 'bold',
    fontSize: 16,
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
  rotuloMatriculaAtual: {
    color: cores.primaria,
    fontSize: 13,
    fontWeight: '600',
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
    backgroundColor: cores.erroSuave,
  },
  textoExcluir: {
    color: colors.red[400],
  },
  secaoHistorico: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[800],
    gap: 8,
  },
  botaoToggleHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  textoToggleHistorico: {
    color: colors.blue[300],
    fontSize: 13,
    fontWeight: '600',
  },
  listaHistorico: {
    gap: 8,
  },
  itemHistorico: {
    backgroundColor: colors.gray[900],
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 4,
  },
  linhaTopoHistorico: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  nomePlanoHistorico: {
    color: colors.gray[300],
    fontSize: 13,
    fontWeight: '600',
  },
  datasHistorico: {
    color: colors.gray[400],
    fontSize: 12,
  },
  cartaoModal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 14,
  },
  topoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  atalhoAlunoNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: cores.primariaSuave,
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  textoAtalhoAlunoNovo: {
    color: cores.primaria,
    fontSize: 12,
    fontWeight: '600',
  },
  avisoHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: cores.primariaSuave,
    borderWidth: 1,
    borderColor: cores.primariaBorda,
  },
  textoAvisoHistorico: {
    color: cores.primaria,
    fontSize: 13,
    flex: 1,
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
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  textoChip: {
    color: colors.gray[300],
    fontSize: 13,
  },
  textoChipSelecionado: {
    color: cores.textoEscuro,
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
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
  },
  colunaNomePlanoModal: {
    gap: 2,
  },
  nomePlano: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  precoPlano: {
    color: cores.primaria,
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
