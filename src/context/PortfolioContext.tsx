// src/context/PortfolioContext.tsx

import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

import { AuthContext } from './AuthContext';

// --- Interfaces ---
export interface InvestmentAsset {
    id: string;
    name: string;
    type: 'fixedIncome' | 'stocks' | 'funds' | 'others';
    value: number;
    pricePerUnit?: number;
    dailyChange: number;
    dailyChangePercentage: number;
}

// --- NOVA INTERFACE para Eventos do Portfólio ---
export interface PortfolioEvent {
    id: string; // ID único do evento
    assetId: string; // ID do ativo envolvido
    assetName: string; // Nome do ativo no momento do evento
    eventType: 'added' | 'removed'; // Tipo de evento: ativo adicionado ou removido
    date: string; // Data e hora do evento (ex: ISO string 'YYYY-MM-DDTHH:mm:ssZ')
    valueAtEvent?: number; // Valor do ativo no momento do evento (opcional, mas útil)
}

// --- Interface do Contexto ---
export interface PortfolioContextType {
    assets: InvestmentAsset[];
    portfolioEvents: PortfolioEvent[]; // Adicionado: lista de eventos
    loadAssets: () => Promise<void>;
    addAsset: (newAssetData: Omit<InvestmentAsset, 'id' | 'dailyChange' | 'dailyChangePercentage'>) => Promise<void>;
    removeAsset: (assetId: string) => Promise<void>; // Adicionado: função para remover ativos e registrar evento
    isLoading: boolean;
    resetPortfolioData: () => Promise<void>; // <-- ADICIONADO: Nova função para resetar os dados
}

const defaultContextValue: PortfolioContextType = {
    assets: [],
    portfolioEvents: [], // Default para eventos
    loadAssets: async () => {},
    addAsset: async () => {},
    removeAsset: async () => {},
    isLoading: false,
    resetPortfolioData: async () => {}, // <-- ADICIONADO: Default para a nova função
};

export const PortfolioContext = createContext<PortfolioContextType>(defaultContextValue);

interface PortfolioProviderProps {
    children: ReactNode;
}

