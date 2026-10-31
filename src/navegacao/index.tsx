import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessao } from '@/auth';
import { Carregando } from '@/components';
import {
  TelaAlunos,
  TelaConta,
  TelaLogin,
  TelaMatriculas,
  TelaPlanos,
} from '@/telas';
import type { AbasAppParamList, RotasNaoAutenticadasParamList } from './tipos';
import { colors } from '@/styles/colors';

const Stack = createNativeStackNavigator<RotasNaoAutenticadasParamList>();
const Tab = createBottomTabNavigator<AbasAppParamList>();

function NavegadorAutenticado() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.gray[800],
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.blue[400],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Alunos"
        component={TelaAlunos}
        options={{
          tabBarLabel: 'Alunos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Planos"
        component={TelaPlanos}
        options={{
          tabBarLabel: 'Planos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Matriculas"
        component={TelaMatriculas}
        options={{
          tabBarLabel: 'Matrículas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Conta"
        component={TelaConta}
        options={{
          tabBarLabel: 'Conta',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function NavegadorNaoAutenticado() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={TelaLogin} />
    </Stack.Navigator>
  );
}

export function NavegadorPrincipal() {
  const { usuario, carregando } = useSessao();

  if (carregando) {
    return <Carregando mensagem="Iniciando Academia MisterFit..." />;
  }

  return usuario ? <NavegadorAutenticado /> : <NavegadorNaoAutenticado />;
}

export * from './tipos';
