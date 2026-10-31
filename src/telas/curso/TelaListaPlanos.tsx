import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlanos } from '../../contexto/PlanosContexto';
import { Botao } from '../../componentes/Botao';
import { CartaoPlanoCurso } from './CartaoPlanoCurso';
import type { RotasPilhaPlanosCurso } from '../../navegacao/tiposCurso';
import { cores, espacos, larguraLarga } from '../../tema/tema';

type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanosCurso, 'ListaPlanos'>;

export function TelaListaPlanos() {
  const navigation = useNavigation<NavegacaoProps>();
  const { estado, recarregar } = usePlanos();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;

  function conteudo() {
    switch (estado.tipo) {
      case 'carregando':
        return (
          <View style={estilos.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
            <Text style={estilos.textoSecundario}>Carregando planos...</Text>
          </View>
        );

      case 'erro':
        return (
          <View style={estilos.centro}>
            <Text style={estilos.erro}>Não foi possível carregar os planos.</Text>
            <Text style={estilos.detalheDoErro}>{estado.mensagem}</Text>
            <View style={estilos.barra}>
              <Botao titulo="Tentar de novo" onPress={recarregar} />
            </View>
          </View>
        );

      case 'pronto':
        return (
          <>
            {estado.origem === 'aparelho' && (
              <Text style={estilos.aviso}>
                Sem conexão: mostrando os planos guardados no aparelho ({estado.motivo})
              </Text>
            )}

            {estado.pendentes.length > 0 && (
              <Text style={estilos.aviso}>
                A enviar ({estado.pendentes.length}):{' '}
                {estado.pendentes.map((pendente) => pendente.nome).join(', ')}
              </Text>
            )}

            <FlatList
              key={duasColunas ? 'duas' : 'uma'}
              data={estado.planos}
              numColumns={duasColunas ? 2 : 1}
              columnWrapperStyle={duasColunas ? estilos.linhaDeColunas : undefined}
              keyExtractor={(plano) => String(plano.id)}
              renderItem={({ item }) => (
                <View style={estilos.celula}>
                  <Pressable
                    onPress={() => navigation.navigate('DetalhePlano', { id: item.id })}
                    accessibilityRole="button"
                    accessibilityLabel={`Plano ${item.nome}, ver detalhes`}
                  >
                    <CartaoPlanoCurso plano={item} />
                  </Pressable>
                </View>
              )}
              ListEmptyComponent={
                <View style={estilos.vazio}>
                  <Text style={estilos.textoSecundario}>Nenhum plano cadastrado.</Text>
                </View>
              }
            />
          </>
        );
    }
  }

  return (
    <View style={estilos.tela}>
      <View style={estilos.barra}>
        <View style={estilos.botaoAcao}>
          <Botao titulo="Recarregar" variante="secundario" onPress={recarregar} />
        </View>
        <View style={estilos.botaoAcao}>
          <Botao titulo="Novo Plano" onPress={() => navigation.navigate('NovoPlano')} />
        </View>
      </View>
      {conteudo()}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacos.md,
  },
  barra: {
    flexDirection: 'row',
    gap: espacos.sm,
    marginBottom: espacos.md,
  },
  botaoAcao: {
    flex: 1,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.sm,
  },
  erro: {
    color: cores.erro,
    fontWeight: 'bold',
  },
  aviso: {
    color: cores.alerta,
    marginBottom: espacos.sm,
    fontSize: 13,
  },
  detalheDoErro: {
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: espacos.sm,
  },
  linhaDeColunas: {
    gap: espacos.sm,
  },
  celula: {
    flex: 1,
  },
  vazio: {
    paddingVertical: espacos.lg,
    alignItems: 'center',
  },
  textoSecundario: {
    color: cores.textoSecundario,
  },
});
