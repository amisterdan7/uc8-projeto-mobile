import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Aluno } from '@/types/entidades';
import { formatarDataBR } from '@/utils/datas';
import { formatarTelefone } from '@/utils/telefone';
import { Selo } from './Selo';
import { cores, espacos } from '@/tema/tema';
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
  const statusAluno = aluno.statusMatricula ?? 'sem_matricula';
  const rotuloStatusAluno =
    statusAluno === 'ativa'
      ? 'Ativo'
      : statusAluno === 'vencida'
        ? 'Vencido'
        : statusAluno === 'inativa'
          ? 'Inativo'
          : undefined;

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
              <Selo status={statusAluno} rotuloPersonalizado={rotuloStatusAluno} />
            )}
          </View>
        </View>

        <View style={styles.linhaDetalhe}>
          <MaterialIcons name="cake" size={16} color={cores.textoSecundario} />
          <Text style={estilosComuns.textoMutavel}>
            Nascimento: {formatarDataBR(aluno.dataNascimento)}
          </Text>
        </View>

        <View style={styles.linhaDetalhe}>
          <MaterialIcons name="phone" size={16} color={cores.textoSecundario} />
          <Text style={estilosComuns.textoMutavel}>
            {formatarTelefone(aluno.telefone)}
          </Text>
        </View>
      </TouchableOpacity>

      {(podeEditar || podeDesativar || (podeExcluir && isArquivado) || (!isArquivado && podeRenovar)) ? (
        <View style={estilosComuns.linhaAcoes}>
          {!isArquivado && podeRenovar && onRenovar ? (
            <TouchableOpacity
              style={estilosComuns.botaoAcao}
              onPress={() => onRenovar(aluno)}
            >
              <MaterialIcons name="autorenew" size={15} color={cores.sucesso} />
              <Text style={estilosComuns.textoBotaoAcao}>Renovar</Text>
            </TouchableOpacity>
          ) : null}

          {podeEditar && onEditar ? (
            <TouchableOpacity
              style={estilosComuns.botaoAcao}
              onPress={() => onEditar(aluno)}
            >
              <MaterialIcons name="edit" size={15} color={cores.primaria} />
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
                color={aluno.ativo ? cores.erro : cores.primaria}
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
              <MaterialIcons name="delete-forever" size={15} color={cores.erro} />
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
    opacity: 0.45,
    borderColor: cores.borda,
  },
  linhaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: espacos.sm,
  },
  colunaIdentificacao: {
    flex: 1,
    gap: 2,
  },
  textoPlano: {
    color: cores.primaria,
    fontSize: 13,
    fontWeight: '600',
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
    backgroundColor: cores.erroSuave,
  },
  textoExcluir: {
    color: cores.erro,
  },
});
