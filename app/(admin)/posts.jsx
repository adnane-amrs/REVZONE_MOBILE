import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '../../store/adminStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


const PostManagement = () => {
    const router = useRouter();
    const { posts, postPagination, getPosts, updatePostStatus, deletePost, isLoading } = useAdminStore();
    
    // State for search, filters, and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        console.log('Status filter changed:', statusFilter);
        getPosts(currentPage, 10, searchQuery, statusFilter);
    }, [currentPage, searchQuery, statusFilter]);

    // New: handle status update with feedback and refresh
    const handleUpdateStatus = async (postId, status) => {
        console.log('Updating post', postId, 'to status', status);
        const result = await updatePostStatus(postId, status);
        if (result.success) {
            Alert.alert("Success", "Post status updated.");
            getPosts(currentPage, 10, searchQuery, statusFilter);
        } else {
            Alert.alert("Error", result.error || "Failed to update post status.");
        }
    };

    // New: handle delete with feedback and refresh
    const handleDelete = (postId) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to permanently delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        const result = await deletePost(postId);
                        if (result.success) {
                            Alert.alert("Success", "Post deleted.");
                            getPosts(currentPage, 10, searchQuery, statusFilter);
                        } else {
                            Alert.alert("Error", result.error || "Failed to delete post.");
                        }
                    }
                }
            ]
        );
    };

    const renderPostItem = ({ item }) => (
        <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
            {/* Top section with image and title */}
            <View className="flex-row items-start mb-3">
                <Image source={{ uri: item.image }} className="w-20 h-20 rounded-md bg-gray-200" />
                <View className="flex-1 ml-3">
                    <Text className="text-base font-bold text-gray-900 leading-tight" numberOfLines={2}>{item.title}</Text>
                    <Text className="text-sm text-gray-600 mt-1">by {item.user?.username || 'Unknown'}</Text>
                </View>
            </View>

            {/* Middle section with stats and status */}
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row space-x-3">
                    <View className="flex-row items-center"><Ionicons name="heart-outline" size={14} color="gray" /><Text className="text-xs ml-1">{item.likesCount} Likes</Text></View>
                    <View className="flex-row items-center"><Ionicons name="chatbubble-outline" size={14} color="gray" /><Text className="text-xs ml-1">{item.commentsCount} Comments</Text></View>
                </View>
                <View className={`px-2 py-1 rounded-full ${
                    item.status === 'visible' ? 'bg-green-200' : 
                    item.status === 'hidden' ? 'bg-yellow-200' : 
                    item.status === 'featured' ? 'bg-blue-200' : 'bg-gray-200'
                }`}>
                    <Text className={`text-xs font-medium ${
                        item.status === 'visible' ? 'text-green-800' : 
                        item.status === 'hidden' ? 'text-yellow-800' : 
                        item.status === 'featured' ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {/* Action buttons section */}
            <View className="flex-row gap-1 pt-3 border-t border-gray-100">
                <TouchableOpacity onPress={() => handleUpdateStatus(item._id, 'visible')} className="flex-1 bg-green-500 py-2 rounded-lg items-center" disabled={isLoading}><Text className="text-white text-xs font-bold">Visible</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleUpdateStatus(item._id, 'hidden')} className="flex-1 bg-yellow-500 py-2 rounded-lg items-center" disabled={isLoading}><Text className="text-white text-xs font-bold">Hide</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleUpdateStatus(item._id, 'featured')} className="flex-1 bg-blue-500 py-2 rounded-lg items-center" disabled={isLoading}><Text className="text-white text-xs font-bold">Feature</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} className="flex-1 bg-red-500 py-2 rounded-lg items-center" disabled={isLoading}><Text className="text-white text-xs font-bold">Delete</Text></TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Post Management</Text>
            </View>

            {/* Search and Filters */}
            <View className="p-4 bg-white border-b border-gray-200">
                <TextInput
                    placeholder="Search posts by title..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200"
                />
                <View className="flex-row gap-2 mt-3">
                    {['visible', 'hidden', 'featured'].map(s => (
                        <TouchableOpacity 
                            key={s}
                            onPress={() => setStatusFilter(statusFilter === s ? '' : s)}
                            className={`px-3 py-1 rounded-full ${statusFilter === s ? 'bg-blue-500' : 'bg-gray-200'}`}
                        >
                            <Text className={`capitalize ${statusFilter === s ? 'text-white' : 'text-gray-700'}`}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* List of Posts */}
            <FlatList
                data={posts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 16 }}
                refreshing={isLoading}
                onRefresh={() => getPosts(1, 10, searchQuery, statusFilter)}
            />

            {/* Pagination Controls */}
            {postPagination?.totalPosts > 0 && (
                <View className="bg-white px-4 py-3 border-t border-gray-200 flex-row items-center justify-between">
                    <TouchableOpacity 
                        onPress={() => setCurrentPage(currentPage - 1)}
                        disabled={!postPagination.hasPrev || isLoading}
                        className={`px-4 py-2 rounded-lg ${!postPagination.hasPrev || isLoading ? 'bg-gray-300' : 'bg-blue-500'}`}
                    >
                        <Text className="text-white">Previous</Text>
                    </TouchableOpacity>
                    <Text className="text-gray-600">
                        Page {postPagination.currentPage || 1} of {postPagination.totalPages || 1}
                    </Text>
                    <TouchableOpacity 
                        onPress={() => setCurrentPage(currentPage + 1)}
                        disabled={!postPagination.hasNext || isLoading}
                        className={`px-4 py-2 rounded-lg ${!postPagination.hasNext || isLoading ? 'bg-gray-300' : 'bg-blue-500'}`}
                    >
                        <Text className="text-white">Next</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default PostManagement;
