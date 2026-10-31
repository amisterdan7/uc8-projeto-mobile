import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessao } from '@/auth';
import { limparEventosErro, obterEventosErro, type EventoErro } from '@/erros';
import { formatarDataBR } from '@/utils/datas';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export function extrairHost(urlTexto?: string): string {
  if (!urlTexto) return 'localhost:3333';
  try {
    const match = urlTexto.match(/^(?:https?:\/\/)?([^/]+)/i);
    return match ? match[1] : urlTexto;
  } catch {
    return urlTexto;
  }
}

export function TelaSobre() {
  const insets = useSafeAreaInsets();
  const { usuario } = useSessao();
  const [eventos, setEventos] = useState<ReadonlyArray<EventoErro>>(() =>
    obterEventosErro()
  );

  const nomeApp = Constants.expoConfig?.name ?? 'Academia MisterFit';
  const versaoApp = Constants.expoConfig?.version ?? '1.0.0';
  const urlApiOriginal = process.env.EXPO_PUBLIC_API_URL;
  const hostApi = extrairHost(urlApiOriginal);

  function handleLimparLogs() {
    limparEventosErro();
    setEventos([]);
  }

  function handleRecarregarLogs() {
    setEventos(obterEventosErro());
  }

  return (
    <View style={estilosComuns.container}>
      <View style={[estilosComuns.cabecalho, { paddingTop: insets.top + 16 }]}>
        <Text style={estilosComuns.tituloCabecalho}>Sobre o Sistema</Text>
      </View>

      <FlatList
        data={eventos}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={[
          estilosComuns.conteudo,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ListHeaderComponent={
          <View style={styles.blocoCabecalho}>
            <View style={estilosComuns.cartao}>
              <View style={styles.linhaInfo}>
                <MaterialIcons name="fitness-center" size={24} color={colors.blue[400]} />
                <View>
                  <Text style={estilosComuns.tituloCartao}>{nomeApp}</Text>
                  <Text style={estilosComuns.textoSecundario}>Versão {versaoApp}</Text>
                </View>
              </View>
            </View>

            <View style={estilosComuns.cartao}>
              <Text style={styles.tituloSecao}>Ambiente de Integração</Text>

              <View style={styles.itemDado}>
                <Text style={styles.rotuloDado}>Origem dos Dados:</Text>
                <Text style={styles.valorDado}>API v1, online</Text>
              </View>

              <View style={styles.itemDado}>
                <Text style={styles.rotuloDado}>Host do Servidor:</Text>
                <Text style={styles.valorDado}>{hostApi}</Text>
              </View>

              <View style={styles.itemDado}>
                <Text style={styles.rotuloDado}>Usuário Conectado:</Text>
                <Text style={styles.valorDado}>
                  {usuario?.nome} (@{usuario?.login})
                </Text>
              </View>

              <View style={styles.itemDado}>
                <Text style={styles.rotuloDado}>Perfil de Acesso:</Text>
                <Text style={styles.valorDado}>
                  {usuario?.perfil === 'admin' ? 'Administrador' : 'Recepção'}
                </Text>
              </View>
            </View>

            <View style={styles.linhaCabecalhoLogs}>
              <Text style={styles.tituloSecao}>
                Eventos e Erros Recentes ({eventos.length})
              </Text>
              <View style={styles.linhaBotoesLogs}>
                <TouchableOpacity
                  style={styles.botaoAcaoLog}
                  onPress={handleRecarregarLogs}
                  accessibilityLabel="Atualizar lista de eventos"
                >
                  <MaterialIcons name="refresh" size={16} color={colors.blue[400]} />
                </TouchableOpacity>

                {eventos.length > 0 ? (
                  <TouchableOpacity
                    style={styles.botaoAcaoLog}
                    onPress={handleLimparLogs}
                    accessibilityLabel="Limpar histórico de erros"
                  >
                    <MaterialIcons name="delete-sweep" size={16} color={colors.red[400]} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {eventos.length === 0 ? (
              <View style={[estilosComuns.cartao, styles.cartaoSemErros]}>
                <MaterialIcons name="check-circle-outline" size={20} color="#4ade80" />
                <Text style={styles.textoSemErros}>
                  Nenhum erro registrado em memória nesta sessão.
                </Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const hora = item.dataHora.slice(11, 19);
          const dataIso = item.dataHora.slice(0, 10);
          const dataBR = formatarDataBR(dataIso);

          return (
            <View style={[estilosComuns.cartao, styles.itemLog]}>
              <View style={styles.linhaLogTopo}>
                <Text style={styles.origemLog}>{item.origem}</Text>
                <Text style={styles.tipoLog}>[{item.tipo.toUpperCase()}]</Text>
              </View>

              <View style={styles.linhaLogDetalhe}>
                <Text style={styles.dataLog}>
                  {dataBR} às {hora}
                </Text>
                {item.statusOuCodigo ? (
                  <Text style={styles.codigoLog}>Código: {item.statusOuCodigo}</Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blocoCabecalho: {
    gap: 12,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tituloSecao: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rotuloDado: {
    color: colors.gray[400],
    fontSize: 13,
  },
  valorDado: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  linhaCabecalhoLogs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  linhaBotoesLogs: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoAcaoLog: {
    padding: 6,
    backgroundColor: colors.gray[800],
    borderRadius: 6,
  },
  cartaoSemErros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  textoSemErros: {
    color: '#4ade80',
    fontSize: 13,
  },
  itemLog: {
    backgroundColor: colors.gray[900],
    padding: 10,
    gap: 4,
    marginBottom: 8,
  },
  linhaLogTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  origemLog: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  tipoLog: {
    color: colors.red[400],
    fontSize: 11,
    fontWeight: 'bold',
  },
  linhaLogDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataLog: {
    color: colors.gray[400],
    fontSize: 12,
  },
  codigoLog: {
    color: colors.gray[400],
    fontSize: 12,
  },
});
