import React, { useCallback, useState } from 'react';
import {
  FlatList,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessao } from '@/auth';
import { limparEventosErro, obterEventosErro, registrarErro, type EventoErro } from '../erros/erros';
import { cores, espacos, raio } from '../tema/tema';
import { formatarDataBR } from '@/utils/datas';
import { Botao } from '../componentes/Botao';

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
  const { width, height, fontScale } = useWindowDimensions();
  const { usuario, sair } = useSessao();
  const [guardados, setGuardados] = useState('...');
  const [eventos, setEventos] = useState<ReadonlyArray<EventoErro>>(() =>
    obterEventosErro()
  );

  const nomeApp = Constants.expoConfig?.name ?? 'Academia MisterFit';
  const versaoApp = Constants.expoConfig?.version ?? '1.0.0';
  const urlApiOriginal = process.env.EXPO_PUBLIC_API_URL;
  const hostApi = extrairHost(urlApiOriginal);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      try {
        if (!cancelado) {
          // Em modo online/API v1, sem persistência SQLite offline por enquanto (Decisão C1)
          setGuardados('0');
        }
      } catch (erro: unknown) {
        registrarErro('contagem', erro);
        if (!cancelado) {
          setGuardados('indisponível');
        }
      }
      return () => {
        cancelado = true;
      };
    }, [])
  );

  function handleLimparLogs() {
    limparEventosErro();
    setEventos([]);
  }

  function handleRecarregarLogs() {
    setEventos(obterEventosErro());
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top + espacos.md }]}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Sobre o Sistema</Text>
      </View>

      <FlatList
        data={eventos}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: insets.bottom + espacos.lg },
        ]}
        ListHeaderComponent={
          <View style={styles.blocoCabecalho}>
            <View style={styles.cartao}>
              <View style={styles.linhaInfo}>
                <MaterialIcons name="fitness-center" size={24} color={cores.primaria} />
                <View>
                  <Text style={styles.tituloCartao}>{nomeApp}</Text>
                  <Text style={styles.textoSecundario}>Versão {versaoApp}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cartao}>
              <Text style={styles.tituloSecao}>Ambiente e Dispositivo</Text>

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

              <Text style={styles.medida}>
                Janela: {Math.round(width)} x {Math.round(height)} dp
              </Text>
              <Text style={styles.medida}>Densidade: {PixelRatio.get()}x</Text>
              <Text style={styles.medida}>Escala da fonte: {fontScale}</Text>
              <Text style={styles.medida}>Guardados no aparelho: {guardados}</Text>
            </View>

            <View style={styles.cartao}>
              <Text style={styles.tituloSecao}>Sessão</Text>
              <Botao titulo="Sair da Conta" variante="secundario" onPress={sair} />
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
                  <MaterialIcons name="refresh" size={16} color={cores.primaria} />
                </TouchableOpacity>

                {eventos.length > 0 ? (
                  <TouchableOpacity
                    style={styles.botaoAcaoLog}
                    onPress={handleLimparLogs}
                    accessibilityLabel="Limpar histórico de erros"
                  >
                    <MaterialIcons name="delete-sweep" size={16} color={cores.erro} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {eventos.length === 0 ? (
              <View style={[styles.cartao, styles.cartaoSemErros]}>
                <MaterialIcons name="check-circle-outline" size={20} color={cores.sucesso} />
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
            <View style={[styles.cartao, styles.itemLog]}>
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
              {item.detalhe ? (
                <Text style={styles.detalheLog}>{item.detalhe}</Text>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    paddingHorizontal: espacos.md,
    paddingBottom: espacos.sm,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.texto,
  },
  conteudo: {
    padding: espacos.md,
    gap: espacos.sm,
  },
  blocoCabecalho: {
    gap: espacos.sm,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
    gap: espacos.xs,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  tituloCartao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.texto,
  },
  textoSecundario: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.texto,
    marginBottom: espacos.xs,
  },
  itemDado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  rotuloDado: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  valorDado: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.texto,
  },
  medida: {
    marginTop: espacos.xs,
    color: cores.textoSecundario,
    fontSize: 13,
  },
  linhaCabecalhoLogs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: espacos.sm,
  },
  linhaBotoesLogs: {
    flexDirection: 'row',
    gap: espacos.xs,
  },
  botaoAcaoLog: {
    padding: espacos.xs,
  },
  cartaoSemErros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  textoSemErros: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  itemLog: {
    gap: 4,
    paddingVertical: espacos.sm,
  },
  linhaLogTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  origemLog: {
    fontSize: 13,
    fontWeight: 'bold',
    color: cores.texto,
  },
  tipoLog: {
    fontSize: 12,
    fontWeight: 'bold',
    color: cores.alerta,
  },
  linhaLogDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataLog: {
    fontSize: 11,
    color: cores.textoSecundario,
  },
  codigoLog: {
    fontSize: 11,
    color: cores.textoSecundario,
  },
  detalheLog: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
  },
});
