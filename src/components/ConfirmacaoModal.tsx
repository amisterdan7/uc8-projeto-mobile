import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { cores, espacos, raios } from '@/tema/tema';

export interface ConfirmacaoModalProps {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: 'perigo' | 'primario';
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Modal padronizado de confirmação para ações críticas (ex.: inativação/reativação e exclusão).
 * Substitui caixas de diálogo nativas garantindo paridade total entre Web e dispositivos móveis.
 */
export function ConfirmacaoModal({
  visivel,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'primario',
  carregando = false,
  onConfirmar,
  onCancelar,
}: ConfirmacaoModalProps) {
  const corBotaoConfirmar = variante === 'perigo' ? cores.erro : cores.primaria;

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={onCancelar}
    >
      <View style={styles.overlay}>
        <View style={styles.cartaoModal} accessibilityRole="alert">
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensagem}>{mensagem}</Text>

          <View style={styles.linhaBotoes}>
            <TouchableOpacity
              style={[styles.botao, styles.botaoCancelar]}
              onPress={onCancelar}
              disabled={carregando}
              accessibilityRole="button"
              accessibilityLabel={textoCancelar}
            >
              <Text style={styles.textoBotaoCancelar}>{textoCancelar}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botao,
                { backgroundColor: corBotaoConfirmar },
                carregando && styles.botaoDesabilitado,
              ]}
              onPress={onConfirmar}
              disabled={carregando}
              accessibilityRole="button"
              accessibilityLabel={textoConfirmar}
            >
              {carregando ? (
                <ActivityIndicator color={cores.texto} size="small" />
              ) : (
                <Text style={styles.textoBotaoConfirmar}>{textoConfirmar}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: cores.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacos.md,
  },
  cartaoModal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: cores.cartao,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.lg,
    gap: espacos.sm + 4,
  },
  titulo: {
    color: cores.texto,
    fontSize: 18,
    fontWeight: 'bold',
  },
  mensagem: {
    color: cores.textoSecundario,
    fontSize: 14,
    lineHeight: 20,
  },
  linhaBotoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: espacos.sm + 2,
    marginTop: espacos.sm,
  },
  botao: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  botaoCancelar: {
    backgroundColor: cores.borda,
  },
  textoBotaoCancelar: {
    color: cores.texto,
    fontSize: 14,
    fontWeight: '600',
  },
  textoBotaoConfirmar: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
});
