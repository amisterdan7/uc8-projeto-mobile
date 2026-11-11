import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { TelaListaPlanos } from '../telas/curso/TelaListaPlanos';
import { TelaDetalhePlano } from '../telas/curso/TelaDetalhePlano';
import { TelaNovoPlano } from '../telas/curso/TelaNovoPlano';
import { TelaBuscaPlanos } from '../telas/curso/TelaBuscaPlanos';
import { TelaSobrePlanos } from '../telas/curso/TelaSobrePlanos';
import type { AbasPlanosParamList, RotasPilhaPlanos } from './tiposPlanos';
import { cores } from '../tema/tema';

const StackPlanos = createNativeStackNavigator<RotasPilhaPlanos>();
const Tab = createBottomTabNavigator<AbasPlanosParamList>();

function PilhaPlanosNavegador() {
  return (
    <StackPlanos.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.superficie },
        headerTintColor: cores.texto,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <StackPlanos.Screen
        name="ListaPlanos"
        component={TelaListaPlanos}
        options={{ title: 'Planos' }}
      />
      <StackPlanos.Screen
        name="DetalhePlano"
        component={TelaDetalhePlano}
        options={{ title: 'Detalhes do Plano' }}
      />
      <StackPlanos.Screen
        name="NovoPlano"
        component={TelaNovoPlano}
        options={{ title: 'Novo Plano' }}
      />
    </StackPlanos.Navigator>
  );
}

export function NavegadorPlanos() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: cores.superficie,
          borderTopColor: cores.borda,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="PlanosTab"
        component={PilhaPlanosNavegador}
        options={{
          tabBarLabel: 'Planos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Busca"
        component={TelaBuscaPlanos}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: cores.superficie },
          headerTintColor: cores.texto,
          title: 'Buscar',
          tabBarLabel: 'Busca',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sobre"
        component={TelaSobrePlanos}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: cores.superficie },
          headerTintColor: cores.texto,
          title: 'Sobre',
          tabBarLabel: 'Sobre',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="info-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
