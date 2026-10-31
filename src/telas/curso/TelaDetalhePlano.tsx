import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlanos } from '../../contexto/PlanosContexto';
import { Botao } from '../../componentes/Botao';
import type { RotasPilhaPlanosCurso } from '../../navegacao/tiposCurso';
import { cores, espacos, raio } from '../../tema/tema';
import { formatarMoedaBRL } from '../../utils/moeda';

type RotaProps = RouteProp<RotasPilhaPlanosCurso, 'DetalhePlano'>;
type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanosCurso, 'DetalhePlano'>;

export function TelaDetalhePlano() {
  const route = useRoute<RotaProps>();
  const navigation = useNavigation<NavegacaoProps>();
  const { buscar } = usePlanos();

  const plano = buscar(route.params.id);

  if (!plano) {
    return (
      <View style={estilos.tela}>
        <View style={estilos.centro}>
          <Text style={estilos.erro}>Plano não encontrado.</Text>
          <Botao titulo="Voltar" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const duracaoTexto = plano.duracaoMeses === 1 ? '1 mês' : `${plano.duracaoMeses} meses`;

  return (
    <View style={estilos.tela}>
      <View style={estilos.cartao}>
        <Text style={estilos.titulo}>{plano.nome}</Text>
        <Text style={estilos.preco}>{formatarMoedaBRL(plano.preco)}</Text>
        <Text style={estilos.rotulo}>Duração: <Text style={estilos.valor}>{duracaoTexto}</Text></Text>
        {plano.descricao ? (
          <View style={estilos.blocoDescricao}>
            <Text style={estilos.rotulo}>Descrição:</Text>
            <Text style={estilos.valor}>{plano.descricao}</Text>
          </View>
        ) : null}
      </View>

      <View style={estilos.acoes}>
        <Botao titulo="Voltar para a lista" variante="secundario" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacos.md,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.md,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
    gap: espacos.sm,
    marginBottom: espacos.md,
  },
  titulo: {
    color: cores.texto,
    fontSize: 22,
    fontWeight: 'bold',
  },
  preco: {
    color: cores.primaria,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: espacos.xs,
  },
  rotulo: {
    color: cores.textoSecundario,
    fontSize: 14,
    fontWeight: '600',
  },
  valor: {
    color: cores.texto,
    fontWeight: 'normal',
  },
  blocoDescricao: {
    marginTop: espacos.xs,
    gap: 4,
  },
  acoes: {
    marginTop: espacos.sm,
  },
  erro: {
    color: cores.erro,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
