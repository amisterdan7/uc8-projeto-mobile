import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RotasPilhaPlanosCurso = {
  ListaPlanos: undefined;
  DetalhePlano: { id: number };
  NovoPlano: undefined;
};

export type AbasCursoParamList = {
  PlanosTab: NavigatorScreenParams<RotasPilhaPlanosCurso> | undefined;
  Busca: undefined;
  Sobre: undefined;
};

export type NavegacaoPilhaPlanosProp = NativeStackNavigationProp<RotasPilhaPlanosCurso>;

export type NavegacaoAbasCursoProp = CompositeNavigationProp<
  BottomTabNavigationProp<AbasCursoParamList>,
  NativeStackNavigationProp<RotasPilhaPlanosCurso>
>;
