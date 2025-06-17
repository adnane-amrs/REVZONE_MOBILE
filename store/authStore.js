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
            console.log("Making login request to:", `${API_URL}/auth/login`);
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
            console.log("Login response status:", response.status);
            console.log("Login response data:", data);
            console.log("User data from response:", data.user);
            console.log("Profile image URL from response:", data.user?.profileImage);
            console.log("Post count from response:", data.user?.postCount);

            if(!response.ok) throw new Error(data.message || 'Something went wrong!');

            if (!data.token) {
                console.log("No token received in login response");
                throw new Error("No authentication token received");
            }

            console.log("Token received:", data.token);
            console.log("Token format check:", data.token.split('.').length === 3 ? "Valid JWT format" : "Invalid JWT format");

            console.log("Storing user data in AsyncStorage:", data.user);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            await AsyncStorage.setItem('token', data.token);
            
            // Verify stored data
            const storedUser = await AsyncStorage.getItem('user');
            const storedToken = await AsyncStorage.getItem('token');
            console.log("Verified stored user data:", storedUser);
            console.log("Verified stored token:", storedToken);
            
            if (!storedToken) {
                console.log("Failed to store token in AsyncStorage");
                throw new Error("Failed to store authentication token");
            }

            set({token: data.token, user: data.user, isLoading: false});
            console.log("Login successful - token and user stored in state");
            console.log("User state after login:", data.user);

            return {success: true};

        } catch (error) {
            console.log("Login error:", error);
            set({isLoading: false});
            return {success: false, error: error.message};
        }
    },


    checkAuth: async () => {
        try {
            console.log("Checking authentication...");
            const token = await AsyncStorage.getItem('token');
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            console.log("Retrieved token from storage:", token);
            console.log("Retrieved user from storage:", user);

            if (!token) {
                console.log("No token found in storage");
                set({token: null, user: null});
                return;
            }

            // Verify token format
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                console.log("Invalid token format found in storage");
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                set({token: null, user: null});
                return;
            }

            set({token, user});
            console.log("Auth state updated with valid token and user");
        } catch (error) {
            console.log("Error in checkAuth:", error);
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