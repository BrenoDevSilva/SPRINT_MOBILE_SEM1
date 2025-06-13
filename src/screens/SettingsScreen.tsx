// src/screens/SettingsScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PortfolioContext } from '../context/PortfolioContext'; // Importe PortfolioContext
import { Ionicons } from '@expo/vector-icons'; // Certifique-se de que @expo/vector-icons está instalado

// Defina o tipo RootStackParamList conforme sua navegação
// Inclua todas as rotas possíveis que o seu Stack Navigator pode ter
type RootStackParamList = {
    Home: undefined; // Exemplo: se você pode voltar para Home
    Portfolio: undefined; // Exemplo: se você pode navegar para Portfolio
    History: undefined; // Exemplo: se você pode navegar para History
    Settings: undefined; // Esta tela
    // Adicione outras telas do seu Stack Navigator aqui, como 'AddAsset', 'Login', etc.
};

// Defina o tipo SettingsScreenNavigationProp
type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const { signOut, user } = useContext(AuthContext); // user é usado para verificar a chave de armazenamento
    const { resetPortfolioData } = useContext(PortfolioContext); // Obtenha resetPortfolioData do PortfolioContext

    const handleClearAllData = async () => {
        Alert.alert(
            "Limpar Dados do Portfólio", // Título mais específico
            "Tem certeza que deseja limpar **TODOS** os seus dados de ativos e eventos do portfólio? Esta ação é irreversível e se aplica apenas aos dados do seu usuário atual.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        try {
                            await resetPortfolioData(); // Chame a função do PortfolioContext para limpar e recarregar
                            Alert.alert("Sucesso", "Seus dados de portfólio foram limpos com sucesso.");
                        } catch (error) {
                            console.error("Erro ao limpar dados do portfólio:", error);
                            Alert.alert("Erro", "Não foi possível limpar os dados do portfólio.");
                        }
                    }
                }
            ]
        );
    };

    // Função para deslogar o usuário
    const handleSignOut = () => {
        Alert.alert(
            "Sair da Conta",
            "Tem certeza que deseja sair da sua conta?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Confirmar",
                    onPress: () => {
                        if (signOut) {
                            signOut(); // Chama a função signOut do AuthContext
                            // O AppNavigator deve lidar com o redirecionamento para a tela de login
                        } else {
                            console.warn("Função signOut não disponível no AuthContext.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Cabeçalho com botão de voltar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.title}>Ajustes</Text>
            </View>

            <View style={styles.optionContainer}>
                {/* Opção Notificações */}
                <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert("Em Breve", "As opções de notificação estão em desenvolvimento.")}>
                    <Ionicons name="notifications-outline" size={24} color="#FFD700" style={styles.optionIcon} />
                    <Text style={styles.optionText}>Notificações</Text>
                </TouchableOpacity>

                {/* Opção Segurança */}
                <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert("Em Breve", "As configurações de segurança estão em desenvolvimento.")}>
                    <Ionicons name="lock-closed-outline" size={24} color="#FFD700" style={styles.optionIcon} />
                    <Text style={styles.optionText}>Segurança</Text>
                </TouchableOpacity>

                {/* Opção Tema */}
                <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert("Em Breve", "A opção de tema (claro/escuro) está em desenvolvimento.")}>
                    <Ionicons name="bulb-outline" size={24} color="#FFD700" style={styles.optionIcon} />
                    <Text style={styles.optionText}>Tema (Claro/Escuro)</Text>
                </TouchableOpacity>

                {/* Opção Sobre */}
                <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert("Em Breve", "A opção de Sobre está em desenvolvimento.")}>
                    <Ionicons name="information-circle-outline" size={24} color="#FFD700" style={styles.optionIcon} />
                    <Text style={styles.optionText}>Sobre o Aplicativo</Text>
                </TouchableOpacity>

                {/* Opção Limpar Dados do Portfólio */}
                {/* Esta opção agora usa resetPortfolioData do PortfolioContext */}
                <TouchableOpacity style={[styles.optionButton, styles.lastOptionButton]} onPress={handleClearAllData}>
                    <Ionicons name="trash-outline" size={24} color="#FF6347" style={styles.optionIcon} />
                    <Text style={[styles.optionText, styles.destructiveText]}>Limpar Dados do Portfólio</Text>
                </TouchableOpacity>
            </View>

            {/* Botão Sair da Conta (Logout) - Separado para destaque */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={24} color="#FFF" style={styles.optionIcon} />
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E293B', // Fundo azul escuro
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 0, // Ajuste para Android para não cobrir a status bar
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        paddingRight: 15,
        paddingVertical: 5, // Aumenta a área de toque
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    optionContainer: {
        backgroundColor: '#2D3A4B', // Cartão de opções com fundo um pouco mais claro que o container
        borderRadius: 10,
        overflow: 'hidden', // Garante que o border radius funcione nas bordas dos itens
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18, // Aumenta o padding vertical
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#3A4C63', // Cor da linha divisória
    },
    lastOptionButton: {
        borderBottomWidth: 0, // Remove a linha do último item dentro do container
    },
    optionIcon: {
        marginRight: 15,
    },
    optionText: {
        color: '#FFF',
        fontSize: 17,
        flex: 1, // Faz o texto ocupar o espaço restante
    },
    destructiveText: {
        color: '#FF6347', // Vermelho para ações destrutivas
    },
    logoutButton: {
        backgroundColor: '#FF6347', // Botão de logout com cor de destaque (vermelho)
        borderRadius: 10,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10, // Espaço entre o ícone e o texto
    },
});

export default SettingsScreen;