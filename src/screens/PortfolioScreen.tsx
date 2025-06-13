// src/screens/PortfolioScreen.tsx

import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Dimensions,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Alert, // Importar Alert para confirmação de remoção
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../../App"; // Ajuste o caminho conforme sua estrutura
import { PortfolioContext, InvestmentAsset } from '../context/PortfolioContext'; // Importa PortfolioContext e InvestmentAsset

const { width, height } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 90 : 60;

// --- Interfaces e Tipos ---
// InvestmentAsset já vem do PortfolioContext.tsx

export interface InvestmentCategory {
    id: string;
    name: string;
    assets: InvestmentAsset[];
}

export interface AllocationData {
    id: string;
    name: string;
    value: number;
    percentage: number;
    color: string;
    legendFontColor?: string;
    legendFontSize?: number;
}

// --- Funções Utilitárias ---

export const groupAssetsByCategory = (assets: InvestmentAsset[]): InvestmentCategory[] => {
    const categoryDisplayNames: { [key: string]: string } = {
        fixedIncome: 'Renda Fixa',
        stocks: 'Ações',
        funds: 'Fundos de Investimento',
        others: 'Outros',
    };

    const categorizedMap: { [key: string]: InvestmentCategory } = {
        fixedIncome: { id: 'fixed-income', name: 'Renda Fixa', assets: [] },
        stocks: { id: 'stocks', name: 'Ações', assets: [] },
        funds: { id: 'funds', name: 'Fundos de Investimento', assets: [] },
        others: { id: 'others', name: 'Outros', assets: [] },
    };

    assets.forEach(asset => {
        switch (asset.type) {
            case 'fixedIncome':
                categorizedMap.fixedIncome.assets.push(asset);
                break;
            case 'stocks':
                categorizedMap.stocks.assets.push(asset);
                break;
            case 'funds':
                categorizedMap.funds.assets.push(asset);
                break;
            case 'others':
                categorizedMap.others.assets.push(asset);
                break;
            default:
                console.warn(`[groupAssetsByCategory] Tipo de ativo desconhecido para ${asset.name}: '${asset.type}'. Adicionando a 'Outros'.`);
                categorizedMap.others.assets.push(asset);
                break;
        }
    });

    const orderedCategories = [
        categorizedMap.fixedIncome,
        categorizedMap.stocks,
        categorizedMap.funds,
        categorizedMap.others,
    ];

    return orderedCategories.filter(cat => cat.assets.length > 0);
};

const calculatePortfolioSummary = (data: InvestmentCategory[]) => {
    let totalValue = 0;
    let totalDailyChange = 0;

    data.forEach((category) => {
        category.assets.forEach((asset) => {
            totalValue += asset.value;
            totalDailyChange += asset.dailyChange;
        });
    });

    const previousTotalValue = totalValue - totalDailyChange;
    const totalDailyChangePercentage =
        previousTotalValue !== 0 ? (totalDailyChange / previousTotalValue) * 100 : 0;

    return { totalValue, totalDailyChange, totalDailyChangePercentage };
};

const calculateAllocationData = (
    data: InvestmentCategory[],
    totalValue: number
): AllocationData[] => {
    const colors = [
        "#FFD700", // Gold - Renda Fixa
        "#4CAF50", // Green - Ações
        "#007BFF", // Blue - Fundos
        "#D3D3D3", // Light Gray - Outros
        "#FF6384", "#36A2EB", "#A020F0", "#FF4500", "#20B2AA", "#DDA0DD", "#8A2BE2", "#ADFF2F", "#DC143C",
    ];

    if (totalValue === 0) {
        return [];
    }

    const activeCategories = data.filter(category =>
        category.assets.reduce((sum, asset) => sum + asset.value, 0) > 0
    );

    return activeCategories.map((category, index) => {
        const categoryValue = category.assets.reduce(
            (sum, asset) => sum + asset.value,
            0
        );
        return {
            id: category.id,
            name: category.name,
            value: categoryValue,
            percentage: (categoryValue / totalValue) * 100,
            color: colors[index % colors.length],
        };
    });
};

