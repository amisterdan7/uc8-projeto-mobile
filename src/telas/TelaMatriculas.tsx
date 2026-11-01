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
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Matricula } from '@/types/entidades';
import type { AbasAppParamList } from '@/navegacao/tipos';
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
} from '@/utils/datas';
import { formatarMoedaBRL } from '@/utils/moeda';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaMatriculas() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<AbasAppParamList, 'Matriculas'>>();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;
  const numColunas = colunasPara(width);

  const {
    estadoMatriculas,
    estadoAlunos,
    estadoPlanos,
    recarregarMatriculas,
    criarMatricula,
    mudarStatusMatricula,
    excluirMatricula,
  } = useAcademia();

  const { podeFazer } = useSessao();
  const podeCriar = podeFazer('matriculas:criar');
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

  useEffect(() => {
    if (route.params?.alunoId && podeCriar) {
      setAlunoSelecionadoId(route.params.alunoId);
      const planos = estadoPlanos.tipo === 'pronto' ? estadoPlanos.dados : [];
      if (planos.length > 0 && !planoSelecionadoId) {
        setPlanoSelecionadoId(planos[0].id);
      }
      setModalCriacaoVisivel(true);
    }
  }, [route.params?.alunoId, podeCriar, estadoPlanos]);

  async function handlePullToRefresh() {
    setAtualizando(true);
    await recarregarMatriculas();
    setAtualizando(false);
  }

  function handleAbrirCriacao() {
    setErroFormulario('');
    setErrosCampos({});
    setDataInicioBR('');

    const alunosAtivos =
      estadoAlunos.tipo === 'pronto'
        ? estadoAlunos.dados.filter((a) => a.ativo)
        : [];
    const planos = estadoPlanos.tipo === 'pronto' ? estadoPlanos.dados : [];

    setAlunoSelecionadoId(alunosAtivos.length > 0 ? alunosAtivos[0].id : null);
    setPlanoSelecionadoId(planos.length > 0 ? planos[0].id : null);
    setModalCriacaoVisivel(true);
  }

  async function handleSubmeterCriacao() {
    if (!alunoSelecionadoId || !planoSelecionadoId) {
      setErroFormulario('Selecione um aluno e um plano.');
      return;
    }

    let dataISO: string | undefined = undefined;
    if (dataInicioBR.trim()) {
      if (dataInicioBR.length !== 10) {
        setErroFormulario(
          'Data de início deve estar no formato DD/MM/AAAA ou ser deixada vazia (hoje).'
        );
        return;
      }
      dataISO = dataBRparaISO(dataInicioBR);
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
        'Matrícula Criada com Sucesso!',
        `A matrícula foi registrada. Término estimado calculado pela API: ${dataFimFormatada}.`
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
      `Deseja realmente ${acao} a matrícula de "${item.alunoNome ?? 'Aluno'}"?`,
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
                <Text style={styles.textoBotaoAdicionar}>Nova Matrícula</Text>
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
      const alunosAtivos =
        estadoAlunos.tipo === 'pronto'
          ? estadoAlunos.dados.filter((a) => a.ativo)
          : [];
      const planosDisponiveis =
        estadoPlanos.tipo === 'pronto' ? estadoPlanos.dados : [];

      return (
        <View style={estilosComuns.container}>
          <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
            <View>
              <Text style={estilosComuns.tituloCabecalho}>Matrículas</Text>
              <Text style={estilosComuns.subtituloCabecalho}>
                {listaMatriculas.length} matrícula(s) registrada(s)
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
                <Text style={styles.textoBotaoAdicionar}>Nova Matrícula</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            key={duasColunas ? 'duas' : 'uma'}
            data={listaMatriculas}
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
                mensagem="Nenhuma matrícula cadastrada até o momento."
                icone="assignment"
              />
            }
            renderItem={({ item }) => {
              const isAtiva = item.status === 'ativa';
              const isInativa = item.status === 'inativa';

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

                  <View style={styles.grupoCampo}>
                    <Text style={styles.rotulo}>
                      Selecione o Aluno (Apenas Ativos) *
                    </Text>
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

                  <Campo
                    rotulo="Data de Início (opcional, padrão: hoje no servidor)"
                    value={dataInicioBR}
                    onChangeText={(t) => {
                      setDataInicioBR(aplicarMascaraData(t));
                      if (erroFormulario) setErroFormulario('');
                      if (errosCampos['data_inicio']) {
                        setErrosCampos((antigos) => ({ ...antigos, data_inicio: '' }));
                      }
                    }}
                    placeholder="DD/MM/AAAA (vazio = data atual)"
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
    gap: 14,
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
