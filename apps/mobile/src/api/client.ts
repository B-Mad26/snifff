import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/v1';

export const api: AxiosInstance = axios.create({ baseURL: BASE_URL, timeout: 20_000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !refreshing) {
      refreshing = true; original._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('no refresh');
        const r = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        await SecureStore.setItemAsync('accessToken', r.data.accessToken);
        await SecureStore.setItemAsync('refreshToken', r.data.refreshToken);
        original.headers.Authorization = `Bearer ${r.data.accessToken}`;
        return api(original);
      } finally { refreshing = false; }
    }
    return Promise.reject(error);
  }
);
