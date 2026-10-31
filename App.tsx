import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SessaoProvider } from '@/auth';
import { DadosProvider } from '@/dados';
import { NavegadorPrincipal } from '@/navegacao';

export default function App() {
  return (
    <SafeAreaProvider>
      <SessaoProvider>
        <DadosProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <NavegadorPrincipal />
          </NavigationContainer>
        </DadosProvider>
      </SessaoProvider>
    </SafeAreaProvider>
  );
}
