import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlanos } from '../../contexto/PlanosContexto';
import { CartaoPlano } from './CartaoPlano';
import type { NavegacaoAbasPlanosProp } from '../../navegacao/tiposPlanos';
import { cores, espacos, larguraLarga, raio } from '../../tema/tema';

export function TelaBuscaPlanos() {
  const navigation = useNavigation<NavegacaoAbasPlanosProp>();
  const { estado } = usePlanos();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;

  const [termo, setTermo] = useState('');

  const lista = estado.tipo === 'pronto' ? estado.planos : [];
  const filtrados = termo.trim()
    ? lista.filter((p) => {
        const busca = termo.trim().toLowerCase();
        const nomeMatch = p.nome.toLowerCase().includes(busca);
        const descMatch = p.descricao ? p.descricao.toLowerCase().includes(busca) : false;
        return nomeMatch || descMatch;
      })
    : [];

  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>Buscar Planos</Text>

      <View style={estilos.barraBusca}>
        <MaterialIcons name="search" size={20} color={cores.textoSecundario} />
        <TextInput
          style={estilos.input}
          placeholder="Digite o nome ou descrição do plano..."
          placeholderTextColor={cores.textoSecundario}
          value={termo}
          onChangeText={setTermo}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {termo.length > 0 && (
          <TouchableOpacity onPress={() => setTermo('')}>
            <MaterialIcons name="close" size={20} color={cores.textoSecundario} />
          </TouchableOpacity>
        )}
      </View>

      {estado.tipo === 'carregando' ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" color={cores.primaria} />
          <Text style={estilos.textoSecundario}>Carregando dados...</Text>
        </View>
      ) : (
        <FlatList
          key={duasColunas ? 'duas' : 'uma'}
          data={filtrados}
          numColumns={duasColunas ? 2 : 1}
          columnWrapperStyle={duasColunas ? estilos.colunas : undefined}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              style={estilos.item}
              onPress={() =>
                navigation.navigate('PlanosTab', {
                  screen: 'DetalhePlano',
                  params: { id: item.id },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Plano ${item.nome}, ver detalhes`}
            >
              <CartaoPlano plano={item} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={estilos.vazio}>
              <Text style={estilos.textoSecundario}>
                {termo.trim()
                  ? 'Nenhum plano encontrado para os termos informados.'
                  : 'Digite algo acima para iniciar a busca.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacos.md,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: espacos.sm,
  },
  barraBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    paddingHorizontal: espacos.sm,
    marginBottom: espacos.md,
    gap: espacos.xs,
  },
  input: {
    flex: 1,
    color: cores.texto,
    paddingVertical: espacos.sm,
    fontSize: 15,
  },
  colunas: {
    gap: espacos.sm,
  },
  item: {
    flex: 1,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: espacos.sm,
  },
  vazio: {
    paddingVertical: espacos.lg,
    alignItems: 'center',
  },
  textoSecundario: {
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