type PortfolioScreenNavigationProp = NavigationProp<
    RootStackParamList,
    "HomeTabs"
>;

// --- Componente Principal ---
const PortfolioScreen = () => {
    const navigation = useNavigation<PortfolioScreenNavigationProp>();
    // IMPORTAÇÃO CHAVE: removeAsset do PortfolioContext
    const { assets, loadAssets, removeAsset, isLoading: isLoadingAssets } = useContext(PortfolioContext);

    const [showBalance, setShowBalance] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadAssets();
        }, [loadAssets])
    );

    // --- Cálculos Memoizados ---
    const categorizedAssets = useMemo(() => {
        return groupAssetsByCategory(assets);
    }, [assets]);

    const portfolioSummary = useMemo(() => {
        return calculatePortfolioSummary(categorizedAssets);
    }, [categorizedAssets]);

    const allocationData = useMemo(() => {
        return calculateAllocationData(categorizedAssets, portfolioSummary.totalValue);
    }, [categorizedAssets, portfolioSummary.totalValue]);

    const toggleShowBalance = () => setShowBalance(!showBalance);

    // Funções de formatação
    const formatCurrency = useCallback((value: number) =>
        value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }), []);

    const formatPercentage = useCallback((value: number) =>
        value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }), []);

    // Função para confirmar e remover ativo
    const handleRemoveAsset = useCallback((assetId: string, assetName: string) => {
        Alert.alert(
            "Confirmar Remoção",
            `Tem certeza que deseja remover "${assetName}" do seu portfólio?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Remover",
                    onPress: async () => {
                        await removeAsset(assetId);
                        // O loadAssets já é disparado pelo useFocusEffect ou pelo useEffect global no Context,
                        // mas para garantir uma atualização rápida na tela atual, podemos chamar aqui.
                        // No entanto, como o `removeAsset` já atualiza o estado `assets` diretamente no Context,
                        // a UI deve reagir automaticamente.
                        // loadAssets(); // Pode ser opcional dependendo de como o Context gerencia a atualização.
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    }, [removeAsset]);


    // --- Tela de Carregamento ---
    if (isLoadingAssets) {
        return (
            <LinearGradient
                colors={["#002B5B", "#001D40"]}
                style={styles.gradientBackground}
            >
                <SafeAreaView style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.loadingText}>Carregando sua carteira...</Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // --- Renderização Principal ---
    return (
        <LinearGradient
            colors={["#002B5B", "#001D40"]}
            style={styles.gradientBackground}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Carteira</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("AddAsset")}
                            style={styles.addAssetButton}
                        >
                            <Ionicons
                                name="add-circle-outline"
                                size={width * 0.08}
                                color="#FFD700"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Resumo do Patrimônio */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryLabel}>Patrimônio Total</Text>
                            <TouchableOpacity onPress={toggleShowBalance}>
                                <Ionicons
                                    name={showBalance ? "eye-outline" : "eye-off-outline"}
                                    size={width * 0.06}
                                    color="#E0E0E0"
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.totalValue}>
                            {showBalance
                                ? `R$ ${formatCurrency(portfolioSummary.totalValue)}`
                                : "••••••"}
                        </Text>
                        <View style={styles.dailyPerformanceContainer}>
                            <Ionicons
                                name={
                                    portfolioSummary.totalDailyChange >= 0
                                        ? "arrow-up-circle-outline"
                                        : "arrow-down-circle-outline"
                                }
                                size={width * 0.05}
                                color={
                                    portfolioSummary.totalDailyChange >= 0 ? "#4CAF50" : "#F44336"
                                }
                            />
                            <Text
                                style={[
                                    styles.dailyPerformanceText,
                                    {
                                        color:
                                            portfolioSummary.totalDailyChange >= 0
                                                ? "#4CAF50"
                                                : "#F44336",
                                    },
                                ]}
                            >
                                {showBalance
                                    ? `${
                                          portfolioSummary.totalDailyChange >= 0 ? "+" : ""
                                      }${formatCurrency(
                                          portfolioSummary.totalDailyChange
                                      )} (${formatPercentage(
                                          portfolioSummary.totalDailyChangePercentage
                                      )}%) hoje`
                                    : "••••••"}
                            </Text>
                        </View>
                    </View>

                    {/* Gráfico de Alocação */}
                    {portfolioSummary.totalValue > 0 && showBalance ? (
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Alocação de Ativos</Text>
                            <View style={styles.pieChartWrapper}>
                                <PieChart
                                    data={allocationData.map((item) => ({
                                        name: item.name,
                                        population: item.value,
                                        color: item.color,
                                        legendFontColor: "#34495E",
                                        legendFontSize: width * 0.035,
                                    }))}
                                    width={width * 0.7}
                                    height={height * 0.25}
                                    chartConfig={{
                                        backgroundColor: "transparent",
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: { borderRadius: 16 },
                                    }}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft={(width * 0.175).toString()}
                                    hasLegend={false}
                                    absolute
                                />
                            </View>
                            {/* Legenda Customizada */}
                            <View style={styles.customLegendContainer}>
                                {allocationData.map((item) => (
                                    <View key={item.id} style={styles.legendItem}>
                                        <View
                                            style={[
                                                styles.legendColorBox,
                                                { backgroundColor: item.color },
                                            ]}
                                        />
                                        <Text style={styles.legendText}>
                                            {`${item.name}: R$ ${formatCurrency(item.value)} (${formatPercentage(item.percentage)}%)`}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Alocação de Ativos</Text>
                            <View style={styles.hiddenContentPlaceholder}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={width * 0.1}
                                    color="#A0A0A0"
                                />
                                <Text style={styles.hiddenContentText}>
                                    {portfolioSummary.totalValue === 0
                                        ? "Nenhum ativo adicionado ainda."
                                        : "Informações de alocação ocultas"}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Lista de Ativos por Categoria */}
                    {categorizedAssets.length > 0 ? (
                        categorizedAssets.map((category) => (
                            <View key={category.id} style={styles.categoryContainer}>
                                <Text style={styles.categoryTitle}>{category.name}</Text>
                                {category.assets.map((asset) => (
                                    <TouchableOpacity
                                        key={asset.id}
                                        style={styles.assetItem}
                                        onPress={() => console.log(`Clicou em ${asset.name}`)}
                                    >
                                        <View style={styles.assetDetails}>
                                            <Text style={styles.assetName}>{asset.name}</Text>
                                            <Text style={styles.assetValue}>
                                                {showBalance
                                                    ? `R$ ${formatCurrency(asset.value)}`
                                                    : "••••"}
                                            </Text>
                                        </View>
                                        <View style={styles.assetPerformance}>
                                            <Ionicons
                                                name={
                                                    asset.dailyChange >= 0
                                                        ? "arrow-up-outline"
                                                        : "arrow-down-outline"
                                                }
                                                size={width * 0.04}
                                                color={asset.dailyChange >= 0 ? "#4CAF50" : "#F44336"}
                                            />
                                            <Text
                                                style={[
                                                    styles.assetPerformanceText,
                                                    {
                                                        color:
                                                            asset.dailyChange >= 0 ? "#4CAF50" : "#F44336",
                                                    },
                                                ]}
                                            >
                                                {showBalance
                                                    ? `${asset.dailyChange >= 0 ? "+" : ""}${formatCurrency(
                                                          asset.dailyChange
                                                      )} (${formatPercentage(
                                                          asset.dailyChangePercentage
                                                      )}%)`
                                                    : "••••"}
                                            </Text>
                                        </View>
                                        {/* Botão de Remover Ativo */}
                                        <TouchableOpacity
                                            onPress={() => handleRemoveAsset(asset.id, asset.name)}
                                            style={styles.removeButton}
                                        >
                                            <Ionicons name="trash-outline" size={width * 0.06} color="#F44336" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))
                    ) : (
                        <View style={styles.noAssetsContainer}>
                            <Ionicons name="cash-outline" size={width * 0.15} color="#E0E0E0" />
                            <Text style={styles.noAssetsText}>
                                Sua carteira está vazia. Adicione seus primeiros ativos!
                            </Text>
                            <TouchableOpacity
                                style={styles.addFirstAssetButton}
                                onPress={() => navigation.navigate("AddAsset")}
                            >
                                <Text style={styles.addFirstAssetButtonText}>Adicionar Ativo</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

// --- Estilos ---
const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: width * 0.05,
        paddingTop: Platform.OS === "android" ? 50 : 70,
        paddingBottom: TAB_BAR_HEIGHT + height * 0.02,
        alignItems: "center",
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
    header: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: height * 0.03,
    },
    title: {
        fontSize: width * 0.09,
        fontWeight: "900",
        color: "#FFFFFF",
    },
    addAssetButton: {
        padding: 5,
    },
    summaryCard: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 15,
        padding: width * 0.05,
        width: "90%",
        marginBottom: height * 0.03,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
    },
    summaryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: height * 0.01,
    },
    summaryLabel: {
        fontSize: width * 0.045,
        color: "#E0E0E0",
        fontWeight: "500",
    },
    totalValue: {
        fontSize: width * 0.09,
        fontWeight: "900",
        color: "#FFFFFF",
        marginBottom: height * 0.01,
    },
    dailyPerformanceContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dailyPerformanceText: {
        fontSize: width * 0.045,
        fontWeight: "bold",
        marginLeft: width * 0.015,
    },
    chartContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: width * 0.05,
        width: "90%",
        marginBottom: height * 0.03,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        alignItems: "center",
    },
    chartTitle: {
        fontSize: width * 0.05,
        fontWeight: "700",
        color: "#002B5B",
        marginBottom: height * 0.02,
        textAlign: "center",
    },
    pieChartWrapper: {
        alignItems: "center",
        marginVertical: 10,
    },
    hiddenContentPlaceholder: {
        height: height * 0.25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F8FF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#EBF4F8",
        width: '100%',
    },
    hiddenContentText: {
        fontSize: width * 0.04,
        color: "#A0A0A0",
        marginTop: height * 0.01,
        textAlign: 'center',
    },
    customLegendContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        marginTop: height * 0.02,
        width: '100%',
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.008,
    },
    legendColorBox: {
        width: width * 0.04,
        height: width * 0.04,
        borderRadius: 4,
        marginRight: width * 0.02,
    },
    legendText: {
        fontSize: width * 0.04,
        color: "#34495E",
        flexShrink: 1,
    },
    categoryContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: width * 0.05,
        width: "90%",
        marginBottom: height * 0.03,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    categoryTitle: {
        fontSize: width * 0.055,
        fontWeight: "700",
        color: "#002B5B",
        marginBottom: height * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: "#E8EDF2",
        paddingBottom: height * 0.015,
    },
    assetItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: height * 0.015,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    assetDetails: {
        flex: 1,
    },
    assetName: {
        fontSize: width * 0.045,
        fontWeight: "600",
        color: "#34495E",
    },
    assetValue: {
        fontSize: width * 0.04,
        color: "#5D6D7E",
        marginTop: 2,
    },
    assetPerformance: {
        flexDirection: "row",
        alignItems: "center",
    },
    assetPerformanceText: {
        fontSize: width * 0.04,
        fontWeight: "600",
        marginLeft: width * 0.01,
    },
    // NOVO ESTILO: Botão de remover
    removeButton: {
        marginLeft: width * 0.03, // Espaçamento à esquerda
        padding: 5, // Área de toque maior
    },
    noAssetsContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: width * 0.05,
        width: "90%",
        marginBottom: height * 0.03,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        alignItems: "center",
        justifyContent: "center",
        minHeight: height * 0.3,
    },
    noAssetsText: {
        fontSize: width * 0.045,
        color: "#A0A0A0",
        textAlign: "center",
        marginTop: height * 0.02,
        marginBottom: height * 0.03,
    },
    addFirstAssetButton: {
        backgroundColor: "#FFD700",
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.05,
        borderRadius: 10,
        marginTop: height * 0.01,
    },
    addFirstAssetButtonText: {
        fontSize: width * 0.045,
        fontWeight: "bold",
        color: "#002B5B",
    },
});

export default PortfolioScreen;