export const PortfolioProvider = ({ children }: PortfolioProviderProps) => {
    const { user, isLoadingAuth } = useContext(AuthContext);
    const [assets, setAssets] = useState<InvestmentAsset[]>([]);
    const [portfolioEvents, setPortfolioEvents] = useState<PortfolioEvent[]>([]); // NOVO estado para eventos
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Função auxiliar para obter a chave de armazenamento específica do usuário para ativos
    const getUserAssetsStorageKey = useCallback((userId: string) => {
        return `@portfolio_assets_user_${userId}`;
    }, []);

    // NOVO: Chave de armazenamento para eventos
    const getUserEventsStorageKey = useCallback((userId: string) => {
        return `@portfolio_events_user_${userId}`;
    }, []);

    // Função para carregar os ativos do AsyncStorage para o usuário atual
    const loadAssets = useCallback(async () => {
        if (!user?.id) {
            setAssets([]);
            // Não defina isLoading aqui, pois o carregamento de eventos pode ainda estar pendente
            return;
        }

        // isLoading é definido uma vez no useEffect principal para ambos os loads
        const userStorageKey = getUserAssetsStorageKey(user.id);
        try {
            const storedAssets = await AsyncStorage.getItem(userStorageKey);
            if (storedAssets) {
                const parsedAssets: InvestmentAsset[] = JSON.parse(storedAssets);
                setAssets(parsedAssets);
            } else {
                setAssets([]);
            }
        } catch (error) {
            console.error(`Erro ao carregar ativos para o usuário ${user.id} do AsyncStorage:`, error);
        }
    }, [user, getUserAssetsStorageKey]);

    // NOVO: Função para carregar eventos do AsyncStorage para o usuário atual
    const loadPortfolioEvents = useCallback(async () => {
        if (!user?.id) {
            setPortfolioEvents([]);
            return;
        }

        const userEventsKey = getUserEventsStorageKey(user.id);
        try {
            const storedEvents = await AsyncStorage.getItem(userEventsKey);
            if (storedEvents) {
                const parsedEvents: PortfolioEvent[] = JSON.parse(storedEvents);
                setPortfolioEvents(parsedEvents);
            } else {
                setPortfolioEvents([]);
            }
        } catch (error) {
            console.error(`Erro ao carregar eventos do portfólio para o usuário ${user.id}:`, error);
        }
    }, [user, getUserEventsStorageKey]);

    // NOVO: Função auxiliar para salvar eventos (usada por addAsset e removeAsset)
    const savePortfolioEvents = useCallback(async (eventsToSave: PortfolioEvent[]) => {
        if (!user?.id) return;
        const userEventsKey = getUserEventsStorageKey(user.id);
        try {
            await AsyncStorage.setItem(userEventsKey, JSON.stringify(eventsToSave));
        } catch (error) {
            console.error(`Erro ao salvar eventos do portfólio para o usuário ${user.id}:`, error);
        }
    }, [user, getUserEventsStorageKey]);

    // Função para adicionar um novo ativo e salvar no AsyncStorage para o usuário atual
    const addAsset = useCallback(async (newAssetData: Omit<InvestmentAsset, 'id' | 'dailyChange' | 'dailyChangePercentage'>) => {
        if (!user?.id) {
            console.error("Não é possível adicionar ativo: nenhum usuário logado.");
            return;
        }

        // Definir isLoading no início da operação de modificação
        setIsLoading(true);

        const newAssetId = uuid.v4().toString();
        const assetWithDefaults: InvestmentAsset = {
            id: newAssetId,
            ...newAssetData,
            dailyChange: 0.00,
            dailyChangePercentage: 0.00,
        };

        const updatedAssets = [...assets, assetWithDefaults];
        setAssets(updatedAssets); // Atualiza o estado da UI imediatamente

        const userAssetsStorageKey = getUserAssetsStorageKey(user.id);
        try {
            await AsyncStorage.setItem(userAssetsStorageKey, JSON.stringify(updatedAssets));
            console.log("Ativo adicionado e salvo com sucesso para o usuário", user.id, ":", assetWithDefaults.name);

            // REGISTRA O EVENTO 'ADDED'
            const newEvent: PortfolioEvent = {
                id: uuid.v4().toString(),
                assetId: newAssetId,
                assetName: assetWithDefaults.name,
                eventType: 'added',
                date: new Date().toISOString(), // Data e hora atual
                valueAtEvent: assetWithDefaults.value, // Registra o valor no momento da adição
            };
            const updatedEvents = [...portfolioEvents, newEvent];
            setPortfolioEvents(updatedEvents);
            await savePortfolioEvents(updatedEvents); // Salva os eventos
            console.log("Evento 'ativo adicionado' registrado:", newEvent.assetName);

        } catch (error) {
            console.error(`Erro ao salvar ativo/evento para o usuário ${user.id} no AsyncStorage:`, error);
        } finally {
            setIsLoading(false); // Finaliza o carregamento após as operações
        }
    }, [assets, portfolioEvents, user, getUserAssetsStorageKey, savePortfolioEvents]);

    // NOVO: Função para remover um ativo e registrar um evento 'removed'
    const removeAsset = useCallback(async (assetId: string) => {
        if (!user?.id) {
            console.error("Não é possível remover ativo: nenhum usuário logado.");
            return;
        }

        // Definir isLoading no início da operação de modificação
        setIsLoading(true);

        const assetToRemove = assets.find(asset => asset.id === assetId);
        if (!assetToRemove) {
            console.warn("Ativo não encontrado para remoção:", assetId);
            setIsLoading(false);
            return;
        }

        const updatedAssets = assets.filter(asset => asset.id !== assetId);
        setAssets(updatedAssets); // Atualiza o estado da UI imediatamente

        const userAssetsStorageKey = getUserAssetsStorageKey(user.id);
        try {
            await AsyncStorage.setItem(userAssetsStorageKey, JSON.stringify(updatedAssets));
            console.log("Ativo removido e salvo com sucesso para o usuário", user.id, ":", assetToRemove.name);

            // REGISTRA O EVENTO 'REMOVED'
            const newEvent: PortfolioEvent = {
                id: uuid.v4().toString(),
                assetId: assetToRemove.id,
                assetName: assetToRemove.name,
                eventType: 'removed',
                date: new Date().toISOString(), // Data e hora atual
                valueAtEvent: assetToRemove.value, // Registra o valor no momento da remoção
            };
            const updatedEvents = [...portfolioEvents, newEvent];
            setPortfolioEvents(updatedEvents);
            await savePortfolioEvents(updatedEvents); // Salva os eventos
            console.log("Evento 'ativo removido' registrado:", newEvent.assetName);

        } catch (error) {
            console.error(`Erro ao remover ativo/evento para o usuário ${user.id} no AsyncStorage:`, error);
        } finally {
            setIsLoading(false); // Finaliza o carregamento após as operações
        }
    }, [assets, portfolioEvents, user, getUserAssetsStorageKey, savePortfolioEvents]);

    // <-- ADICIONADO: Nova função para limpar e recarregar os dados do portfólio
    const resetPortfolioData = useCallback(async () => {
        setIsLoading(true);
        // Primeiro, limpa os estados para atualizar a UI imediatamente
        setAssets([]);
        setPortfolioEvents([]);

        // Em seguida, remove os itens específicos do usuário do AsyncStorage
        if (user?.id) {
            const userAssetsStorageKey = getUserAssetsStorageKey(user.id);
            const userEventsStorageKey = getUserEventsStorageKey(user.id);
            try {
                await AsyncStorage.removeItem(userAssetsStorageKey);
                await AsyncStorage.removeItem(userEventsStorageKey);
                console.log(`Dados do portfólio e eventos limpos para o usuário ${user.id} no AsyncStorage.`);
            } catch (error) {
                console.error(`Erro ao remover dados do portfólio para o usuário ${user.id} do AsyncStorage:`, error);
            }
        }
        // Finalmente, recarrega os dados (que agora estarão vazios se foram removidos)
        await loadAssets(); // Isso irá carregar [] se os dados foram removidos
        await loadPortfolioEvents(); // Isso irá carregar [] se os dados foram removidos
        setIsLoading(false);
    }, [user, getUserAssetsStorageKey, getUserEventsStorageKey, loadAssets, loadPortfolioEvents]); // Adicione as dependências necessárias


    // Efeito para carregar ativos E eventos sempre que o usuário muda OU quando o estado de autenticação termina de carregar.
    useEffect(() => {
        const fetchAllData = async () => {
            if (!isLoadingAuth) {
                if (user?.id) {
                    setIsLoading(true); // Começa a carregar para ambos
                    await loadAssets();
                    await loadPortfolioEvents();
                    setIsLoading(false); // Termina de carregar após ambos
                } else {
                    // Se não há usuário logado e autenticação terminou, limpa tudo
                    setAssets([]);
                    setPortfolioEvents([]);
                    setIsLoading(false);
                }
            }
        };
        fetchAllData();
    }, [user, isLoadingAuth, loadAssets, loadPortfolioEvents]);

    const contextValue = {
        assets,
        portfolioEvents, // Inclua no contexto
        loadAssets,
        addAsset,
        removeAsset, // Inclua no contexto
        isLoading,
        resetPortfolioData, // <-- ADICIONADO: Inclua a nova função no valor do contexto
    };

    return (
        <PortfolioContext.Provider value={contextValue}>
            {children}
        </PortfolioContext.Provider>
    );
};