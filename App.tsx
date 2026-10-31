import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { modo } from './src/config/modo';
import { SessaoProvider } from '@/auth';
import { DadosProvider } from '@/dados';
import { AcademiaProvedor, AcervoProvedor } from '@/contexto';
import { NavegadorPrincipal } from '@/navegacao';
import { PlanosProvedor } from './src/contexto/PlanosContexto';
import { NavegadorCurso } from './src/navegacao/NavegadorCurso';

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
