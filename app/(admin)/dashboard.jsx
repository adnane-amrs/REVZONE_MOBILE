import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter , useFocusEffect } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';



const AdminDashboard = () => {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { userStats, getUserStats, postStats, getPostStats } = useAdminStore();

    useEffect(() => {
        getUserStats();
        getPostStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Block screenshots and screen recording
            ScreenCapture.preventScreenCaptureAsync();
            return () => {
                // Allow screenshots again when leaving the page
                ScreenCapture.allowScreenCaptureAsync();
            };
        }, [])
    );

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: logout, style: "destructive" }
            ]
        );
    };

    const StatCard = ({ title, value, icon, color, onPress }) => (
        <TouchableOpacity 
            onPress={onPress}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
        >
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-gray-600 text-sm font-medium">{title}</Text>
                    <Text className="text-2xl font-bold text-gray-900 mt-1">{value}</Text>
                </View>
                <View className={`w-12 h-12 rounded-full ${color} items-center justify-center`}>
                    <Ionicons name={icon} size={24} color="white" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100" >
            {/* Header */}
            <View className="bg-dark px-4 py-3 border-b text-white border-gray-200">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-xl font-bold text-white">Admin Dashboard</Text>
                        <Text className="text-white">Welcome back, {user?.username}</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color={'#ffffff'} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {/* Quick Stats */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</Text>
                    <View className="space-y-4">
                        <View className="flex-row justify-between">
                            <View className="flex-1 mr-2 bg-blue-100 rounded-lg p-4 items-center">
                                <Ionicons name="people-outline" size={28} color="#2563eb" />
                                <Text className="text-xs text-blue-800 mt-2">Total Users</Text>
                                <Text className="text-2xl font-bold text-blue-900 mt-1">{userStats.totalUsers ?? 0}</Text>
                            </View>
                            <View className="flex-1 mx-1 bg-green-100 rounded-lg p-4 items-center">
                                <Ionicons name="checkmark-circle-outline" size={28} color="#16a34a" />
                                <Text className="text-xs text-green-800 mt-2">Active</Text>
                                <Text className="text-2xl font-bold text-green-900 mt-1">{userStats.activeUsers ?? 0}</Text>
                            </View>
                            <View className="flex-1 mx-1 bg-yellow-100 rounded-lg p-4 items-center">
                                <Ionicons name="pause-circle-outline" size={28} color="#eab308" />
                                <Text className="text-xs text-yellow-800 mt-2">Suspended</Text>
                                <Text className="text-2xl font-bold text-yellow-900 mt-1">{userStats.suspendedUsers ?? 0}</Text>
                            </View>
                            <View className="flex-1 ml-2 bg-red-100 rounded-lg p-4 items-center">
                                <Ionicons name="close-circle-outline" size={28} color="#dc2626" />
                                <Text className="text-xs text-red-800 mt-2">Banned</Text>
                                <Text className="text-2xl font-bold text-red-900 mt-1">{userStats.bannedUsers ?? 0}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</Text>
                    <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-gray-600">New Users This Week</Text>
                            <Text className="text-lg font-bold text-blue-600">
                                {userStats.newUsersThisWeek || 0}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600">New Users This Month</Text>
                            <Text className="text-lg font-bold text-blue-600">
                                {userStats.newUsersThisMonth || 0}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Post Stats */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Post Stats</Text>
                    <View className="space-y-4">
                        <StatCard
                            title="Total Posts"
                            value={postStats.totalPosts || 0}
                            icon="car-sport-outline"
                            color="bg-purple-500"
                        />
                        <StatCard
                            title="New Posts This Week"
                            value={postStats.newPostsThisWeek || 0}
                            icon="newspaper-outline"
                            color="bg-teal-500"
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
                    <View className="space-y-4">
                        <TouchableOpacity
                            onPress={() => router.push('/(admin)/users')}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="people-outline" size={24} color={Colors.primary} />
                                <Text className="ml-3 text-gray-900 font-medium">Manage Users</Text>
                                <Ionicons name="chevron-forward" size={20} color={Colors.primary} className="ml-auto" />
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => router.push('/(admin)/posts')}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="car-outline" size={24} color={Colors.primary} />
                                <Text className="ml-3 text-gray-900 font-medium">Manage Posts</Text>
                                <Ionicons name="chevron-forward" size={20} color={Colors.primary} className="ml-auto" />
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="analytics-outline" size={24} color={Colors.primary} />
                                <Text className="ml-3 text-gray-900 font-medium">View Analytics</Text>
                                <Ionicons name="chevron-forward" size={20} color={Colors.primary} className="ml-auto" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminDashboard; 