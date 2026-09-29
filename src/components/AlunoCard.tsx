import { Text, View } from "react-native";
import { colors } from "@/styles/colors";
import { styles } from "@/app/_styles";
import type { Aluno } from "@/types/entidades";

interface AlunoCardProps {
  aluno: Aluno;
}

export function AlunoCard({ aluno }: AlunoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{aluno.nome}</Text>
      <Text style={{ color: colors.gray[300] }}>
        Nascimento: {new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")}
      </Text>
      <Text style={{ color: colors.gray[300] }}>
        Telefone: {aluno.telefone ?? "Não informado"}
      </Text>
      <Text style={{ color: aluno.ativo ? "#4ade80" : "#a1a1aa" }}>
        {aluno.ativo ? "Ativo" : "Inativo"}
      </Text>
    </View>
  );
}