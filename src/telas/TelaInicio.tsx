import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAcademia } from '@/contexto';
import { useSessao } from '@/auth';
import type { NavegacaoAppProp } from '@/navegacao/tipos';
import type { Aluno } from '@/types/entidades';
import { CONTEUDO_ACADEMIA } from '@/conteudo/academia';
import { formatarMoedaBRL } from '@/utils/moeda';
import { cores } from '@/tema/tema';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export interface ContagemStatusAlunos {
  ativos: number;
  vencidos: number;
  semPlano: number;
}

/**
 * Conta os alunos ativos de acordo com o `statusMatricula` devolvido pela API,
 * sem recalcular nem comparar datas no cliente.
 */
export function contarAlunosPorStatus(alunos: Aluno[]): ContagemStatusAlunos {
  let ativos = 0;
  let vencidos = 0;
  let semPlano = 0;

  for (const aluno of alunos) {
    if (!aluno.ativo) {
      continue;
    }
    const status = aluno.statusMatricula ?? 'sem_matricula';
    if (status === 'ativa') {
      ativos += 1;
    } else if (status === 'vencida') {
      vencidos += 1;
    } else if (status === 'sem_matricula' || status === 'inativa') {
      semPlano += 1;
    }
  }

  return { ativos, vencidos, semPlano };
}

