import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RotasNaoAutenticadasParamList = {
  Login: undefined;
};

export type AbasAppParamList = {
  Inicio: undefined;
  Alunos: { abrirCadastro?: boolean } | undefined;
  Planos: undefined;
  Matriculas: { alunoId?: number; abrirCriacao?: boolean } | undefined;
  Conta: undefined;
};

export type RotasAbasParamList = AbasAppParamList;

export type RotasAutenticadasStackParamList = {
  Abas: NavigatorScreenParams<AbasAppParamList> | undefined;
  DetalheAluno: { alunoId: number };
  Usuarios: undefined;
};

export type NavegacaoLoginProp = NativeStackNavigationProp<
  RotasNaoAutenticadasParamList,
  'Login'
>;

export type NavegacaoAbasProp = BottomTabNavigationProp<AbasAppParamList>;

export type NavegacaoAppProp = CompositeNavigationProp<
  BottomTabNavigationProp<AbasAppParamList>,
  NativeStackNavigationProp<RotasAutenticadasStackParamList>
>;
