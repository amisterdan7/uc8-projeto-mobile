import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { AlunoCard, AlunoForm } from "@/components";
import type { Aluno } from "@/types/entidades";
import { colors } from "@/styles/colors";
import { alunosMock, carregarAlunos } from "@/services/alunos";
import { styles } from "./_styles";

export { alunosMock };

export default function Alunos() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [listaVisivel, setListaVisivel] = useState(false);

  useEffect(() => {
    let ativo = true;

    carregarAlunos().then((alunosCarregados) => {
      if (ativo) {
        setAlunos(alunosCarregados);
        setCarregando(false);
      }
    });

    return () => {
      ativo = false;
    };
  }, []);

  function handleAction(actionType: "listar" | "adicionar" | "carregar") {
    setMenuVisible(false);

    if (actionType === "listar") {
      setListaVisivel(true);
      setFormVisible(false);
    } else if (actionType === "adicionar") {
      setListaVisivel(false);
      setFormVisible(true);
    } else {
      setCarregando(true);
      carregarAlunos().then((alunosCarregados) => {
        setAlunos(alunosCarregados);
        setCarregando(false);
      });
    }
  }

  function adicionarAluno(nome: string, telefone: string) {
    setAlunos((alunosAtuais) => {
      const maiorId = alunosAtuais.reduce(
        (maior, aluno) => Math.max(maior, aluno.id),
        0,
      );

      const novoAluno: Aluno = {
        id: maiorId + 1,
        nome,
        dataNascimento: new Date().toISOString().slice(0, 10),
        telefone,
        ativo: true,
      };

      return [...alunosAtuais, novoAluno];
    });
  }

  if (carregando) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator color={colors.blue[400]} />
        <Text style={styles.loadingText}>Carregando alunos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.blue[500]}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Alunos</Text>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="menu" size={24} color={colors.blue[500]} />
        </TouchableOpacity>
      </View>

      {formVisible ? <AlunoForm onSubmit={adicionarAluno} /> : null}

      {listaVisivel ? (
        <FlatList
          data={alunos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum aluno cadastrado.</Text>
          }
          renderItem={({ item }) => <AlunoCard aluno={item} />}
        />
      ) : null}

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View
            style={[styles.modalOverlay, { paddingTop: insets.top + 56 }]}
          >
            <View
              style={styles.menuBox}
              onStartShouldSetResponder={() => true}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction("listar")}
              >
                <MaterialIcons name="list" size={20} color={colors.gray[800]} />
                <Text style={styles.menuText}>Listar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction("adicionar")}
              >
                <MaterialIcons name="add" size={20} color={colors.gray[800]} />
                <Text style={styles.menuText}>Adicionar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction("carregar")}
              >
                <MaterialIcons
                  name="refresh"
                  size={20}
                  color={colors.gray[800]}
                />
                <Text style={styles.menuText}>Carregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
