import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';
import { Image } from 'expo-image';

const SocialFeed = () => {
    const insets = useSafeAreaInsets();


    const {token} = useAuthStore()
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchPosts = async(pageNum=1, refresh=false) => {
        try {
            if(refresh) setRefreshing(true);
            else if (pageNum === 1) setLoading(true);

            const response = await fetch(`${API_URL}/cars?page=${pageNum}&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Check if response is ok before trying to parse JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check content type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError("Response was not JSON");
            }

            const data = await response.json();
            console.log("API Response:", JSON.stringify(data, null, 2)); // Debug log
            
            if (refresh || pageNum === 1) {
                setPosts(data.cars || []);
            } else {
                setPosts(prevPosts => [...prevPosts, ...(data.cars || [])]);
            }
            
            setHasMore(data.cars?.length === 5);
            setPage(pageNum);
            
        } catch (error) {
            console.error('Error fetching posts:', error);
            // Set empty posts array on error
            setPosts([]);
            setHasMore(false);
        } finally {
            if (refresh) setRefreshing(false);
            else setLoading(false);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, [])

    const handleLoadMore = async () => {
        if (!hasMore || loading || refreshing) return;
        await fetchPosts(page + 1);
    }

    const handleRefresh = async () => {
        setPosts([]);
        setPage(1);
        await fetchPosts(1, true);
    }

    const renderItem = ({ item }) => {
        console.log("Rendering item:", item); // Debug log
        console.log("Image URL:", item.image); // Debug log for image URL

        return (
            <View className="bg-white mx-4 my-3 border border-gray-200 rounded-lg shadow-sm">
                {/* Header */}
                <View className="flex-row p-4 items-center justify-center">
                    <Image 
                        source={{ uri: item.user.profileImage || `https://api.dicebear.com/9.x/personas/svg?seed=${item.user.username}` }} 
                        className="w-12 h-12 rounded-full mr-3 bg-red-400"
                        onError={(error) => console.log("Profile image error:", error.nativeEvent.error)}
                    />
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                            {item.user.username}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <View className="px-4">
                    <Text className="text-xl font-bold text-gray-900 mb-2">
                        {item.title}
                    </Text>
                </View>

                {/* Post Image */}
                <View className="w-full h-72 p-2">
                    <Image 
                        source={{ uri: item.image }}
                        className="w-full h-full rounded-lg"
                        contentFit="cover"
                        transition={200}
                        onError={(error) => {
                            console.log("Post image error:", error.nativeEvent.error);
                            console.log("Failed image URL:", item.image);
                        }}
                    />
                </View>

                {/* Content */}
                <View className="p-4">
                    <Text className="text-base text-gray-800 leading-6 mb-4">
                        {item.caption}
                    </Text>
            
                    {/* Rating */}
                    <View className="flex-row items-center mb-2">
                        <Text className="text-gray-600 mr-2">Rating:</Text>
                        <View className="flex-row">
                            {[...Array(5)].map((_, index) => (
                                <Ionicons
                                    key={index}
                                    name={index < item.rate ? "star" : "star-outline"}
                                    size={20}
                                    color={index < item.rate ? "#4042e2" : "#7d96f5"}
                                    style={{ marginRight: 2 }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row justify-between items-center mt-2">
                        <TouchableOpacity
                            className="flex-row items-center py-2 px-2"
                        >
                            <Text className="text-2xl mr-2 text-gray-400">
                                🤍
                            </Text>
                            <Text className="text-base font-medium text-gray-900">
                                0
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-secondary1/15">
            {/* Header */}
            <View className="bg-dark py-4 px-5 border-b border-gray-200 items-center" style={{ paddingTop: insets.top }}>
                <Text className="text-xl font-bold text-white">REVZONE</Text>
            </View>

            {/* Feed */}
            <FlatList 
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    loading ? (
                        <View className="flex-1 items-center justify-center p-4">
                            <Text className="text-gray-500">Loading posts...</Text>
                        </View>
                    ) : (
                        <View className="flex-1 items-center justify-center p-4">
                            <Text className="text-gray-500">No posts found</Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

export default SocialFeed;