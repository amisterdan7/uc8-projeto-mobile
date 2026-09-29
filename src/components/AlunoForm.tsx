import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/styles/colors";

interface AlunoFormProps {
  onSubmit: (nome: string, telefone: string) => void;
}

export function AlunoForm({ onSubmit }: AlunoFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");


  function handleSubmit() {
    const nomeLimpo = nome.trim();
    const telefoneLimpo = telefone.trim();

    if (!nomeLimpo || !telefoneLimpo) {
      setErro("Preencha nome e telefone para incluir o aluno.");
      return;
    }

    onSubmit(nomeLimpo, telefoneLimpo);
    setNome("");
    setTelefone("");
    setErro("");
  }

  return (
    <View style={formStyles.container}>
      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do aluno"
        placeholderTextColor={colors.gray[500]}
        style={formStyles.input}
      />
      <TextInput
        value={telefone}
        onChangeText={setTelefone}
        placeholder="Telefone"
        placeholderTextColor={colors.gray[500]}
        keyboardType="phone-pad"
        style={formStyles.input}
      />
      {erro ? <Text style={formStyles.error}>{erro}</Text> : null}
      <Pressable style={formStyles.button} onPress={handleSubmit}>
        <Text style={formStyles.buttonText}>Adicionar aluno</Text>
      </Pressable>
    </View>
  );
}

const formStyles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.gray[800],
    borderRadius: 8,
    borderWidth: 1,
    color: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.blue[500],
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  error: {
    color: colors.red[400],
  },
});