import { FlatList, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { styles } from './_styles'
import type { Matricula } from '@/types/entidades'
import { alunosMock } from './alunos'
import { planosMock } from './planos'
import { colors } from '@/styles/colors'

const matriculasMock: Matricula[] = [
  { id: 1, alunoId: 1, planoId: 2, dataInicio: '2026-01-10', dataFimEstimada: '2026-04-10', status: 'ativa' },
  { id: 2, alunoId: 2, planoId: 1, dataInicio: '2025-11-01', dataFimEstimada: '2025-12-01', status: 'vencida' },
  { id: 3, alunoId: 3, planoId: 3, dataInicio: '2026-02-05', dataFimEstimada: '2026-03-05', status: 'ativa' },
]

const statusColors: Record<string, string> = {
  ativa: '#4ade80',
  inativa: colors.gray[400],
  vencida: '#f87171',
}

const statusLabels: Record<string, string> = {
  ativa: 'Ativa',
  inativa: 'Inativa',
  vencida: 'Vencida',
}

const formatarData = (data: string) => new Date(data).toLocaleDateString('pt-BR')

const getAlunoNome = (alunoId: number) =>
  alunosMock.find((a) => a.id === alunoId)?.nome ?? 'Aluno não encontrado'

const getPlanoNome = (planoId: number) =>
  planosMock.find((p) => p.id === planoId)?.nome ?? 'Plano não encontrado'

export default function Matriculas() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <MaterialIcons name="arrow-back" size={24} color={colors.blue[500]} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Matrículas</Text>
        <View style={{ width: 70 }} />
      </View>

      <FlatList
        data={matriculasMock}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{getAlunoNome(item.alunoId)}</Text>

            <Text style={{ color: colors.gray[400], marginTop: 4 }}>
              Plano: {getPlanoNome(item.planoId)}
            </Text>

            <Text style={{ color: colors.gray[400] }}>
              {formatarData(item.dataInicio)} até {formatarData(item.dataFimEstimada)}
            </Text>

            <Text style={{ color: statusColors[item.status], fontWeight: 'bold', marginTop: 4 }}>
              {statusLabels[item.status]}
            </Text>
          </View>
        )}
      />
    </View>
  )
}