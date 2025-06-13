// src/screens/LoginScreen.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
// Remova: import { login as authServiceLogin } from '../services/auth';
import { AuthContext } from '../context/AuthContext'; // Importe AuthContext
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // Mantenha para o ícone de olho da senha, se quiser

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState(''); // Alterado para username para consistência com AuthContext
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Para mostrar/esconder senha

  // Obtenha a função 'signIn' do AuthContext
  const { signIn, isLoadingAuth } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome de usuário e a senha.');
      return;
    }

    try {
      const success = await signIn(username, password);

      if (success) {
        // Alert.alert('Sucesso', 'Login realizado com sucesso!'); // Pode remover este alert para uma transição mais suave
        navigation.replace('HomeTabs');
      } else {
        Alert.alert('Erro de Login', 'Nome de usuário ou senha inválidos. Tente novamente.');
      }
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.');
    }
  };

  return (
    <LinearGradient colors={['#002B5B', '#001D40']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <Text style={styles.title}>Entrar na sua conta</Text>

              <View style={styles.formContainer}>
                <Text style={styles.label}>Nome de Usuário:</Text>
                <TextInput
                  placeholder="Seu nome de usuário"
                  placeholderTextColor="#A0A0A0"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  autoCapitalize="none"
                  editable={!isLoadingAuth}
                />

                <Text style={styles.label}>Senha:</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    placeholder="Sua senha"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.passwordInput}
                    secureTextEntry={!showPassword}
                    editable={!isLoadingAuth}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={width * 0.05} color="#A0A0A0" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                  disabled={isLoadingAuth}
                >
                  <Text style={styles.buttonText}>
                    {isLoadingAuth ? 'Entrando...' : 'Entrar'}
                  </Text>
                </TouchableOpacity>

                {/* Link para a tela de registro */}
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.03,
  },
  container: {
    width: '90%',
    alignItems: 'center',
    padding: width * 0.05,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: height * 0.05,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: width * 0.05,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#002B5B',
    marginBottom: height * 0.01,
    marginTop: height * 0.02,
  },
  input: {
    height: height * 0.06,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    fontSize: width * 0.04,
    color: '#333333',
    backgroundColor: '#F9F9F9',
    marginBottom: height * 0.02,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: height * 0.06,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    marginBottom: height * 0.02,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: width * 0.03,
    fontSize: width * 0.04,
    color: '#333333',
  },
  eyeIcon: {
    paddingHorizontal: width * 0.03,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: height * 0.02,
    borderRadius: 10,
    marginTop: height * 0.02,
    alignItems: 'center',
  },
  buttonText: {
    color: '#002B5B',
    fontSize: width * 0.05,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    marginTop: height * 0.02,
    color: '#002B5B',
    textAlign: 'center',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});