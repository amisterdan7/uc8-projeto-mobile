import {
  Text,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./style";
import { colors } from "@/styles/colors";

type Props = Omit<PressableProps, "style"> & {
  name: string;
  isSelected: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
};



export function Category({ name, icon, isSelected, style, ...rest }: Props) {
  const color = isSelected ? colors.green[300] : colors.gray[400];
  return (
    <Pressable style={[styles.container, style]} {...rest}>
      <MaterialIcons name={icon} size={16} color={color} />
      <Text style={[styles.name, { color }]}>{name}</Text>
    </Pressable>
  );
}

// Mantém os componentes reutilizáveis disponíveis pelo ponto de entrada comum.
export { AlunoCard } from "./AlunoCard";
export { AlunoForm } from "./AlunoForm";
