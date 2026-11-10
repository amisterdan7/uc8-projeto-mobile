import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { modo } from './src/config/modo';
import { SessaoProvider } from '@/auth';
import { AcademiaProvedor } from '@/contexto';
import { NavegadorPrincipal } from '@/navegacao';
import { PlanosProvedor } from './src/contexto/PlanosContexto';
import { NavegadorCurso } from './src/navegacao/NavegadorCurso';
import { cores, espacos } from '@/tema/tema';
import { colors } from '@/styles/colors';

export default function App() {
  if (modo === 'curso') {
    return (
      <SafeAreaProvider>
        <PlanosProvedor>
          <NavigationContainer>
            <StatusBar style="light" />
            <NavegadorCurso />
          </NavigationContainer>
        </PlanosProvedor>
      </SafeAreaProvider>
    );
  }

  const urlApi = process.env.EXPO_PUBLIC_API_URL;
  if (!urlApi || urlApi.trim() === '') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={estilosErroConfig.container}>
          <MaterialIcons name="settings" size={56} color={cores.primaria} />
          <Text style={estilosErroConfig.titulo}>Configuração Pendente</Text>
          <Text style={estilosErroConfig.mensagem}>
            A variável de ambiente EXPO_PUBLIC_API_URL não foi configurada.
          </Text>
          <Text style={estilosErroConfig.detalhe}>
            Crie o arquivo .env.local a partir de .env.example e defina o endereço da API v1 para executar o aplicativo no Modo Equipe.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SessaoProvider>
        <AcademiaProvedor>
          <NavigationContainer>
            <StatusBar style="light" />
            <NavegadorPrincipal />
          </NavigationContainer>
        </AcademiaProvedor>
      </SessaoProvider>
    </SafeAreaProvider>
  );
}

const estilosErroConfig = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacos.lg,
    gap: espacos.sm + 4,
  },
  titulo: {
    color: cores.texto,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mensagem: {
    color: cores.primaria,
    fontSize: 14,
    textAlign: 'center',
  },
  detalhe: {
    color: cores.textoSecundario,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: espacos.xs,
  },
});
