import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDados } from '@/dados';
import { useSessao } from '@/auth';
import { useAcervo } from '../contexto';
import { semCaso } from '@/types/estadoTela';
import { colunasPara } from '@/utils/responsividade';
import { formatarMoedaBRL } from '@/utils/moeda';
import { Campo, Carregando, EstadoErro, EstadoVazio } from '@/components';
import { ErroDaApi } from '@/api/cliente';
import { extrairErrosCampos } from '@/erros';
import type { Plano, RecursoPlano } from '@/types/entidades';
import { cores, espacos, larguraLarga } from '../tema/tema';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaPlanos() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;
  const numColunas = colunasPara(width);

  const { estadoPlanos, recarregarPlanos, criarPlano, atualizarPlano, excluirPlano } = useDados();
  const { podeFazer } = useSessao();
  const podeCriar = podeFazer('planos:criar');
  const podeAtualizar = podeFazer('planos:atualizar');
  const podeExcluir = podeFazer('planos:excluir');

  // Referencia rastreavel a useAcervo
  const { estado: estadoAcademia } = useAcervo();
  const [atualizando, setAtualizando] = useState(false);

  // Estados do Modal de Criacao / Edicao de Plano
  const [modalVisivel, setModalVisivel] = useState(false);
  const [planoEmEdicao, setPlanoEmEdicao] = useState<Plano | null>(null);
  const [nome, setNome] = useState('');
  const [precoTexto, setPrecoTexto] = useState('');
  const [duracaoTexto, setDuracaoTexto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [destaque, setDestaque] = useState(false);
  const [recursos, setRecursos] = useState<RecursoPlano[]>([]);
  const [novoRecursoTexto, setNovoRecursoTexto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [errosFormulario, setErrosFormulario] = useState<Record<string, string>>({});

  async function handlePullToRefresh() {
    setAtualizando(true);
    await recarregarPlanos();
    setAtualizando(false);
  }

  function handleAbrirCriacao() {
    setPlanoEmEdicao(null);
    setNome('');
    setPrecoTexto('');
    setDuracaoTexto('1');
    setDescricao('');
    setDestaque(false);
    setRecursos([]);
    setNovoRecursoTexto('');
    setErrosFormulario({});
    setModalVisivel(true);
  }

  function handleAbrirEdicao(plano: Plano) {
    setPlanoEmEdicao(plano);
    setNome(plano.nome);
    setPrecoTexto(String(plano.preco));
    setDuracaoTexto(String(plano.duracaoMeses));
    setDescricao(plano.descricao ?? '');
    setDestaque(Boolean(plano.destaque));
    setRecursos(plano.recursos ? [...plano.recursos] : []);
    setNovoRecursoTexto('');
    setErrosFormulario({});
    setModalVisivel(true);
  }

  function handleAdicionarRecurso() {
    const textoLimpo = novoRecursoTexto.trim();
    if (!textoLimpo) return;
    if (textoLimpo.length > 120) {
      Alert.alert('Aviso', 'A descrição do recurso deve ter no máximo 120 caracteres.');
      return;
    }
    setRecursos([...recursos, { descricao: textoLimpo }]);
    setNovoRecursoTexto('');
  }

  function handleRemoverRecurso(indexParaRemover: number) {
    setRecursos(recursos.filter((_, idx) => idx !== indexParaRemover));
  }

  async function handleSalvarPlano() {
    setErrosFormulario({});
    let temErro = false;
    const novosErros: Record<string, string> = {};

    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 2 || nomeLimpo.length > 50) {
      novosErros.nome = 'O nome do plano deve ter entre 2 e 50 caracteres.';
      temErro = true;
    }

    const precoNumero = parseFloat(precoTexto.replace(',', '.'));
    if (isNaN(precoNumero) || precoNumero < 0 || precoNumero > 100000) {
      novosErros.preco = 'O preço deve ser um número entre 0 e 100.000.';
      temErro = true;
    }

    const duracaoNumero = parseInt(duracaoTexto, 10);
    if (isNaN(duracaoNumero) || duracaoNumero < 1 || duracaoNumero > 60) {
      novosErros.duracao_meses = 'A duração deve ser um número inteiro de 1 a 60 meses.';
      temErro = true;
    }

    if (temErro) {
      setErrosFormulario(novosErros);
      return;
    }

    setSalvando(true);
    const payload = {
      nome: nomeLimpo,
      preco: precoNumero,
      duracao_meses: duracaoNumero,
      descricao: descricao.trim().length > 0 ? descricao.trim() : null,
      destaque,
      recursos: recursos.length > 0 ? recursos : undefined,
    };

    try {
      if (planoEmEdicao) {
        await atualizarPlano(planoEmEdicao.id, payload);
        Alert.alert('Sucesso', 'Plano atualizado com sucesso.');
      } else {
        await criarPlano(payload);
        Alert.alert('Sucesso', 'Plano criado com sucesso.');
      }
      setModalVisivel(false);
      setPlanoEmEdicao(null);
    } catch (falha: unknown) {
      if (falha instanceof ErroDaApi && falha.status === 400 && falha.detalhes) {
        setErrosFormulario(extrairErrosCampos(falha));
        Alert.alert('Dados inválidos', 'Verifique os campos destacados.');
      } else {
        const msg = falha instanceof Error ? falha.message : 'Falha ao salvar plano.';
        Alert.alert('Erro', msg);
      }
    } finally {
      setSalvando(false);
    }
  }

  function handleExcluir(item: Plano) {
    Alert.alert(
      'Excluir Plano',
      `Deseja realmente excluir o plano "${item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirPlano(item.id);
              Alert.alert('Sucesso', 'Plano excluído com sucesso.');
            } catch (falha: unknown) {
              if (falha instanceof ErroDaApi && falha.status === 409) {
                Alert.alert('Não foi possível excluir', 'Existem matrículas neste plano.');
              } else {
                const msg = falha instanceof Error ? falha.message : 'Falha ao excluir plano.';
                Alert.alert('Erro', msg);
              }
            }
          },
        },
      ]
    );
  }

  // Renderizacao atraves de uniao discriminada e switch exaustivo (M6-R5)
  switch (estadoPlanos.tipo) {
    case 'carregando':
      return (
        <View style={estilosComuns.container}>
          <ActivityIndicator size="large" color={cores.primaria} />
          <Carregando mensagem="Carregando planos da academia..." />
        </View>
      );

    case 'erro':
      return (
        <EstadoErro
          mensagem={estadoPlanos.mensagem}
          onTentarNovamente={recarregarPlanos}
        />
      );

    case 'sucesso':
      return (
        <View style={estilosComuns.container}>
          <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
            <Text style={estilosComuns.tituloCabecalho}>Planos e Mensalidades</Text>
            {podeCriar ? (
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={handleAbrirCriacao}
                accessibilityLabel="Cadastrar novo plano"
              >
                <MaterialIcons name="add" size={20} color={colors.white} />
                <Text style={styles.textoBotaoAdicionar}>Novo Plano</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            key={duasColunas ? 'duas' : 'uma'}
            data={estadoPlanos.dados}
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
                mensagem="Nenhum plano disponível no momento."
                icone="credit-card"
              />
            }
            renderItem={({ item }) => {
              const textoDuracao =
                item.duracaoMeses === 1
                  ? '1 mês'
                  : `${item.duracaoMeses} meses`;

              return (
                <View
                  style={[
                    estilosComuns.cartao,
                    styles.cartaoResponsivo,
                    item.destaque && styles.cartaoDestaque,
                  ]}
                >
                  <View style={styles.linhaTopoPlano}>
                    <Text style={estilosComuns.tituloCartao}>{item.nome}</Text>
                    {item.destaque ? (
                      <View style={styles.tagDestaque}>
                        <MaterialIcons name="star" size={13} color="#f59e0b" />
                        <Text style={styles.textoTagDestaque}>Destaque</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.preco}>
                    {formatarMoedaBRL(item.preco)}{' '}
                    <Text style={styles.duracao}>/ {textoDuracao}</Text>
                  </Text>

                  {item.descricao ? (
                    <Text style={estilosComuns.textoMutavel}>{item.descricao}</Text>
                  ) : null}

                  {item.recursos && item.recursos.length > 0 ? (
                    <View style={styles.blocoRecursos}>
                      <Text style={styles.tituloRecursos}>O que está incluso:</Text>
                      {item.recursos.map((rec, index) => (
                        <View key={index} style={styles.linhaRecurso}>
                          <MaterialIcons
                            name="check"
                            size={16}
                            color={colors.blue[400]}
                          />
                          <Text style={styles.textoRecurso}>{rec.descricao}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {(podeAtualizar || podeExcluir) ? (
                    <View style={[estilosComuns.linhaAcoes, { marginTop: 12 }]}>
                      {podeAtualizar ? (
                        <TouchableOpacity
                          style={estilosComuns.botaoAcao}
                          onPress={() => handleAbrirEdicao(item)}
                        >
                          <MaterialIcons name="edit" size={15} color={colors.blue[400]} />
                          <Text style={estilosComuns.textoBotaoAcao}>Editar</Text>
                        </TouchableOpacity>
                      ) : null}

                      {podeExcluir ? (
                        <TouchableOpacity
                          style={[estilosComuns.botaoAcao, styles.botaoExcluir]}
                          onPress={() => handleExcluir(item)}
                        >
                          <MaterialIcons
                            name="delete-forever"
                            size={15}
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
            visible={modalVisivel}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => {
              if (!salvando) {
                setModalVisivel(false);
                setPlanoEmEdicao(null);
              }
            }}
          >
            <View
              style={[
                estilosComuns.container,
                { paddingTop: insets.top + 16, paddingHorizontal: 16 },
              ]}
            >
              <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={estilosComuns.tituloCartao}>
                  {planoEmEdicao ? 'Editar Plano' : 'Novo Plano'}
                </Text>

                <Campo
                  rotulo="Nome do Plano"
                  obrigatorio
                  value={nome}
                  onChangeText={(t) => {
                    setNome(t);
                    if (errosFormulario.nome) {
                      setErrosFormulario((prev) => ({ ...prev, nome: '' }));
                    }
                  }}
                  placeholder="Ex.: Anual VIP"
                  editable={!salvando}
                  erro={errosFormulario.nome}
                  iconeEsquerda="credit-card"
                />

                <Campo
                  rotulo="Preço (R$)"
                  obrigatorio
                  value={precoTexto}
                  onChangeText={(t) => {
                    setPrecoTexto(t);
                    if (errosFormulario.preco) {
                      setErrosFormulario((prev) => ({ ...prev, preco: '' }));
                    }
                  }}
                  placeholder="Ex.: 99.90"
                  keyboardType="numeric"
                  editable={!salvando}
                  erro={errosFormulario.preco}
                  iconeEsquerda="attach-money"
                />

                <Campo
                  rotulo="Duração em Meses (1 a 60)"
                  obrigatorio
                  value={duracaoTexto}
                  onChangeText={(t) => {
                    setDuracaoTexto(t);
                    if (errosFormulario.duracao_meses) {
                      setErrosFormulario((prev) => ({ ...prev, duracao_meses: '' }));
                    }
                  }}
                  placeholder="Ex.: 12"
                  keyboardType="number-pad"
                  editable={!salvando}
                  erro={errosFormulario.duracao_meses}
                  iconeEsquerda="event"
                />

                <Campo
                  rotulo="Descrição do Plano (opcional)"
                  value={descricao}
                  onChangeText={setDescricao}
                  placeholder="Ex.: Acesso ilimitado a todas as unidades"
                  editable={!salvando}
                  iconeEsquerda="description"
                />

                <View style={styles.linhaSwitch}>
                  <Text style={styles.rotuloSwitch}>Plano em Destaque?</Text>
                  <Switch
                    value={destaque}
                    onValueChange={setDestaque}
                    trackColor={{ false: colors.gray[800], true: colors.blue[500] }}
                    thumbColor={colors.white}
                  />
                </View>

                <View style={styles.blocoRecursosForm}>
                  <Text style={styles.rotuloRecursosForm}>Recursos Inclusos</Text>
                  {recursos.map((rec, index) => (
                    <View key={index} style={styles.itemRecursoDinamico}>
                      <Text style={styles.textoRecursoItem}>{rec.descricao}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoverRecurso(index)}
                        style={styles.botaoRemoverRecurso}
                      >
                        <MaterialIcons name="close" size={16} color={colors.red[400]} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <View style={styles.linhaAdicionarRecurso}>
                    <View style={{ flex: 1 }}>
                      <Campo
                        rotulo="Novo Recurso (1 a 120 caracteres)"
                        value={novoRecursoTexto}
                        onChangeText={setNovoRecursoTexto}
                        placeholder="Ex.: Acesso livre aos fins de semana"
                        editable={!salvando}
                        iconeEsquerda="playlist-add"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.botaoAddRecurso}
                      onPress={handleAdicionarRecurso}
                      disabled={salvando || !novoRecursoTexto.trim()}
                    >
                      <MaterialIcons name="add" size={20} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.linhaBotoesModal}>
                  <TouchableOpacity
                    style={[styles.botaoModal, styles.botaoCancelarModal]}
                    onPress={() => {
                      setModalVisivel(false);
                      setPlanoEmEdicao(null);
                    }}
                    disabled={salvando}
                  >
                    <Text style={styles.textoCancelarModal}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botaoModal, estilosComuns.botaoPrimario]}
                    onPress={handleSalvarPlano}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={estilosComuns.textoBotaoPrimario}>
                        {planoEmEdicao ? 'Salvar Alterações' : 'Criar Plano'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>
        </View>
      );

    default:
      return semCaso(estadoPlanos);
  }
}

const styles = StyleSheet.create({
  linhaColunas: {
    gap: 12,
  },
  cartaoResponsivo: {
    flex: 1,
  },
  cartaoDestaque: {
    borderColor: '#f59e0b',
    borderWidth: 1.5,
  },
  linhaTopoPlano: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  textoTagDestaque: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  preco: {
    color: '#4ade80',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  duracao: {
    color: colors.gray[400],
    fontSize: 14,
    fontWeight: 'normal',
  },
  blocoRecursos: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[800],
    gap: 6,
  },
  tituloRecursos: {
    color: colors.gray[400],
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  linhaRecurso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoRecurso: {
    color: colors.gray[300],
    fontSize: 13,
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
  botaoExcluir: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  textoExcluir: {
    color: colors.red[400],
  },
  linhaSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rotuloSwitch: {
    color: colors.gray[300],
    fontSize: 14,
    fontWeight: '600',
  },
  blocoRecursosForm: {
    marginTop: 8,
    gap: 8,
  },
  rotuloRecursosForm: {
    color: colors.gray[300],
    fontSize: 14,
    fontWeight: '600',
  },
  itemRecursoDinamico: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray[800],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoRecursoItem: {
    color: colors.gray[300],
    fontSize: 13,
    flex: 1,
  },
  botaoRemoverRecurso: {
    padding: 4,
  },
  linhaAdicionarRecurso: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  botaoAddRecurso: {
    backgroundColor: colors.blue[500],
    height: 48,
    width: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
});
