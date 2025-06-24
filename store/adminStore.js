import { create } from 'zustand';
import { API_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const useAdminStore = create((set, get) => ({
    users: [],
    pagination: {},
    userStats: {},
    posts: [],
    postPagination: {},
    postStats: {},
    isLoading: false,
    error: null,
    
    // Get all users with pagination and search
    getUsers: async (page = 1, limit = 10, search = "", status = "", role = "") => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(status && { status }),
                ...(role && { role })
            });

            const response = await fetch(`${API_URL}/admin/users?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Something went wrong!');

            set({ 
                users: data.users, 
                pagination: data.pagination,
                isLoading: false 
            });

            return { success: true, data };

        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Get user details
    getUserDetails: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Something went wrong!');

            set({ isLoading: false });
            return { success: true, data };

        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Update user status
    updateUserStatus: async (userId, status, suspendedUntil = null, suspensionReason = "") => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status,
                    suspendedUntil,
                    suspensionReason
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Something went wrong!');

            // Update user in local state
            const { users } = get();
            const updatedUsers = users.map(user => 
                user._id === userId 
                    ? { ...user, status, suspendedUntil, suspensionReason }
                    : user
            );

            set({ users: updatedUsers, isLoading: false });
            return { success: true, data };

        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Update user role
    updateUserRole: async (userId, role) => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Something went wrong!');

            // Update user in local state
            const { users } = get();
            const updatedUsers = users.map(user => 
                user._id === userId 
                    ? { ...user, role }
                    : user
            );

            set({ users: updatedUsers, isLoading: false });
            return { success: true, data };

        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Bulk operations
    bulkUserOperations: async (userIds, action, value = null) => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_URL}/admin/users/bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds,
                    action,
                    value
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Something went wrong!');

            // Refresh users list after bulk operation
            await get().getUsers();

            set({ isLoading: false });
            return { success: true, data };

        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Get user statistics
    getUserStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_URL}/admin/users/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();


            if (!response.ok) throw new Error(data.message || 'Something went wrong!');

            set({ userStats: data, isLoading: false });
            return { success: true, data };

        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Get all posts
    getPosts: async (page = 1, limit = 10, search = "", status = "") => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(status && { status })
            });

            const response = await fetch(`${API_URL}/admin/posts?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            set({ posts: data.posts, postPagination: data.pagination, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Update post status
    updatePostStatus: async (postId, status) => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/posts/${postId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred on the server.');
            }
            
            const { posts } = get();
            const updatedPosts = posts.map(p => 
                p._id === postId ? data.post : p
            );
            set({ posts: updatedPosts, isLoading: false });
            
            return { success: true };
        } catch (error) {
            Alert.alert("Update Failed", error.message); 
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Delete a post
    deletePost: async (postId) => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Remove the post from local state
            const { posts } = get();
            set({ posts: posts.filter(p => p._id !== postId), isLoading: false });

            return { success: true };
        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Get post statistics
    getPostStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/posts/stats`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            set({ postStats: data, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
})); 