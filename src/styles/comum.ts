import { StyleSheet } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

export const estilosComuns = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    padding: espacos.md,
    gap: espacos.sm + 4,
  },
  cabecalho: {
    paddingHorizontal: espacos.lg,
    paddingTop: espacos.md,
    paddingBottom: espacos.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  tituloCabecalho: {
    color: cores.texto,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtituloCabecalho: {
    color: cores.textoSecundario,
    fontSize: 13,
  },
  cartao: {
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio + 4,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: espacos.xs + 2,
  },
  tituloCartao: {
    color: cores.texto,
    fontSize: 17,
    fontWeight: 'bold',
  },
  linhaRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoMutavel: {
    color: cores.texto,
    fontSize: 14,
  },
  textoSecundario: {
    color: cores.textoSecundario,
    fontSize: 13,
  },
  linhaAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    marginTop: espacos.sm,
    paddingTop: espacos.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    paddingVertical: espacos.xs + 2,
    paddingHorizontal: espacos.sm + 2,
    borderRadius: raio - 2,
    backgroundColor: cores.borda,
  },
  textoBotaoAcao: {
    color: cores.texto,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    color: cores.texto,
    paddingHorizontal: espacos.md - 2,
    paddingVertical: espacos.sm + 4,
    fontSize: 15,
  },
  botaoPrimario: {
    backgroundColor: cores.primaria,
    paddingVertical: espacos.md - 2,
    borderRadius: raio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoPrimario: {
    color: cores.textoClaro,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
