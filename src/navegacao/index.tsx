import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSessao } from '@/auth';
import { Carregando } from '@/components';
import {
  TelaAlunos,
  TelaConta,
  TelaDetalheAluno,
  TelaInicio,
  TelaLogin,
  TelaMatriculas,
  TelaPlanos,
  TelaUsuarios,
} from '@/telas';
import type {
  AbasAppParamList,
  RotasAutenticadasStackParamList,
  RotasNaoAutenticadasParamList,
} from './tipos';
import { cores } from '@/tema/tema';

const StackNaoAutenticado =
  createNativeStackNavigator<RotasNaoAutenticadasParamList>();
const StackAutenticado =
  createNativeStackNavigator<RotasAutenticadasStackParamList>();
const Tab = createBottomTabNavigator<AbasAppParamList>();

function NavegadorAutenticadoTabs() {
  const insets = useSafeAreaInsets();
  const espacoInferior = Math.max(insets.bottom, 8);
  const alturaBarra = 58 + espacoInferior;

  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: cores.cartao,
          borderTopColor: cores.borda,
          borderTopWidth: 1,
          height: alturaBarra,
          paddingBottom: espacoInferior,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={TelaInicio}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
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

function NavegadorAutenticadoStack() {
  const { podeFazer } = useSessao();
  const podeListarUsuarios = podeFazer('usuarios:listar');

  return (
    <StackAutenticado.Navigator screenOptions={{ headerShown: false }}>
      <StackAutenticado.Screen name="Abas" component={NavegadorAutenticadoTabs} />
      <StackAutenticado.Screen
        name="DetalheAluno"
        component={TelaDetalheAluno}
      />
      {podeListarUsuarios ? (
        <StackAutenticado.Screen
          name="Usuarios"
          component={TelaUsuarios}
        />
      ) : null}
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
