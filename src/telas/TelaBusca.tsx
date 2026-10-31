import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores, espacos, larguraLarga, raio } from '../tema/tema';
import { useAcademia, useAcervo } from '../contexto';
import type { NavegacaoAppProp } from '../navegacao/tipos';
import { CartaoAluno } from '../componentes/CartaoAluno';
import { Botao } from '../componentes/Botao';
import type { Aluno } from '../types/entidades';

export function TelaBusca() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavegacaoAppProp>();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;

  const { estado, recarregar } = useAcademia();
  // Alias useAcervo também referenciado para rastreabilidade
  const acervo = useAcervo();
  const [termo, setTermo] = useState('');
  const [atualizando, setAtualizando] = useState(false);

  async function handlePullToRefresh() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }

  const listaAlunos: Aluno[] =
    estado.tipo === 'pronto' ? estado.alunos : acervo.estado.tipo === 'pronto' ? acervo.estado.alunos : [];

  const filtrados = termo.trim()
    ? listaAlunos.filter((a) => {
        const busca = termo.trim().toLowerCase();
        const nomeMatch = a.nome.toLowerCase().includes(busca);
        const telMatch = a.telefone ? a.telefone.includes(busca) : false;
        return nomeMatch || telMatch;
      })
    : [];

  return (
    <View
      style={[
        estilos.tela,
        { paddingTop: insets.top + espacos.md, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={estilos.titulo}>Busca de Alunos</Text>

      <View style={estilos.barraBusca}>
        <MaterialIcons name="search" size={20} color={cores.textoSecundario} />
        <TextInput
          style={estilos.input}
          placeholder="Digite o nome ou telefone do aluno..."
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
          <Text style={estilos.textoSecundario}>Buscando dados...</Text>
        </View>
      ) : estado.tipo === 'erro' ? (
        <View style={estilos.centro}>
          <Text style={estilos.erro}>Não foi possível carregar os dados.</Text>
          <Botao titulo="Tentar de novo" onPress={recarregar} />
        </View>
      ) : (
        <FlatList
          key={duasColunas ? 'duas' : 'uma'}
          data={filtrados}
          numColumns={duasColunas ? 2 : 1}
          columnWrapperStyle={duasColunas ? estilos.colunas : undefined}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={handlePullToRefresh}
              tintColor={cores.primaria}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={estilos.item}
              onPress={() => navigation.navigate('DetalheAluno', { alunoId: item.id })}
            >
              <CartaoAluno aluno={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={estilos.vazio}>
              <Text style={estilos.textoVazio}>
                {termo.trim()
                  ? 'Nenhum aluno encontrado para os termos informados.'
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
    paddingHorizontal: espacos.md,
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
  erro: {
    color: cores.erro,
    fontWeight: 'bold',
  },
  textoSecundario: {
    color: cores.textoSecundario,
  },
  vazio: {
    paddingVertical: espacos.lg,
    alignItems: 'center',
  },
  textoVazio: {
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
