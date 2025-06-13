import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Certifique-se de que o caminho está correto

// Define as props de navegação para a tela Welcome
type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Logo: Certifique-se de que o caminho da imagem está correto */}
      <Image
        source={require('../images/Logo Datarium.png')} // Caminho para a imagem da logo
        style={styles.logo}
        resizeMode="contain" // Garante que a imagem se ajuste sem cortar ou esticar
      />

      <Text style={styles.title}>Datarium</Text>
      <Text style={styles.subtitle}>Dados que pensam, investimentos que crescem</Text>

      {/* Usando TouchableOpacity para um botão estilizado */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A1A', // Cor de fundo da tela
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    padding: 20,
    // Ajuste para a barra de status em Android
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  logo: {
    width: 200, // Largura da logo (ajuste conforme necessário)
    height: 200, // Altura da logo (ajuste conforme necessário)
    marginBottom: 20, // Espaço abaixo da logo
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700', // Cor dourada para o título
    marginBottom: 10, // Espaço abaixo do título
    textAlign: 'center', // Centraliza o texto
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF', // Cor branca para o subtítulo
    marginBottom: 40, // Espaço abaixo do subtítulo
    textAlign: 'center', // Centraliza o texto
  },
  button: {
    backgroundColor: '#FFD700', // <-- Cor do botão mudada para amarelo/dourado
    paddingVertical: 15, // Preenchimento vertical
    paddingHorizontal: 30, // Preenchimento horizontal
    borderRadius: 10, // Bordas arredondadas
  },
  buttonText: {
    color: '#050A1A', // <-- Mudei a cor do texto do botão para combinar melhor com o amarelo
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});