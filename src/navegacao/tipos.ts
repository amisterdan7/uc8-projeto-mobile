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
  Alunos: undefined;
  Planos: undefined;
  Matriculas: undefined;
  Sobre: undefined;
  Conta: undefined;
};

export type RotasAutenticadasStackParamList = {
  Abas: NavigatorScreenParams<AbasAppParamList> | undefined;
  DetalheAluno: { alunoId: number };
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
