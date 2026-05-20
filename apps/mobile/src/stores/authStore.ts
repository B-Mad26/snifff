import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  hydrated: boolean;
  authed: boolean;
  user: any | null;
  hydrate: () => Promise<void>;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  hydrated: false,
  authed: false,
  user: null,
  hydrate: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    set({ hydrated: true, authed: !!token });
  },
  signIn: async (a: string, r: string) => {
    await SecureStore.setItemAsync('accessToken', a);
    await SecureStore.setItemAsync('refreshToken', r);
    set({ authed: true });
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ authed: false, user: null });
  },
}));
