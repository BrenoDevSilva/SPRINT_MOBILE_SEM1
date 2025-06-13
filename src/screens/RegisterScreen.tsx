// src/screens/RegisterScreen.tsx
import React, { useState, useContext } from 'react'; // Adicionado useContext
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
// Remova: import { register } from '../services/auth'; // Não usaremos mais o serviço auth diretamente
import { AuthContext } from '../context/AuthContext'; // Importe AuthContext
import { LinearGradient } from 'expo-linear-gradient'; // Adicione LinearGradient
import { Ionicons } from '@expo/vector-icons'; // Para o ícone de olho da senha

const { width, height } = Dimensions.get('window'); // Adicione height

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState(''); // Alterado para username para consistência com AuthContext
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Adicionado para confirmação de senha
  const [showPassword, setShowPassword] = useState(false); // Para mostrar/esconder senha

  // Obtenha a função 'signUp' do AuthContext
  const { signUp, isLoadingAuth } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    try {
      // Chame a função 'signUp' do AuthContext
      const success = await signUp(username, password); // A senha é passada mas não usada no mock atual

      if (success) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        // Se o signUp loga automaticamente, replace para HomeTabs.
        // Se não logar, navigation.replace('Login'); e o usuário faz login manualmente.
        navigation.replace('HomeTabs'); // Assumindo que signUp faz login automático
      } else {
        Alert.alert('Erro', 'Nome de usuário já existe ou ocorreu um erro no cadastro. Tente outro nome de usuário.');
      }
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar criar a conta. Tente novamente mais tarde.');
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
              <Text style={styles.title}>Criar nova conta</Text>

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

                <Text style={styles.label}>Confirmar Senha:</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    placeholder="Confirme sua senha"
                    placeholderTextColor="#A0A0A0"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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
                  onPress={handleRegister}
                  disabled={isLoadingAuth}
                >
                  <Text style={styles.buttonText}>
                    {isLoadingAuth ? 'Cadastrando...' : 'Cadastrar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.link}>Já tem conta? Entrar</Text>
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
    paddingBottom: height * 0.03, // Adicionado para espaçamento inferior
  },
  container: {
    width: '90%',
    alignItems: 'center',
    padding: width * 0.05,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#FFFFFF', // Alterado para branco para combinar com o gradiente
    marginBottom: height * 0.05, // Usando height
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
  passwordInputContainer: { // Novo estilo para o container de senha
    flexDirection: 'row',
    alignItems: 'center',
    height: height * 0.06,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    marginBottom: height * 0.02,
  },
  passwordInput: { // Estilo para o TextInput dentro do container
    flex: 1,
    paddingHorizontal: width * 0.03,
    fontSize: width * 0.04,
    color: '#333333',
  },
  eyeIcon: { // Estilo para o ícone de olho
    paddingHorizontal: width * 0.03,
  },
  button: {
    backgroundColor: '#FFD700', // Cor do botão principal
    paddingVertical: height * 0.02,
    borderRadius: 10,
    marginTop: height * 0.02,
    alignItems: 'center',
  },
  buttonText: {
    color: '#002B5B', // Cor do texto do botão
    fontSize: width * 0.05,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    marginTop: height * 0.02,
    color: '#002B5B', // Cor do link
    textAlign: 'center',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});