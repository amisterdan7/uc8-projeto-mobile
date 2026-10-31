import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Plano } from '@/types/entidades';
import { ErroApi, listarPlanos } from '@/api';
import { formatarMoedaBRL } from '@/utils/moeda';
import { Carregando, EstadoErro, EstadoVazio } from '@/components';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function TelaPlanos() {
  const insets = useSafeAreaInsets();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarDados(silencioso = false) {
    if (!silencioso) setCarregando(true);
    setErro(null);

    try {
      const lista = await listarPlanos();
      setPlanos(lista);
    } catch (e: any) {
      if (e instanceof ErroApi) {
        setErro(e.message);
      } else {
        setErro('Não foi possível carregar os planos disponíveis.');
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

  if (carregando) {
    return <Carregando mensagem="Carregando planos da academia..." />;
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
        <Text style={estilosComuns.tituloCabecalho}>Planos e Mensalidades</Text>
      </View>

      <FlatList
        data={planos}
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
}

const styles = StyleSheet.create({
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