export function TelaInicio() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavegacaoAppProp>();
  const { estadoAlunos, estadoPlanos, recarregarTudo } = useAcademia();
  const { podeFazer } = useSessao();

  const [atualizando, setAtualizando] = useState(false);

  const podeCriarMatricula = podeFazer('matriculas:criar');
  const podeCadastrarAluno = podeFazer('alunos:criar') && podeCriarMatricula;

  const listaAlunos = estadoAlunos.tipo === 'pronto' ? estadoAlunos.dados : [];
  const listaPlanos = estadoPlanos.tipo === 'pronto' ? estadoPlanos.dados : [];
  const contadores = contarAlunosPorStatus(listaAlunos);

  async function handleRefresh() {
    setAtualizando(true);
    await recarregarTudo();
    setAtualizando(false);
  }

  return (
    <View style={estilosComuns.container}>
      <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
        <View style={styles.blocoMarca}>
          <MaterialIcons name="fitness-center" size={26} color={colors.blue[400]} />
          <View style={styles.textosCabecalho}>
            <Text style={estilosComuns.tituloCabecalho}>
              {CONTEUDO_ACADEMIA.titulo}
            </Text>
            <Text style={estilosComuns.subtituloCabecalho}>
              Painel inicial da unidade
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          estilosComuns.conteudo,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={handleRefresh}
            tintColor={colors.blue[400]}
          />
        }
      >
        <View style={styles.cartaoHero}>
          <Text style={styles.tituloHero}>{CONTEUDO_ACADEMIA.titulo}</Text>
          <Text style={styles.subtituloHero}>{CONTEUDO_ACADEMIA.subtitulo}</Text>
          <Text style={styles.fraseHero}>{CONTEUDO_ACADEMIA.frase}</Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Resumo de alunos</Text>
          <View style={styles.gradeContadores}>
            <TouchableOpacity
              style={[styles.cartaoContador, styles.contadorAtivos]}
              onPress={() => navigation.navigate('Abas', { screen: 'Alunos' })}
              accessibilityRole="button"
              accessibilityLabel={`${contadores.ativos} alunos ativos`}
            >
              <Text style={[styles.numeroContador, { color: colors.green[300] }]}>
                {contadores.ativos}
              </Text>
              <Text style={styles.rotuloContador}>Ativos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cartaoContador, styles.contadorVencidos]}
              onPress={() => navigation.navigate('Abas', { screen: 'Matriculas' })}
              accessibilityRole="button"
              accessibilityLabel={`${contadores.vencidos} alunos vencidos`}
            >
              <Text style={[styles.numeroContador, { color: colors.red[400] }]}>
                {contadores.vencidos}
              </Text>
              <Text style={styles.rotuloContador}>Vencidos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cartaoContador, styles.contadorSemPlano]}
              onPress={() => navigation.navigate('Abas', { screen: 'Alunos' })}
              accessibilityRole="button"
              accessibilityLabel={`${contadores.semPlano} alunos sem plano`}
            >
              <Text style={[styles.numeroContador, { color: cores.alerta }]}>
                {contadores.semPlano}
              </Text>
              <Text style={styles.rotuloContador}>Sem plano</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(podeCadastrarAluno || podeCriarMatricula) ? (
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Ações rápidas</Text>
            <View style={styles.linhaAtalhos}>
              {podeCadastrarAluno ? (
                <TouchableOpacity
                  style={[styles.botaoAtalho, estilosComuns.botaoPrimario]}
                  onPress={() =>
                    navigation.navigate('Abas', {
                      screen: 'Alunos',
                      params: { abrirCadastro: true },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Cadastrar aluno"
                >
                  <MaterialIcons name="person-add" size={20} color={colors.white} />
                  <Text style={estilosComuns.textoBotaoPrimario}>
                    Cadastrar aluno
                  </Text>
                </TouchableOpacity>
              ) : null}

              {podeCriarMatricula ? (
                <TouchableOpacity
                  style={[styles.botaoAtalho, styles.botaoAtalhoSecundario]}
                  onPress={() =>
                    navigation.navigate('Abas', {
                      screen: 'Matriculas',
                      params: { abrirCriacao: true },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Nova matrícula"
                >
                  <MaterialIcons name="add-task" size={20} color={colors.blue[300]} />
                  <Text style={styles.textoAtalhoSecundario}>Nova matrícula</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.secao}>
          <View style={styles.cabecalhoSecao}>
            <Text style={styles.tituloSecao}>Nossos planos</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Abas', { screen: 'Planos' })}
              accessibilityRole="button"
              accessibilityLabel="Ver todos os planos"
            >
              <Text style={styles.linkVerTodos}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {listaPlanos.length === 0 ? (
            <View style={estilosComuns.cartao}>
              <Text style={estilosComuns.textoMutavel}>
                {estadoPlanos.tipo === 'carregando'
                  ? 'Carregando planos da academia...'
                  : 'Nenhum plano disponível no momento.'}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.faixaPlanos}
            >
              {listaPlanos.map((plano) => {
                const duracaoTexto =
                  plano.duracaoMeses === 1
                    ? '1 mês'
                    : `${plano.duracaoMeses} meses`;

                return (
                  <TouchableOpacity
                    key={plano.id}
                    style={[
                      styles.cartaoPlanoFaixa,
                      plano.destaque && styles.cartaoPlanoDestaque,
                    ]}
                    onPress={() =>
                      navigation.navigate('Abas', { screen: 'Planos' })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Plano ${plano.nome}, ${formatarMoedaBRL(plano.preco)}, ${duracaoTexto}`}
                  >
                    <View style={styles.topoPlanoFaixa}>
                      <Text style={styles.nomePlanoFaixa}>{plano.nome}</Text>
                      {plano.destaque ? (
                        <View style={styles.seloDestaque}>
                          <MaterialIcons
                            name="star"
                            size={12}
                            color={cores.primaria}
                          />
                          <Text style={styles.textoSeloDestaque}>Destaque</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.precoPlanoFaixa}>
                      {formatarMoedaBRL(plano.preco)}
                    </Text>
                    <Text style={styles.duracaoPlanoFaixa}>{duracaoTexto}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>O que oferecemos</Text>
          <View style={styles.listaOferecemos}>
            {CONTEUDO_ACADEMIA.oQueOferecemos.map((item) => (
              <View key={item.titulo} style={estilosComuns.cartao}>
                <View style={styles.linhaItemOferecemos}>
                  <View style={styles.iconeOferecemos}>
                    <MaterialIcons
                      name={
                        item.icone as React.ComponentProps<
                          typeof MaterialIcons
                        >['name']
                      }
                      size={22}
                      color={colors.blue[400]}
                    />
                  </View>
                  <View style={styles.textosOferecemos}>
                    <Text style={estilosComuns.tituloCartao}>{item.titulo}</Text>
                    <Text style={estilosComuns.textoMutavel}>
                      {item.descricao}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  blocoMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textosCabecalho: {
    gap: 2,
  },
  cartaoHero: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.blue[500],
    gap: 6,
  },
  tituloHero: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtituloHero: {
    color: colors.gray[200],
    fontSize: 15,
    fontWeight: '600',
  },
  fraseHero: {
    color: colors.blue[300],
    fontSize: 13,
    marginTop: 2,
  },
  secao: {
    gap: 10,
    marginTop: 4,
  },
  cabecalhoSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloSecao: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkVerTodos: {
    color: colors.blue[400],
    fontSize: 13,
    fontWeight: '600',
  },
  gradeContadores: {
    flexDirection: 'row',
    gap: 10,
  },
  cartaoContador: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.gray[800],
    alignItems: 'center',
    gap: 4,
  },
  contadorAtivos: {
    borderColor: cores.sucessoBorda,
  },
  contadorVencidos: {
    borderColor: cores.erroBorda,
  },
  contadorSemPlano: {
    borderColor: cores.alertaBorda,
  },
  numeroContador: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  rotuloContador: {
    color: colors.gray[300],
    fontSize: 12,
    fontWeight: '600',
  },
  linhaAtalhos: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoAtalho: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  botaoAtalhoSecundario: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.blue[500],
  },
  textoAtalhoSecundario: {
    color: colors.blue[300],
    fontSize: 14,
    fontWeight: 'bold',
  },
  faixaPlanos: {
    gap: 12,
    paddingVertical: 2,
  },
  cartaoPlanoFaixa: {
    width: 210,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 6,
  },
  cartaoPlanoDestaque: {
    borderColor: cores.primaria,
  },
  topoPlanoFaixa: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  nomePlanoFaixa: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  seloDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: cores.primariaSuave,
  },
  textoSeloDestaque: {
    color: cores.primaria,
    fontSize: 10,
    fontWeight: 'bold',
  },
  precoPlanoFaixa: {
    color: colors.blue[300],
    fontSize: 18,
    fontWeight: 'bold',
  },
  duracaoPlanoFaixa: {
    color: colors.gray[400],
    fontSize: 12,
  },
  listaOferecemos: {
    gap: 10,
  },
  linhaItemOferecemos: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconeOferecemos: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosOferecemos: {
    flex: 1,
    gap: 4,
  },
});
