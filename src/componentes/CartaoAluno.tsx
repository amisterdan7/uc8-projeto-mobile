import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Aluno } from '../types/entidades';
import { cores, espacos, raio } from '../tema/tema';
import { formatarDataBR } from '../utils/datas';
import { formatarTelefone } from '../utils/telefone';

interface CartaoAlunoProps {
  aluno: Aluno;
}

export function CartaoAluno({ aluno }: CartaoAlunoProps) {
  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <Text style={estilos.titulo}>{aluno.nome}</Text>
        <Text
          style={[
            estilos.etiqueta,
            aluno.ativo ? estilos.etiquetaAtivo : estilos.etiquetaInativo,
          ]}
        >
          {aluno.ativo ? 'Ativo' : 'Inativo'}
        </Text>
      </View>
      <Text style={estilos.textoSecundario}>
        Nascimento: {formatarDataBR(aluno.dataNascimento)}
      </Text>
      <Text style={estilos.textoSecundario}>
        Telefone: {formatarTelefone(aluno.telefone)}
      </Text>
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
  etiqueta: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: espacos.sm,
    paddingVertical: 2,
    borderRadius: raio / 2,
  },
  etiquetaAtivo: {
    backgroundColor: cores.sucesso,
    color: cores.textoClaro,
  },
  etiquetaInativo: {
    backgroundColor: cores.desabilitado,
    color: cores.textoClaro,
  },
  textoSecundario: {
    color: cores.textoSecundario,
    fontSize: 13,
  },
});
