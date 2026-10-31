import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDados } from '@/dados';
import { semCaso } from '@/types/estadoTela';
import { colunasPara } from '@/utils/responsividade';
import { formatarMoedaBRL } from '@/utils/moeda';
import { Carregando, EstadoErro, EstadoVazio } from '@/components';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaPlanos() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const numColunas = colunasPara(width);

  const { estadoPlanos, recarregarPlanos } = useDados();
  const [atualizando, setAtualizando] = useState(false);

  async function handlePullToRefresh() {
    setAtualizando(true);
    await recarregarPlanos();
    setAtualizando(false);
  }

  // Renderização através de união discriminada e switch exaustivo (M6-R5)
  switch (estadoPlanos.tipo) {
    case 'carregando':
      return <Carregando mensagem="Carregando planos da academia..." />;

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
          </View>

          <FlatList
            key={numColunas}
            data={estadoPlanos.dados}
            numColumns={numColunas}
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
                </View>
              );
            }}
          />
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
    textTransform: 'uppercase',
  },
  linhaRecurso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoRecurso: {
    color: colors.gray[300],
    fontSize: 13,
  },
});
