import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { modo } from './src/config/modo';
import { SessaoProvider } from '@/auth';
import { AcademiaProvedor } from '@/contexto';
import { NavegadorPrincipal } from '@/navegacao';
import { PlanosProvedor } from './src/contexto/PlanosContexto';
import { NavegadorPlanos } from './src/navegacao/NavegadorPlanos';
import { ehEnderecoLocal, MENSAGEM_ENDERECO_LOCAL } from '@/utils/urlApi';
import { cores, espacos, foco } from '@/tema/tema';

const temaNavegacao: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.primaria,
    background: cores.fundo,
    card: cores.cartao,
    text: cores.texto,
    border: cores.borda,
    notification: cores.primaria,
  },
};

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    const idEstilo = 'misterfit-foco-laranja';
    if (document.getElementById(idEstilo)) {
      return;
    }
    const estilo = document.createElement('style');
    estilo.id = idEstilo;
    estilo.textContent = `
      *:focus-visible,
      input:focus,
      textarea:focus,
      select:focus,
      [role="tab"]:focus,
      [role="tab"]:focus-visible,
      [role="button"]:focus-visible,
      a:focus-visible,
      button:focus-visible {
        outline: ${foco.larguraBorda}px solid ${foco.cor} !important;
        outline-offset: -2px !important;
      }
    `;
    document.head.appendChild(estilo);
  }, []);

  if (modo === 'curso') {
    return (
      <SafeAreaProvider>
        <PlanosProvedor>
          <NavigationContainer theme={temaNavegacao}>
            <StatusBar style="light" />
            <NavegadorPlanos />
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

  if (Platform.OS !== 'web' && ehEnderecoLocal(urlApi)) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={estilosErroConfig.container}>
          <MaterialIcons name="settings" size={56} color={cores.primaria} />
          <Text style={estilosErroConfig.titulo}>Configuração Pendente</Text>
          <Text style={estilosErroConfig.mensagem}>
            {MENSAGEM_ENDERECO_LOCAL}
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
          <NavigationContainer theme={temaNavegacao}>
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
