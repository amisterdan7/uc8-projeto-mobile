import { useState } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { styles } from './styles'
import { colors } from '@/styles/colors'
import { Category } from '@/components'

const categorias = [
  { chave: 'alunos', nome: 'Alunos', icone: 'person' as const, rota: '/alunos' },
  { chave: 'planos', nome: 'Planos', icone: 'credit-card' as const, rota: '/planos' },
  { chave: 'matriculas', nome: 'Matrículas', icone: 'assignment' as const, rota: '/matriculas' }
]

export default function Index() {
  const insets = useSafeAreaInsets()
  const [selecionada, setSelecionada] = useState('alunos')

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />

        <TouchableOpacity>
          <MaterialIcons name="menu" size={24} color={colors.blue[500]} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesRow}>
        {categorias.map((cat) => (
          <Link key={cat.chave} href={cat.rota} asChild>
            <Category
              name={cat.nome}
              icon={cat.icone}
              isSelected={selecionada === cat.chave}
              onPress={() => setSelecionada(cat.chave)}
            />
          </Link>
        ))}
      </View>
    </View>
  )
}