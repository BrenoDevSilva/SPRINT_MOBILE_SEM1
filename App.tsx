import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeTabs from './src/navigation/HomeTabs';
import RegisterScreen from './src/screens/RegisterScreen';
import AddAssetScreen from './src/screens/AddAssetScreen';
import { AuthProvider } from './src/context/AuthContext'; // Importe o AuthProvider
import { PortfolioProvider } from './src/context/PortfolioContext'; // Importe o PortfolioProvider

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  HomeTabs: undefined;
  Register: undefined;
  AddAsset: undefined;
  Portfolio: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* WelcomeScreen é geralmente a primeira tela para usuários novos/deslogados */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="HomeTabs" component={HomeTabs} />
            <Stack.Screen name="AddAsset" component={AddAssetScreen} />
         </Stack.Navigator>
        </NavigationContainer>
      </PortfolioProvider>
    </AuthProvider>
  );
};