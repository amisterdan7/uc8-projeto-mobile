import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PlanoCurso } from '../../servicos/planosSupabase';
import { cores, espacos, raio } from '../../tema/tema';
import { formatarMoedaBRL } from '../../utils/moeda';

interface CartaoPlanoCursoProps {
  plano: PlanoCurso;
}

export function CartaoPlanoCurso({ plano }: CartaoPlanoCursoProps) {
  const duracaoTexto = plano.duracaoMeses === 1 ? '1 mês' : `${plano.duracaoMeses} meses`;

  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <Text style={estilos.titulo}>{plano.nome}</Text>
        <Text style={estilos.preco}>{formatarMoedaBRL(plano.preco)}</Text>
      </View>
      <Text style={estilos.duracao}>Duração: {duracaoTexto}</Text>
      {plano.descricao ? (
        <Text style={estilos.descricao} numberOfLines={2}>
          {plano.descricao}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: espacos.sm,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espacos.xs,
  },
  titulo: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  preco: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  duracao: {
    color: cores.textoSecundario,
    fontSize: 13,
    marginBottom: espacos.xs,
  },
  descricao: {
    color: cores.textoSecundario,
    fontSize: 12,
  },
});
