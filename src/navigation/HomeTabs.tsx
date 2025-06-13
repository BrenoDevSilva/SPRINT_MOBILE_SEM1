import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Platform, TouchableOpacity, View, Text, StyleSheet } from 'react-native'; // Importe StyleSheet também
import { LinearGradient } from 'expo-linear-gradient';

// Importe suas telas
import DashboardScreen from '../screens/DashboardScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import ExplanationScreen from '../screens/ExplanationScreen';
import HistoryScreen from '../screens/HistoryScreen';
import InvestorProfileScreen from '../screens/InvestorProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// Defina os labels para cada rota, para fácil acesso
const TAB_LABELS: { [key: string]: string } = {
    Dashboard: 'Início', // Um label mais curto para a tab bar
    Portfolio: 'Portfólio',
    Explanation: 'Explicação',
    History: 'Histórico',
    InvestorProfile: 'Perfil', // Rótulo mais conciso
    Settings: 'Ajustes', // Um label mais curto para a tab bar
};

export default function HomeTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // Oculta o cabeçalho padrão das telas
                tabBarStyle: { // Estilos para a barra de navegação (o contêiner)
                    position: 'absolute',
                    backgroundColor: 'transparent', // Torna o background transparente para o LinearGradient aparecer
                    borderTopWidth: 0,
                    elevation: 0,
                    height: Platform.OS === 'ios' ? 90 : 60, // Ajuste a altura para iOS para acomodar o safe area
                    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Adiciona padding inferior para iOS
                },
                // Remove tabBarIcon e tabBarLabelStyle daqui, pois serão tratados no custom tabBar
                tabBarActiveTintColor: '#FFD700', // Dourado
                tabBarInactiveTintColor: '#E0E0E0', // Branco
            })}
            // Renderiza o LinearGradient como o background da tab bar
            tabBar={props => (
                <LinearGradient
                    colors={['#002B5B', '#001D40']} // Cores do gradiente, as mesmas do Dashboard
                    style={styles.gradientTabBar} // Use um estilo para o gradiente
                >
                    <BottomTabNavigationContent {...props} />
                </LinearGradient>
            )}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: TAB_LABELS.Dashboard }} />
            <Tab.Screen name="Portfolio" component={PortfolioScreen} options={{ tabBarLabel: TAB_LABELS.Portfolio }} />
            <Tab.Screen name="Explanation" component={ExplanationScreen} options={{ tabBarLabel: TAB_LABELS.Explanation }} />
            <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: TAB_LABELS.History }} />
            <Tab.Screen name="InvestorProfile" component={InvestorProfileScreen} options={{ tabBarLabel: TAB_LABELS.InvestorProfile }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: TAB_LABELS.Settings }} />
        </Tab.Navigator>
    );
}

// Componente auxiliar para renderizar o conteúdo da tab bar dentro do LinearGradient
function BottomTabNavigationContent({ state, descriptors, navigation }: any) {
    return (
        <View style={styles.tabBarContentContainer}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label = TAB_LABELS[route.name] || route.name; // Usa o label do mapa ou o nome da rota
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                let iconName: keyof typeof Ionicons.glyphMap = 'information-circle-outline'; // Default icon

                if (route.name === 'Dashboard') {
                    iconName = isFocused ? 'home' : 'home-outline';
                } else if (route.name === 'Portfolio') {
                    iconName = isFocused ? 'wallet' : 'wallet-outline';
                } else if (route.name === 'Explanation') {
                    iconName = isFocused ? 'book' : 'book-outline';
                } else if (route.name === 'History') {
                    iconName = isFocused ? 'time' : 'time-outline';
                } else if (route.name === 'InvestorProfile') {
                    iconName = isFocused ? 'person' : 'person-outline';
                } else if (route.name === 'Settings') {
                    iconName = isFocused ? 'settings' : 'settings-outline';
                }

                // Definir a cor do ícone e do texto
                const iconColor = isFocused ? '#FFD700' : '#E0E0E0'; // Dourado para ativo, cinza claro para inativo
                const textColor = isFocused ? '#FFD700' : '#E0E0E0';

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel || label}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabItem}
                    >
                        {/* Agora, renderizamos o Ionicons diretamente aqui */}
                        <Ionicons name={iconName} size={24} color={iconColor} />
                        <Text style={[styles.tabLabel, { color: textColor }]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    gradientTabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 90 : 60,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        borderTopWidth: 0,
        elevation: 0,
    },
    tabBarContentContainer: {
        flexDirection: 'row',
        height: '100%',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'android' ? 5 : 0, // Ajuste para Android para centralizar melhor o conteúdo
    },
    tabLabel: {
        fontSize: width * 0.026,
        fontWeight: '600',
        marginTop: 4, // Espaçamento entre o ícone e o texto
    },
});