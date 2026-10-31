import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RotasNaoAutenticadasParamList = {
  Login: undefined;
};

export type AbasAppParamList = {
  Alunos: undefined;
  Planos: undefined;
  Matriculas: undefined;
  Conta: undefined;
};

export type NavegacaoLoginProp = NativeStackNavigationProp<
  RotasNaoAutenticadasParamList,
  'Login'
>;

export type NavegacaoAbasProp = BottomTabNavigationProp<AbasAppParamList>;
