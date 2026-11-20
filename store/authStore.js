import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

const postJson = async (path, body) => {
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch {
        throw new Error('Cannot reach the server. Check your connection.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Something went wrong!');
    return data;
};

const saveSession = async (set, data) => {
    if (!data.token) throw new Error("No authentication token received");
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    await AsyncStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user, isLoading: false });
};

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isLoading: false,

    register: async (username, email, password, confirmPassword) => {
        set({ isLoading: true });
        try {
            const data = await postJson('/auth/register', { username, email, password, confirmPassword });
            await saveSession(set, data);
            return {success: true};
        } catch (error) {
            set({isLoading: false});
            return {success: false, error: error.message};
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const data = await postJson('/auth/login', { email, password });
            await saveSession(set, data);
            return {success: true};
        } catch (error) {
            set({isLoading: false});
            return {success: false, error: error.message};
        }
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            // Verify token format
            if (!token || token.split('.').length !== 3) {
                await AsyncStorage.multiRemove(['token', 'user']);
                set({token: null, user: null});
                return;
            }

            set({token, user});
        } catch {
            set({token: null, user: null});
        }
    },

    /** Replaces the stored profile with fresh data from the API. */
    setUser: async (user) => {
        const merged = { ...get().user, ...user };
        await AsyncStorage.setItem('user', JSON.stringify(merged));
        set({ user: merged });
    },

    logout: async () => {
        await AsyncStorage.multiRemove(['user', 'token']);
        set({user: null, token: null});
    }
}))
