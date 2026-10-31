import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Aluno } from '@/types/entidades';
import { formatarDataBR } from '@/utils/datas';
import { formatarTelefone } from '@/utils/telefone';
import { Selo } from './Selo';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

interface AlunoCardProps {
  aluno: Aluno;
  podeEditar?: boolean;
  podeDesativar?: boolean;
  podeExcluir?: boolean;
  podeRenovar?: boolean;
  onPress?: (aluno: Aluno) => void;
  onEditar?: (aluno: Aluno) => void;
  onAlternarAtivo?: (aluno: Aluno) => void;
  onExcluir?: (aluno: Aluno) => void;
  onRenovar?: (aluno: Aluno) => void;
}

export function AlunoCard({
  aluno,
  podeEditar = false,
  podeDesativar = false,
  podeExcluir = false,
  podeRenovar = false,
  onPress,
  onEditar,
  onAlternarAtivo,
  onExcluir,
  onRenovar,
}: AlunoCardProps) {
  const isArquivado = !aluno.ativo;

  return (
    <View style={[estilosComuns.cartao, isArquivado && styles.cartaoArquivado]}>
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={() => {
          if (onPress) onPress(aluno);
        }}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`Aluno ${aluno.nome}, toque para ver detalhes`}
      >
        <View style={styles.linhaSuperior}>
          <View style={styles.colunaIdentificacao}>
            <Text style={estilosComuns.tituloCartao}>{aluno.nome}</Text>
            {aluno.planoNome ? (
              <Text style={styles.textoPlano}>Plano: {aluno.planoNome}</Text>
            ) : null}
          </View>

          <View style={styles.linhaSelos}>
            {isArquivado ? (
              <Selo status="arquivado" />
            ) : (
              <Selo status={aluno.statusMatricula ?? 'sem_matricula'} />
            )}
          </View>
        </View>

        <View style={styles.linhaDetalhe}>
          <MaterialIcons name="cake" size={16} color={colors.gray[400]} />
          <Text style={estilosComuns.textoMutavel}>
            Nascimento: {formatarDataBR(aluno.dataNascimento)}
          </Text>
        </View>

        <View style={styles.linhaDetalhe}>
          <MaterialIcons name="phone" size={16} color={colors.gray[400]} />
          <Text style={estilosComuns.textoMutavel}>
            {formatarTelefone(aluno.telefone)}
          </Text>
        </View>
      </TouchableOpacity>

      {(podeEditar || podeDesativar || (podeExcluir && isArquivado) || podeRenovar) ? (
        <View style={estilosComuns.linhaAcoes}>
          {podeRenovar && onRenovar ? (
            <TouchableOpacity
              style={estilosComuns.botaoAcao}
              onPress={() => onRenovar(aluno)}
            >
              <MaterialIcons name="autorenew" size={15} color={colors.green[300]} />
              <Text style={estilosComuns.textoBotaoAcao}>Renovar</Text>
            </TouchableOpacity>
          ) : null}

          {podeEditar && onEditar ? (
            <TouchableOpacity
              style={estilosComuns.botaoAcao}
              onPress={() => onEditar(aluno)}
            >
              <MaterialIcons name="edit" size={15} color={colors.blue[400]} />
              <Text style={estilosComuns.textoBotaoAcao}>Editar</Text>
            </TouchableOpacity>
          ) : null}

          {podeDesativar && onAlternarAtivo ? (
            <TouchableOpacity
              style={estilosComuns.botaoAcao}
              onPress={() => onAlternarAtivo(aluno)}
            >
              <MaterialIcons
                name={aluno.ativo ? 'archive' : 'unarchive'}
                size={15}
                color={aluno.ativo ? colors.red[400] : colors.blue[400]}
              />
              <Text style={estilosComuns.textoBotaoAcao}>
                {aluno.ativo ? 'Arquivar' : 'Restaurar'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {podeExcluir && isArquivado && onExcluir ? (
            <TouchableOpacity
              style={[estilosComuns.botaoAcao, styles.botaoExcluir]}
              onPress={() => onExcluir(aluno)}
            >
              <MaterialIcons name="delete-forever" size={15} color={colors.red[400]} />
              <Text style={[estilosComuns.textoBotaoAcao, styles.textoExcluir]}>
                Excluir
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cartaoArquivado: {
    opacity: 0.65,
    borderColor: colors.gray[800],
  },
  linhaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  colunaIdentificacao: {
    flex: 1,
    gap: 2,
  },
  textoPlano: {
    color: colors.blue[300],
    fontSize: 13,
    fontWeight: '500',
  },
  linhaSelos: {
    alignItems: 'flex-end',
  },
  linhaDetalhe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  botaoExcluir: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  textoExcluir: {
    color: colors.red[400],
  },
});
