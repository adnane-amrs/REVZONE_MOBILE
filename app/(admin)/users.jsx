import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '../../store/adminStore';
import { Ionicons } from '@expo/vector-icons';

const UserManagement = () => {
    const { users, pagination, getUsers, updateUserStatus, updateUserRole, isLoading } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchQuery, statusFilter, roleFilter]);

    const loadUsers = async () => {
        await getUsers(currentPage, 10, searchQuery, statusFilter, roleFilter);
    };

    const handleStatusChange = (userId, newStatus) => {
        Alert.alert(
            "Change User Status",
            `Are you sure you want to ${newStatus} this user?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: () => updateUserStatus(userId, newStatus)
                }
            ]
        );
    };

    const handleRoleChange = (userId, newRole) => {
        Alert.alert(
            "Change User Role",
            `Are you sure you want to change this user's role to ${newRole}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: () => updateUserRole(userId, newRole)
                }
            ]
        );
    };

    const renderUserItem = ({ item }) => (
        <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-gray-900">{item.username}</Text>
                <View className="flex-row space-x-2">
                    <View className={`px-2 py-1 rounded-full ${
                        item.status === 'active' ? 'bg-green-100' : 
                        item.status === 'suspended' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                        <Text className={`text-xs font-medium ${
                            item.status === 'active' ? 'text-green-800' : 
                            item.status === 'suspended' ? 'text-yellow-800' : 'text-red-800'
                        }`}>
                            {item.status}
                        </Text>
                    </View>
                    <View className="bg-blue-100 px-2 py-1 rounded-full">
                        <Text className="text-xs font-medium text-blue-800">{item.role}</Text>
                    </View>
                </View>
            </View>
            
            <Text className="text-gray-600 mb-2">{item.email}</Text>
            <Text className="text-gray-500 text-sm mb-3">
                Joined: {new Date(item.createdAt).toLocaleDateString()} • Posts: {item.postCount}
            </Text>
            
            <View className="flex-row gap-1">
                <TouchableOpacity 
                    onPress={() => handleStatusChange(item._id, 'active')}
                    className="flex-1 bg-green-500 p-2 rounded-lg items-center"
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => handleStatusChange(item._id, 'suspended')}
                    className="flex-1 bg-yellow-500 p-2 rounded-lg items-center"
                >
                    <Ionicons name="pause-circle-outline" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleStatusChange(item._id, 'banned')}
                    className="flex-1 bg-red-500 p-2 rounded-lg items-center"
                >
                    <Ionicons name="close-circle-outline" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => handleRoleChange(item._id, item.role === 'user' ? 'moderator' : 'user')}
                    className="flex-1 bg-blue-500 p-2 rounded-lg items-center"
                >
                    <Ionicons name="shield-checkmark-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">User Management</Text>
            </View>

            {/* Search and Filters */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <TextInput
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-gray-100 rounded-lg px-4 py-2 mb-3"
                />
                
                <View className="flex-row space-x-2">
                    <TouchableOpacity 
                        onPress={() => setStatusFilter(statusFilter === 'active' ? '' : 'active')}
                        className={`px-3 py-1 rounded-full ${
                            statusFilter === 'active' ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                    >
                        <Text className={statusFilter === 'active' ? 'text-white' : 'text-gray-700'}>
                            Active
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => setStatusFilter(statusFilter === 'suspended' ? '' : 'suspended')}
                        className={`px-3 py-1 rounded-full ${
                            statusFilter === 'suspended' ? 'bg-yellow-500' : 'bg-gray-200'
                        }`}
                    >
                        <Text className={statusFilter === 'suspended' ? 'text-white' : 'text-gray-700'}>
                            Suspended
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Users List */}
            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                className="flex-1 px-4 py-4"
                refreshing={isLoading}
                onRefresh={loadUsers}
            />

            {/* Pagination */}
            {pagination && (
                <View className="bg-white px-4 py-3 border-t border-gray-200">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity 
                            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={!pagination.hasPrev}
                            className={`px-4 py-2 rounded-lg ${
                                pagination.hasPrev ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <Text className="text-white">Previous</Text>
                        </TouchableOpacity>
                        
                        <Text className="text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </Text>
                        
                        <TouchableOpacity 
                            onPress={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                            disabled={!pagination.hasNext}
                            className={`px-4 py-2 rounded-lg ${
                                pagination.hasNext ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <Text className="text-white">Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default UserManagement;