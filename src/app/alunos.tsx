import { FlatList, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { styles } from './styles'
import type { Aluno } from '@/types/entidades'
import { colors } from '@/styles/colors'

const alunosMock: Aluno[] = [
  { id: 1, nome: 'Caio Pereira', dataNascimento: '2000-05-14', telefone: '(84) 99999-0000', ativo: true },
  { id: 2, nome: 'João Silva', dataNascimento: '1998-11-02', telefone: null, ativo: false }
]

export default function Alunos() {

  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Alunos</Text>
      </View>

      <FlatList
        data={alunosMock}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={ styles.card }>
            <Text style={styles.cardTitle}>{item.nome}</Text>

            <Text style={{ color: colors.gray[300] }}>
              Nascimento: { new Date(item.dataNascimento).toLocaleDateString('pt-BR') }
            </Text>

            <Text style={{ color: colors.gray[300] }}> 
              Telefone: { item.telefone ?? 'Não informado' }
            </Text>

            <Text style={{ color: item.ativo ? '#4ade80' : '#a1a1aa' }}>
              {item.ativo ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        )}
      />
    </View>
  )
}