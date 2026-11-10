import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StatusAlunoMatricula, StatusMatricula } from '@/types/entidades';
import { cores, raios } from '@/tema/tema';

export type TipoSelo =
  | StatusMatricula
  | StatusAlunoMatricula
  | 'arquivado'
  | 'ativo_aluno'
  | 'admin'
  | 'recepcao';

interface SeloProps {
  status: TipoSelo;
  rotuloPersonalizado?: string;
}

export function Selo({ status, rotuloPersonalizado }: SeloProps) {
  const configuracao = obterConfiguracaoSelo(status);

  return (
    <View
      style={[
        styles.selo,
        {
          backgroundColor: configuracao.fundo,
          borderColor: configuracao.borda,
        },
      ]}
    >
      <Text style={[styles.texto, { color: configuracao.texto }]}>
        {rotuloPersonalizado ?? configuracao.rotulo}
      </Text>
    </View>
  );
}

function obterConfiguracaoSelo(status: TipoSelo): {
  rotulo: string;
  fundo: string;
  borda: string;
  texto: string;
} {
  switch (status) {
    case 'ativa':
      return {
        rotulo: 'Ativa',
        fundo: cores.sucessoSuave,
        borda: cores.sucessoBorda,
        texto: cores.sucesso,
      };
    case 'ativo_aluno':
      return {
        rotulo: 'Ativo',
        fundo: cores.sucessoSuave,
        borda: cores.sucessoBorda,
        texto: cores.sucesso,
      };
    case 'vencida':
      return {
        rotulo: 'Vencida',
        fundo: cores.erroSuave,
        borda: cores.erroBorda,
        texto: cores.erro,
      };
    case 'inativa':
      return {
        rotulo: 'Inativa',
        fundo: cores.neutroSuave,
        borda: cores.neutroBorda,
        texto: cores.textoSecundario,
      };
    case 'sem_matricula':
      return {
        rotulo: 'Sem plano',
        fundo: cores.neutroSuave,
        borda: cores.neutroBorda,
        texto: cores.textoSecundario,
      };
    case 'arquivado':
      return {
        rotulo: 'Arquivado',
        fundo: cores.neutroSuave,
        borda: cores.neutroBorda,
        texto: cores.textoSecundario,
      };
    case 'admin':
      return {
        rotulo: 'Administrador',
        fundo: cores.primariaSuave,
        borda: cores.primariaBorda,
        texto: cores.primaria,
      };
    case 'recepcao':
      return {
        rotulo: 'Recepção',
        fundo: cores.infoSuave,
        borda: cores.infoBorda,
        texto: cores.info,
      };
    default:
      return {
        rotulo: String(status),
        fundo: cores.neutroSuave,
        borda: cores.neutroBorda,
        texto: cores.textoSecundario,
      };
  }
}

const styles = StyleSheet.create({
  selo: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: raios.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  texto: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
