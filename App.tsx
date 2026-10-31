import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { modo } from './src/config/modo';
import { SessaoProvider } from '@/auth';
import { DadosProvider } from '@/dados';
import { AcademiaProvedor, AcervoProvedor } from '@/contexto';
import { NavegadorPrincipal } from '@/navegacao';
import { PlanosProvedor } from './src/contexto/PlanosContexto';
import { NavegadorCurso } from './src/navegacao/NavegadorCurso';
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
          <MaterialIcons name="settings" size={56} color={colors.blue[400]} />
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
        <AcervoProvedor>
          <DadosProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <NavegadorPrincipal />
            </NavigationContainer>
          </DadosProvider>
        </AcervoProvedor>
      </SessaoProvider>
    </SafeAreaProvider>
  );
}

const estilosErroConfig = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  titulo: {
    color: '#F4F4F5',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mensagem: {
    color: colors.blue[300],
    fontSize: 14,
    textAlign: 'center',
  },
  detalhe: {
    color: '#A1A1AA',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
});
