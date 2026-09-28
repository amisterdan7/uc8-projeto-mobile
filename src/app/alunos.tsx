import { FlatList, Text, View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./_styles";
import type { Aluno } from "@/types/entidades";
import { colors } from "@/styles/colors";
import { useState } from "react";

export const alunosMock: Aluno[] = [
  {
    id: 1,
    nome: "Caio Pereira",
    dataNascimento: "2000-05-14",
    telefone: "(84) 99999-0000",
    ativo: true,
  },
  {
    id: 2,
    nome: "João Silva",
    dataNascimento: "1998-11-02",
    telefone: null,
    ativo: false,
  },

  {
    id: 3,
    nome: "Maria Oliveira",
    dataNascimento: "2001-03-22",
    telefone: "(84) 98888-1111",
    ativo: true,
  },
  {
    id: 4,
    nome: "Pedro Santos",
    dataNascimento: "1999-07-15",
    telefone: "(84) 97777-2222",
    ativo: false,
  },
  {
    id: 5,
    nome: "Ana Costa",
    dataNascimento: "2002-09-30",
    telefone: "(84) 96666-3333",
    ativo: true,
  },
];

export default function Alunos() {
  const insets = useSafeAreaInsets();
  const [alunos, setAlunos] = useState(alunosMock);

  return (
    <View style={styles.container}>
      
      
      <FlatList
        data={alunosMock}
        keyExtractor={(item) => String(item.id)}

        ListHeaderComponent= {
          <View style={[styles.header, { paddingTop: insets.top + 16, justifyContent: "center" }]}>

            <Text style={styles.headerTitle}>Alunos</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>

            <Text style={{ color: colors.gray[300] }}>
              Nascimento:{" "}
              {new Date(item.dataNascimento).toLocaleDateString("pt-BR")}
            </Text>

            <Text style={{ color: colors.gray[300] }}>
              Telefone: {item.telefone ?? "Não informado"}
            </Text>

            <Text style={{ color: item.ativo ? "#4ade80" : "#a1a1aa" }}>
              {item.ativo ? "Ativo" : "Inativo"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}