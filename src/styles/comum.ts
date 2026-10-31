import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const estilosComuns = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
  conteudo: {
    padding: 16,
    gap: 12,
  },
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
    backgroundColor: colors.night,
  },
  tituloCabecalho: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtituloCabecalho: {
    color: colors.gray[400],
    fontSize: 13,
  },
  cartao: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 6,
  },
  tituloCartao: {
    color: colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  linhaRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoMutavel: {
    color: colors.gray[300],
    fontSize: 14,
  },
  textoSecundario: {
    color: colors.gray[400],
    fontSize: 13,
  },
  linhaAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[800],
  },
  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.gray[800],
  },
  textoBotaoAcao: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray[800],
    borderRadius: 8,
    color: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  botaoPrimario: {
    backgroundColor: colors.blue[500],
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoPrimario: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
