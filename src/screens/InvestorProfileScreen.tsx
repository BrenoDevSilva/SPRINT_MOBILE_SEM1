// src/screens/InvestorProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, Dimensions, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Obter as dimensões da tela para responsividade
const { width, height } = Dimensions.get('window');

// Definição das perguntas do perfil de investidor
type InvestorQuestion = {
    id: string;
    question: string;
    options: { label: string; value: string }[];
};

const investorQuestions: InvestorQuestion[] = [
    {
        id: 'experience',
        question: 'Qual o seu nível de experiência com investimentos?',
        options: [
            { label: 'Nenhuma experiência', value: 'none' },
            { label: 'Alguma experiência', value: 'some' },
            { label: 'Muita experiência', value: 'a_lot' },
        ],
    },
    {
        id: 'objective',
        question: 'Qual é o seu principal objetivo ao investir?',
        options: [
            { label: 'Preservar capital', value: 'preserve' },
            { label: 'Obter renda', value: 'income' },
            { label: 'Crescimento agressivo', value: 'growth' },
        ],
    },
    {
        id: 'risk',
        question: 'Como você se sente em relação ao risco?',
        options: [
            { label: 'Evito riscos', value: 'avoid' },
            { label: 'Aceito algum risco', value: 'some' },
            { label: 'Busco altos retornos', value: 'high' },
        ],
    },
    {
        id: 'investmentHorizon',
        question: 'Qual o seu horizonte de investimento?',
        options: [
            { label: 'Curto prazo (até 2 anos)', value: 'shortTerm' },
            { label: 'Médio prazo (2 a 5 anos)', value: 'mediumTerm' },
            { label: 'Longo prazo (acima de 5 anos)', value: 'longTerm' },
        ],
    },
    {
        id: 'availableAmount',
        question: 'Qual valor aproximado você tem disponível para investir inicialmente?',
        options: [
            { label: 'Até R$ 1.000', value: 'upTo1000' },
            { label: 'R$ 1.001 a R$ 5.000', value: '1001To5000' },
            { label: 'R$ 5.001 a R$ 20.000', value: '5001To20000' },
            { label: 'Acima de R$ 20.000', value: 'over20000' },
        ],
    },
    {
        id: 'esgInterest',
        question: 'Você se interessa por investimentos com foco em sustentabilidade (ESG)?',
        options: [
            { label: 'Sim', value: 'yes' },
            { label: 'Não', value: 'no' },
        ],
    },
    {
        id: 'monthlyIncome',
        question: 'Qual a sua renda mensal aproximada?',
        options: [
            { label: 'Até R$ 2.000', value: 'upTo2000' },
            { label: 'R$ 2.001 a R$ 5.000', value: '2001To5000' },
            { label: 'R$ 5.001 a R$ 10.000', value: '5001To10000' },
            { label: 'Acima de R$ 10.000', value: 'over10000' },
        ],
    },
    {
        id: 'financialSituation',
        question: 'Qual a sua situação financeira atual?',
        options: [
            { label: 'Estável', value: 'stable' },
            { label: 'Confortável', value: 'comfortable' },
            { label: 'Precária', value: 'precarious' },
        ],
    },
];

// Chave para armazenar o perfil do investidor no AsyncStorage
const INVESTOR_PROFILE_KEY = '@datarium_investor_profile';

// Altura da tab bar definida em HomeTabs.jsx
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 60;

