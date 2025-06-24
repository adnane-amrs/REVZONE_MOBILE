import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    
    register: async (username, email, password, confirmPassword) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_URL}/auth/register`,{
            // const response = await fetch('https://localhost:3000/api/auth/register',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword
                }),
            })
        
            const data = await response.json();

            if(!response.ok) throw new Error(data.message || 'Something went wrong!');

            // Don't store credentials after registration
            set({isLoading: false});
            return {success: true};

        } catch (error) {
            set({isLoading: false});
            return {success: false, error: error.message};
        }
    },

    // Login function
    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_URL}/auth/login`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            })
            const data = await response.json();

            if(!response.ok) throw new Error(data.message || 'Something went wrong!');

            if (!data.token) {
                throw new Error("No authentication token received");
            }

            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            await AsyncStorage.setItem('token', data.token);
            
            if (!await AsyncStorage.getItem('token')) {
                throw new Error("Failed to store authentication token");
            }

            set({token: data.token, user: data.user, isLoading: false});

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

            if (!token) {
                set({token: null, user: null});
                return;
            }

            // Verify token format
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                set({token: null, user: null});
                return;
            }

            set({token, user});
        } catch (error) {
            set({token: null, user: null});
        }
    },

    // Logout function
    logout: async () => {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        set({user: null, token: null});
    }
}))