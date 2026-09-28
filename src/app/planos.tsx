import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./_styles";
import type { Plano } from "@/types/entidades";
import { colors } from "@/styles/colors";

export const planosMock: Plano[] = [
  
    {
    id: 1,
    nome: "Basic",
    preco: 59.9,
    duracaoMeses: 1,
    descricao: "Acesso apenas à musculação.",
    },

    {
    id: 2,
    nome: "Fit",
    preco: 89.9,
    duracaoMeses: 1,
    descricao: "Acesso à musculação e aulas coletivas.",
    },
   
   {
    id: 3,
    nome: "Mister",
    preco: 159.9,
    duracaoMeses: 3,
    descricao: "Musculação, aulas coletivas e avaliação física trimestral.",
   },
  
];

const formatPrice = (price: number) => {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export default function Planos() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, justifyContent: "center" },
        ]}
      >
        <Text style={styles.headerTitle}>Planos</Text>
      </View>

      <FlatList
        data={planosMock}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>

            <Text style={{ color: colors.green[300], fontWeight: "bold", marginTop: 4, }}> 
            {formatPrice(item.preco)} /{" "} {item.duracaoMeses === 1 ? "mês" : `${item.duracaoMeses} meses`}
            </Text>

            <Text style={{ color: colors.gray[300], marginTop: 4 }}>
              {item.descricao}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
