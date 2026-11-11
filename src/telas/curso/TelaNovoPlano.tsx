import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlanos } from '../../contexto/PlanosContexto';
import { Botao } from '../../componentes/Botao';
import { Campo } from '../../componentes/Campo';
import { registrarErro } from '../../erros/erros';
import type { RotasPilhaPlanos } from '../../navegacao/tiposPlanos';
import { cores, espacos } from '../../tema/tema';

type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanos, 'NovoPlano'>;

export function TelaNovoPlano() {
  const navigation = useNavigation<NavegacaoProps>();
  const { incluir } = usePlanos();

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('1');
  const [descricao, setDescricao] = useState('');
  const [tocado, setTocado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemErroGeral, setMensagemErroGeral] = useState<string | undefined>(undefined);

  const nomeVazio = nome.trim() === '';
  const erroNome = tocado && nomeVazio ? 'Informe o nome do plano' : undefined;

  const precoNum = Number(preco.replace(',', '.'));
  const precoInvalido = preco.trim() === '' || isNaN(precoNum) || precoNum < 0;
  const erroPreco = tocado && precoInvalido ? 'Informe um preço válido (ex: 99.90)' : undefined;

  const duracaoNum = Number(duracao);
  const duracaoInvalida = duracao.trim() === '' || !Number.isInteger(duracaoNum) || duracaoNum < 1;
  const erroDuracao = tocado && duracaoInvalida ? 'Informe a duração em meses (mínimo 1)' : undefined;

  const exemplaresInvalido = nomeVazio || precoInvalido || duracaoInvalida;

  function mudarNome(texto: string) {
    setTocado(true);
    setNome(texto);
    if (mensagemErroGeral) setMensagemErroGeral(undefined);
  }

  function mudarPreco(texto: string) {
    setTocado(true);
    setPreco(texto);
    if (mensagemErroGeral) setMensagemErroGeral(undefined);
  }

  function mudarDuracao(texto: string) {
    setTocado(true);
    setDuracao(texto);
    if (mensagemErroGeral) setMensagemErroGeral(undefined);
  }

  function salvar() {
    setTocado(true);
    if (exemplaresInvalido) {
      return;
    }

    setSalvando(true);
    setMensagemErroGeral(undefined);

    incluir({
      nome: nome.trim(),
      preco: precoNum,
      duracao_meses: duracaoNum,
      descricao: descricao.trim() ? descricao.trim() : null,
    })
      .then(() => {
        setSalvando(false);
        navigation.goBack();
      })
      .catch((falha: unknown) => {
        setSalvando(false);
        const classificado = registrarErro('cadastro', falha);
        setMensagemErroGeral(classificado.mensagem);
      });
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>Cadastrar Novo Plano</Text>

      <Campo
        rotulo="Nome do Plano *"
        valor={nome}
        aoMudar={mudarNome}
        erro={erroNome}
        placeholder="Ex: Semestral Plus"
      />

      <Campo
        rotulo="Preço (R$) *"
        valor={preco}
        aoMudar={mudarPreco}
        tipoDeTeclado="decimal-pad"
        erro={erroPreco}
        placeholder="Ex: 149.90"
      />

      <Campo
        rotulo="Duração (meses) *"
        valor={duracao}
        aoMudar={mudarDuracao}
        tipoDeTeclado="numeric"
        erro={erroDuracao}
        placeholder="Ex: 6"
      />

      <Campo
        rotulo="Descrição (opcional)"
        valor={descricao}
        aoMudar={setDescricao}
        placeholder="Ex: Acesso total à musculação e área cardio"
      />

      {mensagemErroGeral !== undefined ? (
        <Text style={estilos.erroGeral}>{mensagemErroGeral}</Text>
      ) : null}

      <View style={estilos.acoes}>
        <View style={estilos.botaoWrapper}>
          <Botao
            titulo="Cancelar"
            variante="secundario"
            onPress={() => navigation.goBack()}
            desabilitado={salvando}
          />
        </View>
        <View style={estilos.botaoWrapper}>
          <Botao
            titulo="Salvar Plano"
            onPress={salvar}
            carregando={salvando}
            desabilitado={exemplaresInvalido || salvando}
          />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacos.md,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: espacos.md,
  },
  acoes: {
    flexDirection: 'row',
    gap: espacos.sm,
    marginTop: espacos.md,
  },
  botaoWrapper: {
    flex: 1,
  },
  erroGeral: {
    color: cores.erro,
    fontWeight: 'bold',
    marginTop: espacos.xs,
    fontSize: 13,
  },
});
