import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Aluno } from '@/types/entidades';
import { semCaso } from '@/types/estadoTela';
import type { NavegacaoAppProp, RotasAbasParamList } from '@/navegacao/tipos';
import { useAcademia } from '../contexto';
import { extrairErrosCampos, registrarErro } from '../erros/erros';
import { ErroDaApi } from '@/api';
import { useSessao } from '@/auth';
import { colunasPara, filtrarAlunos, formatarDataBR } from '@/utils';
import { AlunoCard, AlunoForm, Carregando, ConfirmacaoModal, EstadoVazio } from '@/components';
import type { DadosSubmissaoAluno } from '@/components/AlunoForm';
import { cores, espacos, foco, larguraLarga, raios } from '../tema/tema';
import { estilosComuns } from '@/styles/comum';

export function TelaAlunos() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavegacaoAppProp>();
  const route = useRoute<RouteProp<RotasAbasParamList, 'Alunos'>>();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;
  const numColunas = colunasPara(width);

  const {
    estadoAlunos,
    estadoPlanos,
    recarregarAlunos,
    recarregarPlanos,
    criarAluno,
    atualizarAluno,
    arquivarAluno,
    restaurarAluno,
    excluirAluno,
  } = useAcademia();

  const { podeFazer } = useSessao();
  const podeCriarMatricula = podeFazer('matriculas:criar');
  const podeCriar = podeFazer('alunos:criar') && podeCriarMatricula;
  const podeAtualizar = podeFazer('alunos:atualizar');
  const podeDesativar = podeFazer('alunos:desativar');
  const podeExcluir = podeFazer('alunos:excluir');

  const [busca, setBusca] = useState('');
  const [buscaFocada, setBuscaFocada] = useState(false);
  const [modalFormularioVisivel, setModalFormularioVisivel] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | null>(null);
  const [errosFormulario, setErrosFormulario] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [alunoParaAlternarAtivo, setAlunoParaAlternarAtivo] = useState<Aluno | null>(null);
  const [alunoParaExcluir, setAlunoParaExcluir] = useState<Aluno | null>(null);
  const [processandoConfirmacao, setProcessandoConfirmacao] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const planosDisponiveis =
    estadoPlanos.tipo === 'pronto' ? estadoPlanos.dados : [];

  useEffect(() => {
    const params = route.params as { abrirCadastro?: boolean } | undefined;
    if (params?.abrirCadastro && podeCriar) {
      setAlunoEmEdicao(null);
      setErrosFormulario({});
      setModalFormularioVisivel(true);
    }
  }, [route.params, podeCriar]);

  async function handlePullToRefresh() {
    setAtualizando(true);
    try {
      await Promise.all([recarregarAlunos(), recarregarPlanos()]);
    } catch (e: unknown) {
      registrarErro('TelaAlunos.pullToRefresh', e);
    } finally {
      setAtualizando(false);
    }
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

  async function handleSalvarAluno(dados: DadosSubmissaoAluno) {
    setSalvando(true);
    setErrosFormulario({});
    try {
      if (alunoEmEdicao) {
        await atualizarAluno(
          alunoEmEdicao.id,
          dados.nome,
          dados.dataNascimentoISO,
          dados.telefone
        );
        Alert.alert('Sucesso', 'Dados do aluno atualizados com sucesso.');
      } else {
        const resultado = await criarAluno(
          dados.nome,
          dados.dataNascimentoISO,
          dados.telefone,
          dados.idPlano,
          dados.dataInicioISO
        );
        const vencimentoBR = resultado.matricula
          ? formatarDataBR(resultado.matricula.dataFimEstimada)
          : '';
        Alert.alert(
          'Sucesso',
          vencimentoBR
            ? `Aluno cadastrado e matriculado. Vence em ${vencimentoBR}.`
            : 'Aluno cadastrado e matriculado.'
        );
      }
      setModalFormularioVisivel(false);
      setAlunoEmEdicao(null);
    } catch (falha: unknown) {
      registrarErro('cadastro', falha);
      if (falha instanceof ErroDaApi && falha.status === 404) {
        Alert.alert(
          'Plano não encontrado',
          'O plano escolhido não existe mais. Atualize a lista.'
        );
        await recarregarPlanos();
      } else if (falha instanceof ErroDaApi && falha.status === 409) {
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
    setMensagemErro('');
    setMensagemSucesso('');
    setAlunoParaAlternarAtivo(aluno);
  }

  async function handleConfirmarAlternarAtivo() {
    if (!alunoParaAlternarAtivo) return;
    const novoStatus = !alunoParaAlternarAtivo.ativo;
    const acaoTexto = novoStatus ? 'restaurar' : 'arquivar';
    setProcessandoConfirmacao(true);
    setMensagemErro('');
    setMensagemSucesso('');
    try {
      if (novoStatus) {
        await restaurarAluno(alunoParaAlternarAtivo.id);
        setMensagemSucesso('Aluno restaurado com sucesso.');
      } else {
        await arquivarAluno(alunoParaAlternarAtivo.id);
        setMensagemSucesso('Aluno arquivado com sucesso.');
      }
      setAlunoParaAlternarAtivo(null);
    } catch {
      setAlunoParaAlternarAtivo(null);
      setMensagemErro(`Falha ao ${acaoTexto} aluno.`);
    } finally {
      setProcessandoConfirmacao(false);
    }
  }

  function handleExcluir(aluno: Aluno) {
    setMensagemErro('');
    setMensagemSucesso('');
    setAlunoParaExcluir(aluno);
  }

  async function handleConfirmarExclusao() {
    if (!alunoParaExcluir) return;
    setProcessandoConfirmacao(true);
    setMensagemErro('');
    setMensagemSucesso('');
    try {
      await excluirAluno(alunoParaExcluir.id);
      setAlunoParaExcluir(null);
      setMensagemSucesso('Aluno excluído com sucesso.');
    } catch (erro: unknown) {
      setAlunoParaExcluir(null);
      if (erro instanceof ErroDaApi && erro.status === 409) {
        setMensagemErro(
          'Este aluno tem histórico de matrículas. Arquive em vez de excluir.'
        );
      } else {
        const msg =
          erro instanceof Error ? erro.message : 'Falha ao excluir o aluno.';
        setMensagemErro(msg);
      }
    } finally {
      setProcessandoConfirmacao(false);
    }
  }

  // Renderização por união discriminada (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
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
                accessibilityLabel="Cadastrar e matricular aluno"
              >
                <MaterialIcons name="person-add" size={18} color={cores.texto} />
                <Text style={styles.textoBotaoAdicionar}>Cadastrar e matricular</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.blocoBusca}>
            <MaterialIcons
              name="search"
              size={20}
              color={buscaFocada ? cores.foco : cores.textoSecundario}
              style={styles.iconeBusca}
            />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              onFocus={() => setBuscaFocada(true)}
              onBlur={() => setBuscaFocada(false)}
              placeholder="Buscar por nome ou telefone..."
              placeholderTextColor={cores.textoSecundario}
              style={[
                estilosComuns.input,
                styles.inputBusca,
                buscaFocada && styles.inputBuscaFocado,
              ]}
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
                <MaterialIcons name="close" size={18} color={cores.textoSecundario} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.cartaoErroTopo}>
            <View style={styles.linhaErroTopo}>
              <MaterialIcons name="error-outline" size={24} color={cores.erro} />
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
              <MaterialIcons name="refresh" size={18} color={cores.texto} />
              <Text style={styles.textoBotaoTentarDeNovo}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    case 'pronto': {
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
                accessibilityLabel="Cadastrar e matricular aluno"
              >
                <MaterialIcons name="person-add" size={18} color={cores.texto} />
                <Text style={styles.textoBotaoAdicionar}>Cadastrar e matricular</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.blocoBusca}>
            <MaterialIcons
              name="search"
              size={20}
              color={buscaFocada ? cores.foco : cores.textoSecundario}
              style={styles.iconeBusca}
            />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              onFocus={() => setBuscaFocada(true)}
              onBlur={() => setBuscaFocada(false)}
              placeholder="Buscar por nome ou telefone..."
              placeholderTextColor={cores.textoSecundario}
              style={[
                estilosComuns.input,
                styles.inputBusca,
                buscaFocada && styles.inputBuscaFocado,
              ]}
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
                <MaterialIcons name="close" size={18} color={cores.textoSecundario} />
              </TouchableOpacity>
            ) : null}
          </View>

          {mensagemErro ? (
            <View style={styles.bannerErro}>
              <MaterialIcons name="error-outline" size={18} color={cores.erro} />
              <Text style={styles.textoBannerErro}>{mensagemErro}</Text>
              <TouchableOpacity onPress={() => setMensagemErro('')} accessibilityLabel="Fechar aviso de erro">
                <MaterialIcons name="close" size={18} color={cores.erro} />
              </TouchableOpacity>
            </View>
          ) : null}

          {mensagemSucesso ? (
            <View style={styles.bannerSucesso}>
              <MaterialIcons name="check-circle" size={18} color={cores.sucesso} />
              <Text style={styles.textoBannerSucesso}>{mensagemSucesso}</Text>
              <TouchableOpacity onPress={() => setMensagemSucesso('')} accessibilityLabel="Fechar aviso de sucesso">
                <MaterialIcons name="close" size={18} color={cores.sucesso} />
              </TouchableOpacity>
            </View>
          ) : null}

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
                tintColor={cores.primaria}
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
                planosDisponiveis={planosDisponiveis}
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

          <ConfirmacaoModal
            visivel={Boolean(alunoParaAlternarAtivo)}
            titulo={
              alunoParaAlternarAtivo
                ? `Confirmar ${alunoParaAlternarAtivo.ativo ? 'arquivar' : 'restaurar'}`
                : 'Confirmar'
            }
            mensagem={
              alunoParaAlternarAtivo
                ? `Deseja realmente ${alunoParaAlternarAtivo.ativo ? 'arquivar' : 'restaurar'} o aluno "${alunoParaAlternarAtivo.nome}"?`
                : ''
            }
            textoConfirmar={
              alunoParaAlternarAtivo?.ativo ? 'Arquivar' : 'Restaurar'
            }
            variante={alunoParaAlternarAtivo?.ativo ? 'perigo' : 'primario'}
            carregando={processandoConfirmacao}
            onConfirmar={handleConfirmarAlternarAtivo}
            onCancelar={() => {
              if (!processandoConfirmacao) {
                setAlunoParaAlternarAtivo(null);
              }
            }}
          />

          <ConfirmacaoModal
            visivel={Boolean(alunoParaExcluir)}
            titulo="Excluir Aluno Definitivamente"
            mensagem={
              alunoParaExcluir
                ? `A exclusão permanente só é possível para alunos sem histórico de matrículas. Deseja prosseguir com a exclusão de "${alunoParaExcluir.nome}"?`
                : ''
            }
            textoConfirmar="Excluir definitivamente"
            variante="perigo"
            carregando={processandoConfirmacao}
            onConfirmar={handleConfirmarExclusao}
            onCancelar={() => {
              if (!processandoConfirmacao) {
                setAlunoParaExcluir(null);
              }
            }}
          />
        </View>
      );
    }

    default:
      return semCaso(estadoAlunos);
  }
}

