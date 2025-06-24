import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const AdminDashboard = () => {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { userStats, getUserStats, postStats, getPostStats, isLoading } = useAdminStore();
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    useEffect(() => {
        getUserStats();
        getPostStats();
    }, []);

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
        <SafeAreaView className="flex-1 bg-gray-100">
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
                        <StatCard
                            title="Total Users"
                            value={userStats.totalUsers || 0}
                            icon="people-outline"
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Active Users"
                            value={userStats.activeUsers || 0}
                            icon="checkmark-circle-outline"
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Suspended Users"
                            value={userStats.suspendedUsers || 0}
                            icon="pause-circle-outline"
                            color="bg-yellow-500"
                        />
                        <StatCard
                            title="Banned Users"
                            value={userStats.bannedUsers || 0}
                            icon="close-circle-outline"
                            color="bg-red-500"
                        />
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