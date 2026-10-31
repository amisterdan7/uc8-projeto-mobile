import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSessao } from '@/auth';
import { Carregando } from '@/components';
import {
  TelaAlunos,
  TelaBusca,
  TelaConta,
  TelaDetalheAluno,
  TelaLogin,
  TelaMatriculas,
  TelaPlanos,
  TelaSobre,
  TelaUsuarios,
} from '@/telas';
import type {
  AbasAppParamList,
  RotasAutenticadasStackParamList,
  RotasNaoAutenticadasParamList,
} from './tipos';
import { colors } from '@/styles/colors';

const StackNaoAutenticado =
  createNativeStackNavigator<RotasNaoAutenticadasParamList>();
const StackAutenticado =
  createNativeStackNavigator<RotasAutenticadasStackParamList>();
const Tab = createBottomTabNavigator<AbasAppParamList>();

function NavegadorAutenticadoTabs() {
  const { podeFazer } = useSessao();
  const podeListarUsuarios = podeFazer('usuarios:listar');

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
          fontSize: 11,
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
        name="Busca"
        component={TelaBusca}
        options={{
          tabBarLabel: 'Busca',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
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
      {podeListarUsuarios ? (
        <Tab.Screen
          name="Usuarios"
          component={TelaUsuarios}
          options={{
            tabBarLabel: 'Usuários',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="security" size={size} color={color} />
            ),
          }}
        />
      ) : null}
      <Tab.Screen
        name="Sobre"
        component={TelaSobre}
        options={{
          tabBarLabel: 'Sobre',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="info-outline" size={size} color={color} />
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

function NavegadorAutenticadoStack() {
  return (
    <StackAutenticado.Navigator screenOptions={{ headerShown: false }}>
      <StackAutenticado.Screen name="Abas" component={NavegadorAutenticadoTabs} />
      <StackAutenticado.Screen
        name="DetalheAluno"
        component={TelaDetalheAluno}
      />
    </StackAutenticado.Navigator>
  );
}

function NavegadorNaoAutenticado() {
  return (
    <StackNaoAutenticado.Navigator screenOptions={{ headerShown: false }}>
      <StackNaoAutenticado.Screen name="Login" component={TelaLogin} />
    </StackNaoAutenticado.Navigator>
  );
}

export function NavegadorPrincipal() {
  const { usuario, carregando } = useSessao();

  if (carregando) {
    return <Carregando mensagem="Iniciando Academia MisterFit..." />;
  }

  return usuario ? <NavegadorAutenticadoStack /> : <NavegadorNaoAutenticado />;
}

export * from './tipos';
