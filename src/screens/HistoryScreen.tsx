// src/screens/HistoryScreen.tsx

import React, { useContext, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioContext, PortfolioEvent } from '../context/PortfolioContext'; // Ajuste o caminho

const { width, height } = Dimensions.get('window');

const HistoryScreen = () => {
    const { portfolioEvents, isLoading: isLoadingPortfolio } = useContext(PortfolioContext);

    // Função de formatação para datas e moedas
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const formatCurrency = useCallback((value: number) =>
        value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }), []);

    // Ordena os eventos por data (mais recente primeiro)
    const sortedEvents = useMemo(() => {
        return [...portfolioEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [portfolioEvents]);

    if (isLoadingPortfolio) {
        return (
            <LinearGradient
                colors={["#002B5B", "#001D40"]}
                style={styles.gradientBackground}
            >
                <SafeAreaView style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.loadingText}>Carregando histórico de eventos...</Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={["#002B5B", "#001D40"]}
            style={styles.gradientBackground}
        >
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.headerTitle}>Histórico de Eventos</Text>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {sortedEvents.length === 0 ? (
                        <View style={styles.noHistoryContainer}>
                            <Ionicons name="document-text-outline" size={width * 0.15} color="#E0E0E0" />
                            <Text style={styles.noHistoryText}>
                                Nenhum evento de portfólio registrado ainda.
                            </Text>
                        </View>
                    ) : (
                        sortedEvents.map((event) => (
                            <View key={event.id} style={styles.eventItem}>
                                <Ionicons
                                    name={event.eventType === 'added' ? 'add-circle-outline' : 'remove-circle-outline'}
                                    size={width * 0.07}
                                    color={event.eventType === 'added' ? '#4CAF50' : '#F44336'}
                                    style={styles.eventIcon}
                                />
                                <View style={styles.eventDetails}>
                                    <Text style={styles.eventName}>
                                        Ativo "{event.assetName}" {event.eventType === 'added' ? 'adicionado' : 'removido'}.
                                    </Text>
                                    {event.valueAtEvent !== undefined && (
                                        <Text style={styles.eventValue}>
                                            Valor: R$ {formatCurrency(event.valueAtEvent)}
                                        </Text>
                                    )}
                                    <Text style={styles.eventDate}>
                                        {formatDate(event.date)}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? 50 : 70,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: width * 0.045,
        color: "#FFFFFF",
    },
    headerTitle: {
        fontSize: width * 0.09,
        fontWeight: "900",
        color: "#FFFFFF",
        textAlign: 'center',
        marginBottom: 20,
    },
    scrollContainer: {
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.05, // Ajuste conforme a altura da sua tab bar
    },
    eventItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: width * 0.04,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
    },
    eventIcon: {
        marginRight: width * 0.03,
    },
    eventDetails: {
        flex: 1,
    },
    eventName: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    eventValue: {
        fontSize: width * 0.038,
        color: '#E0E0E0',
        marginTop: 2,
    },
    eventDate: {
        fontSize: width * 0.03,
        color: '#A0A0A0',
        marginTop: 5,
    },
    noHistoryContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: width * 0.05,
        width: "100%",
        marginTop: height * 0.05,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        alignItems: "center",
        justifyContent: "center",
        minHeight: height * 0.3,
    },
    noHistoryText: {
        fontSize: width * 0.045,
        color: "#A0A0A0",
        textAlign: "center",
        marginTop: height * 0.02,
    },
});

export default HistoryScreen;