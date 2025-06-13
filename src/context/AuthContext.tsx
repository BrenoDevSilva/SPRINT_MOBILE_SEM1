// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

// Interfaces
export interface User {
    id: string; // ID único do usuário
    username: string;
    password?: string; // <-- Adicione a senha aqui (opcional para o mock, mas necessária para a lógica)
}

export interface AuthContextType {
    user: User | null;
    authToken: string | null;
    signIn: (username: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    signUp: (username: string, password: string) => Promise<boolean>;
    isLoadingAuth: boolean;
}

const AUTH_STORAGE_KEY = '@auth_data';
const USERS_STORAGE_KEY = '@app_users'; // Para armazenar todos os usuários registrados

export const AuthContext = createContext<AuthContextType>({
    user: null,
    authToken: null,
    signIn: async () => false,
    signOut: async () => {},
    signUp: async () => false,
    isLoadingAuth: true,
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedAuthData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
                if (storedAuthData) {
                    const { storedUser, storedToken } = JSON.parse(storedAuthData);
                    setUser(storedUser);
                    setAuthToken(storedToken);
                }
            } catch (error) {
                console.error("Erro ao carregar dados de autenticação do storage", error);
            } finally {
                setIsLoadingAuth(false);
            }
        };
        loadAuthData();
    }, []);

    const getAllRegisteredUsers = useCallback(async (): Promise<User[]> => {
        try {
            const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
            return storedUsers ? JSON.parse(storedUsers) : [];
        } catch (error) {
            console.error("Erro ao carregar usuários registrados:", error);
            return [];
        }
    }, []);

    const saveAllRegisteredUsers = useCallback(async (users: User[]) => {
        try {
            await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (error) {
            console.error("Erro ao salvar usuários registrados:", error);
        }
    }, []);

    const signIn = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
        setIsLoadingAuth(true);
        try {
            const registeredUsers = await getAllRegisteredUsers();
            // Agora, verificamos a senha armazenada para o usuário
            const foundUser = registeredUsers.find(u => u.username === usernameInput && u.password === passwordInput);

            await new Promise(resolve => setTimeout(resolve, 1000));

            if (foundUser) {
                const newToken = `mock-auth-token-${foundUser.id}`;
                setUser(foundUser);
                setAuthToken(newToken);
                await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ storedUser: foundUser, storedToken: newToken }));
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Erro no signIn:", error);
            return false;
        } finally {
            setIsLoadingAuth(false);
        }
    }, [getAllRegisteredUsers]);

    const signOut = useCallback(async () => {
        setUser(null);
        setAuthToken(null);
        try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (error) {
            console.error("Erro ao remover dados de autenticação do storage", error);
        }
    }, []);

    const signUp = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
        setIsLoadingAuth(true);
        try {
            const registeredUsers = await getAllRegisteredUsers();
            const existingUser = registeredUsers.find(u => u.username === usernameInput);

            await new Promise(resolve => setTimeout(resolve, 1000));

            if (existingUser) {
                console.warn(`Tentativa de cadastrar usuário existente: ${usernameInput}`);
                return false; // Usuário já existe
            }

            const newUserId = uuid.v4().toString();
            // <-- Agora armazenamos a senha fornecida pelo usuário no objeto User
            const newUser: User = { id: newUserId, username: usernameInput, password: passwordInput };

            const updatedUsers = [...registeredUsers, newUser];
            await saveAllRegisteredUsers(updatedUsers);

            // Automaticamente logar o usuário recém-criado
            const newToken = `mock-auth-token-${newUser.id}`;
            setUser(newUser);
            setAuthToken(newToken);
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ storedUser: newUser, storedToken: newToken }));

            console.log("Novo usuário cadastrado e logado:", newUser);
            return true;
        } catch (error) {
            console.error("Erro no signUp:", error);
            return false;
        } finally {
            setIsLoadingAuth(false);
        }
    }, [getAllRegisteredUsers, saveAllRegisteredUsers]);

    return (
        <AuthContext.Provider value={{ user, authToken, signIn, signOut, signUp, isLoadingAuth }}>
            {children}
        </AuthContext.Provider>
    );
};