import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  desabilitado?: boolean;
  carregando?: boolean;
  accessibilityLabel?: string;
}

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  desabilitado = false,
  carregando = false,
  accessibilityLabel,
}: BotaoProps) {
  const secundario = variante === 'secundario';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      disabled={desabilitado || carregando}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        secundario && estilos.secundario,
        pressed && estilos.pressionado,
        (desabilitado || carregando) && estilos.desabilitado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={cores.textoClaro} />
      ) : (
        <Text style={[estilos.texto, secundario && estilos.textoSecundario]}>
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    backgroundColor: cores.primaria,
    paddingVertical: espacos.md - 2,
    paddingHorizontal: espacos.lg,
    borderRadius: raio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secundario: {
    backgroundColor: cores.borda,
  },
  pressionado: {
    opacity: 0.8,
  },
  desabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: cores.textoClaro,
    fontWeight: 'bold',
    fontSize: 15,
  },
  textoSecundario: {
    color: cores.texto,
  },
});
