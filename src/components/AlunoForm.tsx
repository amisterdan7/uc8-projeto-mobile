import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Aluno, Plano } from '@/types/entidades';
import {
  aplicarMascaraData,
  dataBRparaISO,
  formatarDataBR,
  validarDataCivilBR,
  validarDataNascimentoBR,
} from '@/utils/datas';
import { formatarMoedaBRL } from '@/utils/moeda';
import { aplicarMascaraTelefone, limparTelefone } from '@/utils/telefone';
import { Campo } from './Campo';
import { colors } from '@/styles/colors';
import { estilosComuns } from '@/styles/comum';

export interface DadosSubmissaoAluno {
  nome: string;
  dataNascimentoISO: string;
  telefone: string;
  idPlano?: number;
  dataInicioISO?: string;
}

interface AlunoFormProps {
  alunoInicial?: Aluno | null;
  planosDisponiveis?: Plano[];
  salvando?: boolean;
  errosExternos?: Record<string, string>;
  onSubmit: (dados: DadosSubmissaoAluno) => void;
  onCancelar?: () => void;
}

export function AlunoForm({
  alunoInicial,
  planosDisponiveis = [],
  salvando = false,
  errosExternos,
  onSubmit,
  onCancelar,
}: AlunoFormProps) {
  const modoEdicao = Boolean(alunoInicial);

  const [nome, setNome] = useState(alunoInicial?.nome ?? '');
  const [nascimentoBR, setNascimentoBR] = useState(
    alunoInicial ? formatarDataBR(alunoInicial.dataNascimento) : ''
  );
  const [telefone, setTelefone] = useState(
    alunoInicial?.telefone ? aplicarMascaraTelefone(alunoInicial.telefone) : ''
  );
  const [idPlanoSelecionado, setIdPlanoSelecionado] = useState<number | null>(null);
  const [dataInicioBR, setDataInicioBR] = useState('');

  const [erroNome, setErroNome] = useState('');
  const [erroNascimento, setErroNascimento] = useState('');
  const [erroTelefone, setErroTelefone] = useState('');
  const [erroPlano, setErroPlano] = useState('');
  const [erroDataInicio, setErroDataInicio] = useState('');

  const semPlanosCadastrados = !modoEdicao && planosDisponiveis.length === 0;
  const botaoDesabilitado = salvando || semPlanosCadastrados;

  function handleNomeChange(texto: string) {
    setNome(texto);
    if (erroNome) setErroNome('');
  }

  function handleDataChange(texto: string) {
    setNascimentoBR(aplicarMascaraData(texto));
    if (erroNascimento) setErroNascimento('');
  }

  function handleTelefoneChange(texto: string) {
    setTelefone(aplicarMascaraTelefone(texto));
    if (erroTelefone) setErroTelefone('');
  }

  function handleSelecionarPlano(idPlano: number) {
    setIdPlanoSelecionado(idPlano);
    if (erroPlano) setErroPlano('');
  }

  function handleDataInicioChange(texto: string) {
    setDataInicioBR(aplicarMascaraData(texto));
    if (erroDataInicio) setErroDataInicio('');
  }

  function handleSubmit() {
    let temErros = false;
    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 3 || nomeLimpo.length > 100) {
      setErroNome('O nome deve ter entre 3 e 100 caracteres.');
      temErros = true;
    } else {
      setErroNome('');
    }

    const validacaoData = validarDataNascimentoBR(nascimentoBR);
    if (!validacaoData.valida) {
      setErroNascimento(validacaoData.mensagem ?? 'Data de nascimento inválida.');
      temErros = true;
    } else {
      setErroNascimento('');
    }

    const telLimpo = limparTelefone(telefone);
    if (telLimpo.length > 0 && (telLimpo.length < 10 || telLimpo.length > 13)) {
      setErroTelefone('Telefone deve conter DDD e de 10 a 13 dígitos numéricos.');
      temErros = true;
    } else {
      setErroTelefone('');
    }

    let dataInicioISO: string | undefined;

    if (!modoEdicao) {
      if (!idPlanoSelecionado) {
        setErroPlano('Escolha um plano');
        temErros = true;
      } else {
        setErroPlano('');
      }

      if (dataInicioBR.trim().length > 0) {
        const validacaoInicio = validarDataCivilBR(dataInicioBR.trim());
        if (!validacaoInicio.valida) {
          setErroDataInicio(validacaoInicio.mensagem ?? 'Data de início inválida.');
          temErros = true;
        } else {
          setErroDataInicio('');
          dataInicioISO = dataBRparaISO(dataInicioBR.trim());
        }
      } else {
        setErroDataInicio('');
      }
    }

    if (temErros) {
      return;
    }

    const dataISO = dataBRparaISO(nascimentoBR);
    onSubmit({
      nome: nomeLimpo,
      dataNascimentoISO: dataISO,
      telefone: telLimpo,
      idPlano: modoEdicao ? undefined : (idPlanoSelecionado ?? undefined),
      dataInicioISO,
    });
  }

  const mensagemErroPlano = erroPlano || errosExternos?.id_plano;
  const mensagemErroDataInicio = erroDataInicio || errosExternos?.data_inicio;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollConteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={estilosComuns.tituloCartao}>
          {modoEdicao ? 'Editar aluno' : 'Cadastrar e matricular'}
        </Text>

        {modoEdicao ? (
          <View style={styles.avisoInfo}>
            <MaterialIcons name="info-outline" size={18} color={colors.blue[300]} />
            <Text style={styles.textoAvisoInfo}>
              O plano muda em Matrículas, com a opção Renovar.
            </Text>
          </View>
        ) : null}

        <Campo
          rotulo="Nome completo"
          obrigatorio
          value={nome}
          onChangeText={handleNomeChange}
          placeholder="Ex.: Maria Souza"
          autoCapitalize="words"
          editable={!salvando}
          erro={erroNome || errosExternos?.nome}
          iconeEsquerda="person"
        />

        <Campo
          rotulo="Data de Nascimento (DD/MM/AAAA)"
          obrigatorio
          value={nascimentoBR}
          onChangeText={handleDataChange}
          placeholder="Ex.: 15/05/1998"
          keyboardType="number-pad"
          maxLength={10}
          editable={!salvando}
          erro={erroNascimento || errosExternos?.data_nascimento}
          iconeEsquerda="cake"
        />

        <Campo
          rotulo="Telefone com DDD (opcional)"
          value={telefone}
          onChangeText={handleTelefoneChange}
          placeholder="Ex.: (84) 99999-0000"
          keyboardType="phone-pad"
          maxLength={15}
          editable={!salvando}
          erro={erroTelefone || errosExternos?.telefone}
          iconeEsquerda="phone"
        />

        {!modoEdicao ? (
          <>
            <View style={styles.secaoPlano}>
              <Text style={estilosComuns.rotulo}>Plano *</Text>

              {semPlanosCadastrados ? (
                <View style={styles.avisoSemPlano}>
                  <MaterialIcons
                    name="warning-amber"
                    size={20}
                    color={colors.yellow[400]}
                  />
                  <Text style={styles.textoAvisoSemPlano}>
                    Nenhum plano disponível no momento. Cadastre ou atualize a lista de
                    planos antes de matricular um aluno.
                  </Text>
                </View>
              ) : (
                <View style={styles.listaPlanos}>
                  {planosDisponiveis.map((plano) => {
                    const selecionado = idPlanoSelecionado === plano.id;
                    const textoDuracao =
                      plano.duracaoMeses === 1
                        ? '1 mês'
                        : `${plano.duracaoMeses} meses`;

                    return (
                      <TouchableOpacity
                        key={plano.id}
                        style={[
                          styles.cartaoPlano,
                          plano.destaque && styles.cartaoPlanoDestaque,
                          selecionado && styles.cartaoPlanoSelecionado,
                        ]}
                        onPress={() => handleSelecionarPlano(plano.id)}
                        disabled={salvando}
                        accessibilityRole="button"
                        accessibilityState={{ selected: selecionado }}
                        accessibilityLabel={`Plano ${plano.nome}, ${formatarMoedaBRL(plano.preco)}, duração de ${textoDuracao}`}
                      >
                        <View style={styles.topoCartaoPlano}>
                          <View style={styles.tituloCartaoPlanoContainer}>
                            <MaterialIcons
                              name={
                                selecionado
                                  ? 'radio-button-checked'
                                  : 'radio-button-unchecked'
                              }
                              size={20}
                              color={
                                selecionado ? colors.blue[400] : colors.gray[400]
                              }
                            />
                            <Text style={styles.nomePlano}>{plano.nome}</Text>
                          </View>

                          {plano.destaque ? (
                            <View style={styles.seloDestaque}>
                              <MaterialIcons
                                name="star"
                                size={12}
                                color={colors.yellow[300]}
                              />
                              <Text style={styles.textoSeloDestaque}>Destaque</Text>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.rodapeCartaoPlano}>
                          <Text style={styles.precoPlano}>
                            {formatarMoedaBRL(plano.preco)}
                          </Text>
                          <Text style={styles.duracaoPlano}>{textoDuracao}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {mensagemErroPlano ? (
                <Text style={estilosComuns.textoErro}>{mensagemErroPlano}</Text>
              ) : null}
            </View>

            <Campo
              rotulo="Data de início (DD/MM/AAAA - opcional, padrão: hoje)"
              value={dataInicioBR}
              onChangeText={handleDataInicioChange}
              placeholder="Em branco usa a data de hoje"
              keyboardType="number-pad"
              maxLength={10}
              editable={!salvando}
              erro={mensagemErroDataInicio}
              iconeEsquerda="event"
            />
          </>
        ) : null}

        <View style={styles.linhaBotoes}>
          {onCancelar ? (
            <TouchableOpacity
              style={[styles.botao, styles.botaoCancelar]}
              onPress={onCancelar}
              disabled={salvando}
            >
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[
              styles.botao,
              estilosComuns.botaoPrimario,
              styles.botaoSalvar,
              botaoDesabilitado && { opacity: 0.5 },
            ]}
            onPress={handleSubmit}
            disabled={botaoDesabilitado}
          >
            {salvando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={estilosComuns.textoBotaoPrimario}>
                {modoEdicao ? 'Salvar alterações' : 'Cadastrar e matricular'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollConteudo: {
    paddingBottom: 24,
  },
  container: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: 10,
    marginBottom: 16,
  },
  avisoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: colors.blue[500],
  },
  textoAvisoInfo: {
    flex: 1,
    color: colors.blue[300],
    fontSize: 13,
  },
  secaoPlano: {
    gap: 8,
    marginTop: 4,
  },
  avisoSemPlano: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: colors.yellow[400],
  },
  textoAvisoSemPlano: {
    flex: 1,
    color: colors.yellow[300],
    fontSize: 13,
  },
  listaPlanos: {
    gap: 8,
  },
  cartaoPlano: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[800],
    padding: 12,
    gap: 6,
  },
  cartaoPlanoDestaque: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  cartaoPlanoSelecionado: {
    borderColor: colors.blue[500],
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  topoCartaoPlano: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  tituloCartaoPlanoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  nomePlano: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  seloDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
  },
  textoSeloDestaque: {
    color: colors.yellow[300],
    fontSize: 11,
    fontWeight: 'bold',
  },
  rodapeCartaoPlano: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 28,
  },
  precoPlano: {
    color: colors.blue[300],
    fontSize: 14,
    fontWeight: 'bold',
  },
  duracaoPlano: {
    color: colors.gray[400],
    fontSize: 13,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    backgroundColor: colors.gray[800],
  },
  textoBotaoCancelar: {
    color: colors.gray[300],
    fontWeight: '600',
  },
  botaoSalvar: {
    paddingVertical: 12,
  },
});