export default function InvestorProfileScreen() {
    const navigation = useNavigation();
    const [profileAnswers, setProfileAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    // Sempre inicializa currentStep em 0 para começar na primeira pergunta
    const [currentStep, setCurrentStep] = useState(0); 

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const storedProfile = await AsyncStorage.getItem(INVESTOR_PROFILE_KEY);
                if (storedProfile) {
                    const parsedProfile = JSON.parse(storedProfile);
                    setProfileAnswers(parsedProfile);
                    // REMOVIDO: Lógica para definir currentStep para a última pergunta.
                    // Agora, ele sempre começará em 0 (primeira pergunta).
                }
            } catch (error) {
                console.error('Erro ao carregar perfil do investidor:', error);
                Alert.alert('Erro', 'Não foi possível carregar seu perfil.');
            } finally {
                setIsLoading(false);
            }
        };

        // Adiciona um listener para quando a tela for focada.
        // Isso garante que, ao navegar para a tela, ela seja redefinida para a primeira pergunta.
        const unsubscribe = navigation.addListener('focus', () => {
            setCurrentStep(0); // Volta para a primeira pergunta ao focar na tela
            // Opcional: recarregar respostas se quiser garantir que estão atualizadas
            // loadProfile(); 
        });

        loadProfile(); // Carrega o perfil na montagem inicial
        
        return unsubscribe; // Limpa o listener ao desmontar o componente
    }, [navigation]); // Dependência de navigation para o listener

    const handleSelectOption = (questionId: string, optionValue: string) => {
        setProfileAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: optionValue,
        }));
    };

    const handleSaveProfile = async () => {
        const allQuestionsAnswered = investorQuestions.every(
            (question) => profileAnswers[question.id] !== undefined
        );

        if (!allQuestionsAnswered) {
            Alert.alert('Atenção', 'Por favor, responda todas as perguntas para salvar seu perfil.');
            return;
        }

        try {
            await AsyncStorage.setItem(INVESTOR_PROFILE_KEY, JSON.stringify(profileAnswers));
            Alert.alert('Sucesso', 'Seu perfil de investidor foi salvo com sucesso!', [
                { text: 'OK', onPress: () => {
                    navigation.navigate('HomeTabs', { screen: 'Dashboard' }); 
                }}
            ]);
        } catch (error) {
            console.error('Erro ao salvar o perfil do investidor:', error);
            Alert.alert('Erro', 'Não foi possível salvar seu perfil. Tente novamente.');
        }
    };

    const handleNext = () => {
        // Verifica se a pergunta atual foi respondida antes de avançar
        if (profileAnswers[currentQuestion.id] === undefined) {
            Alert.alert('Atenção', 'Por favor, selecione uma opção antes de prosseguir.');
            return;
        }

        if (currentStep < investorQuestions.length - 1) {
            setCurrentStep(prevStep => prevStep + 1);
        } else {
            handleSaveProfile();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prevStep => prevStep - 1);
        }
    };

    const currentQuestion = investorQuestions[currentStep];

    if (isLoading) {
        return (
            <LinearGradient
                colors={['#002B5B', '#001D40']}
                style={styles.gradientBackground}
            >
                <SafeAreaView style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Carregando perfil...</Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#002B5B', '#001D40']}
            style={styles.gradientBackground}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
                    <Text style={styles.title}>Meu Perfil de Investidor</Text>
                    <View style={styles.titleUnderline} />
                    <Text style={styles.subtitle}>
                        Responda às perguntas abaixo para que possamos entender melhor suas necessidades e objetivos de investimento.
                    </Text>

                    {/* Renderiza apenas a pergunta atual */}
                    <View key={currentQuestion.id} style={styles.questionSection}>
                        <Text style={styles.questionText}>{currentQuestion.question}</Text>
                        <View style={styles.optionsContainer}>
                            {currentQuestion.options.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionCard,
                                        profileAnswers[currentQuestion.id] === option.value && styles.selectedOptionCard,
                                    ]}
                                    onPress={() => handleSelectOption(currentQuestion.id, option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            profileAnswers[currentQuestion.id] === option.value && styles.selectedOptionText,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Botões de navegação e salvar */}
                    <View style={styles.buttonContainer}>
                        {currentStep > 0 && ( // Mostra "Voltar" se não for a primeira pergunta
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBack}
                            >
                                <Text style={styles.backButtonText}>Voltar</Text>
                            </TouchableOpacity>
                        )}

                        {currentStep < investorQuestions.length - 1 ? ( // Se não for a última pergunta, mostra "Próximo"
                            <TouchableOpacity
                                style={[styles.nextButton, profileAnswers[currentQuestion.id] === undefined && styles.disabledNextButton]}
                                onPress={handleNext}
                                disabled={profileAnswers[currentQuestion.id] === undefined} // Desabilita se a pergunta atual não foi respondida
                            >
                                <Text style={styles.nextButtonText}>Próximo</Text>
                            </TouchableOpacity>
                        ) : ( // Se for a última pergunta, mostra "Salvar Perfil"
                            <TouchableOpacity
                                style={[styles.saveButton, !Object.keys(profileAnswers).length && styles.disabledButton]}
                                onPress={handleSaveProfile}
                                disabled={!Object.keys(profileAnswers).length || !investorQuestions.every(q => profileAnswers[q.id] !== undefined)}
                            >
                                <Ionicons name="save-outline" size={width * 0.05} color="#FFFFFF" style={styles.saveButtonIcon} />
                                <Text style={styles.saveButtonText}>Salvar Perfil</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    gradientBackground: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: width * 0.05,
        paddingTop: Platform.OS === 'android' ? 50 : 70,
        paddingBottom: TAB_BAR_HEIGHT + (height * 0.03),
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: width * 0.05,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    title: {
        fontSize: width * 0.09,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 3,
    },
    titleUnderline: {
        width: '80%',
        height: 3,
        backgroundColor: '#FFD700',
        marginBottom: 30,
        borderRadius: 2,
    },
    subtitle: {
        fontSize: width * 0.045,
        color: '#E0E0E0',
        marginBottom: height * 0.03,
        textAlign: 'center',
        lineHeight: width * 0.06,
        paddingHorizontal: width * 0.02,
        fontWeight: '400',
    },
    questionSection: {
        marginBottom: height * 0.03,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: width * 0.05,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        borderColor: '#E8EDF2',
        borderWidth: 1,
        width: '95%',
        maxWidth: 400,
    },
    questionText: {
        fontSize: width * 0.048,
        fontWeight: '700',
        color: '#34495E',
        marginBottom: height * 0.015,
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    optionCard: {
        backgroundColor: '#F7F9FC',
        borderRadius: 10,
        paddingVertical: height * 0.018,
        paddingHorizontal: width * 0.05,
        marginVertical: height * 0.009,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DCE4EB',
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedOptionCard: {
        borderColor: '#0056B3',
        backgroundColor: '#E6F0FF',
        shadowColor: '#0056B3',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    optionText: {
        fontSize: width * 0.042,
        color: '#5D6D7E',
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedOptionText: {
        color: '#003366',
        fontWeight: '700',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '95%',
        maxWidth: 400,
        marginTop: height * 0.02,
        marginBottom: height * 0.03,
    },
    saveButton: {
        backgroundColor: '#FFD700',
        paddingVertical: height * 0.02,
        paddingHorizontal: width * 0.07,
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 5,
        shadowColor: '#CCAA00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonIcon: {
        marginRight: 8,
    },
    saveButtonText: {
        color: '#002B5B',
        fontSize: width * 0.048,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: '#AAAAAA',
        shadowOpacity: 0,
        elevation: 0,
    },
    nextButton: {
        backgroundColor: '#0056B3',
        paddingVertical: height * 0.02,
        paddingHorizontal: width * 0.07,
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 5,
        shadowColor: '#003366',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.048,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    disabledNextButton: {
        backgroundColor: '#6A9BC2',
        shadowOpacity: 0,
        elevation: 0,
    },
    backButton: {
        backgroundColor: '#666666',
        paddingVertical: height * 0.02,
        paddingHorizontal: width * 0.07,
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 5,
        shadowColor: '#333333',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.048,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});