const styles = StyleSheet.create({
  bannerErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: espacos.md,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: cores.erroSuave,
    borderWidth: 1,
    borderColor: cores.erroBorda,
  },
  textoBannerErro: {
    flex: 1,
    color: cores.erro,
    fontSize: 13,
    fontWeight: '600',
  },
  bannerSucesso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: espacos.md,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: cores.sucessoSuave,
    borderWidth: 1,
    borderColor: cores.sucessoBorda,
  },
  textoBannerSucesso: {
    flex: 1,
    color: cores.sucesso,
    fontSize: 13,
    fontWeight: '600',
  },
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
    borderRadius: raios.md,
  },
  textoBotaoAdicionar: {
    color: cores.texto,
    fontWeight: 'bold',
    fontSize: 16,
  },
  blocoBusca: {
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: espacos.md,
    paddingTop: 12,
    paddingBottom: espacos.xs,
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
  inputBuscaFocado: {
    borderColor: cores.foco,
    borderWidth: foco.larguraBorda,
  },
  botaoLimparBusca: {
    position: 'absolute',
    right: 28,
    zIndex: 1,
    padding: espacos.xs,
  },
  cartaoErroTopo: {
    margin: espacos.md,
    padding: espacos.md,
    backgroundColor: cores.erroSuave,
    borderColor: cores.erro,
    borderWidth: 1,
    borderRadius: raios.lg,
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
    color: cores.texto,
  },
  mensagemErroTopo: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  botaoTentarDeNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: cores.primaria,
    paddingVertical: 10,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    alignSelf: 'flex-start',
  },
  textoBotaoTentarDeNovo: {
    color: cores.texto,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
