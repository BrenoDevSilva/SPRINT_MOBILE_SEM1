// src/services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@datarium_users';
const SESSION_KEY = '@datarium_session';

export type User = {
  email: string;
  password: string;
};

export async function register(user: User): Promise<boolean> {
  const data = await AsyncStorage.getItem(USERS_KEY);
  const users = data ? JSON.parse(data) : [];

  const exists = users.some((u: User) => u.email === user.email);
  if (exists) return false;

  users.push(user);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

export async function login(email: string, password: string): Promise<boolean> {
  const data = await AsyncStorage.getItem(USERS_KEY);
  const users = data ? JSON.parse(data) : [];

  const found = users.find((u: User) => u.email === email && u.password === password);
  if (!found) return false;

  await AsyncStorage.setItem(SESSION_KEY, email);
  return true;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function isLoggedIn(): Promise<boolean> {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  return !!session;
}
