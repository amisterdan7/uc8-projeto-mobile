import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StatusAlunoMatricula, StatusMatricula } from '@/types/entidades';
import { colors } from '@/styles/colors';

export type TipoSelo = StatusMatricula | StatusAlunoMatricula | 'arquivado' | 'ativo_aluno';

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
        rotulo: 'Ativo',
        fundo: 'rgba(74, 222, 128, 0.15)',
        borda: 'rgba(74, 222, 128, 0.4)',
        texto: '#4ade80', // Verde
      };
    case 'vencida':
      return {
        rotulo: 'Vencido',
        fundo: 'rgba(248, 113, 113, 0.15)',
        borda: 'rgba(248, 113, 113, 0.4)',
        texto: colors.red[400], // Vermelho
      };
    case 'inativa':
      return {
        rotulo: 'Inativo',
        fundo: 'rgba(161, 161, 170, 0.15)',
        borda: 'rgba(161, 161, 170, 0.4)',
        texto: colors.gray[400], // Cinza
      };
    case 'sem_matricula':
      return {
        rotulo: 'Sem plano',
        fundo: 'rgba(113, 113, 122, 0.15)',
        borda: 'rgba(113, 113, 122, 0.4)',
        texto: colors.gray[400], // Cinza
      };
    case 'arquivado':
      return {
        rotulo: 'Arquivado',
        fundo: 'rgba(245, 158, 11, 0.15)',
        borda: 'rgba(245, 158, 11, 0.4)',
        texto: '#f59e0b', // Âmbar
      };
    case 'ativo_aluno':
      return {
        rotulo: 'Ativo',
        fundo: 'rgba(74, 222, 128, 0.15)',
        borda: 'rgba(74, 222, 128, 0.4)',
        texto: '#4ade80',
      };
    default:
      return {
        rotulo: String(status),
        fundo: 'rgba(161, 161, 170, 0.15)',
        borda: 'rgba(161, 161, 170, 0.4)',
        texto: colors.gray[300],
      };
  }
}

const styles = StyleSheet.create({
  selo: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  texto: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
