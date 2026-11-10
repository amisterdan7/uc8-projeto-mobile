import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cores, espacos, raios } from '../tema/tema';

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
        <ActivityIndicator color={cores.texto} />
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
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  secundario: {
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  pressionado: {
    opacity: 0.8,
  },
  desabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: cores.texto,
    fontWeight: 'bold',
    fontSize: 16,
  },
  textoSecundario: {
    color: cores.texto,
  },
});
