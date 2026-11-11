import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RotasPilhaPlanos = {
  ListaPlanos: undefined;
  DetalhePlano: { id: number };
  NovoPlano: undefined;
};

export type AbasPlanosParamList = {
  PlanosTab: NavigatorScreenParams<RotasPilhaPlanos> | undefined;
  Busca: undefined;
  Sobre: undefined;
};

export type NavegacaoPilhaPlanosProp = NativeStackNavigationProp<RotasPilhaPlanos>;

export type NavegacaoAbasPlanosProp = CompositeNavigationProp<
  BottomTabNavigationProp<AbasPlanosParamList>,
  NativeStackNavigationProp<RotasPilhaPlanos>
>;
