import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, RefreshControl, Image, SafeAreaView } from 'react-native'
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { formatMemberSince } from '../../lib/utils';
import { API_URL } from '../../constants/api';
import ProfileHeader from '../../components/profileHeader';
import Spacer from '../../components/Spacer';
import { Colors } from '../../constants/Colors';

const Profile = () => {
    const { user, token, logout } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [posts, setPosts] = useState([]);

    // Default avatar URL from DiceBear API using PNG format
    const defaultAvatar = `https://api.dicebear.com/9.x/initials/png?seed=${user?.username || 'default'}`;

    const handleImageError = (e) => {
        console.log("Image loading error:", e.nativeEvent.error);
        console.log("Attempted URL:", user?.profileImage || defaultAvatar);
        setImageError(true);
    }

    // Reset image error state when user changes
    useEffect(() => {
        setImageError(false);
    }, [user]);

    useEffect(() => {
        if (!user || !token) {
            router.replace('/(auth)/login');
            return;
        }
        fetchPosts();
    }, [user, token]);

    const fetchPosts = async(pageNum=1, refresh=false) => {
        if (!user || !token) {
            setLoading(false);
            return;
        }

        try {
            if(refresh) setRefreshing(true);
            else if (pageNum === 1) setLoading(true);

            const response = await fetch(`${API_URL}/cars/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                if (response.status === 401) {
                    // Handle unauthorized error
                    await logout();
                    router.replace('/(auth)/login');
                    return;
                }
                throw new Error(data.message || "Failed to fetch user Posts");
            }

            setPosts(data);
            
        } catch (error) {
            console.error('Error fetching posts:', error);
            if (error.message.includes('401')) {
                await logout();
                router.replace('/(auth)/login');
            } else {
                Alert.alert("Error", "Failed to load Profile data. Pull down to refresh")
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const handleRefresh = async () => {
        if (!user || !token) {
            router.replace('/(auth)/login');
            return;
        }
        setRefreshing(true);
        try {
            await fetchPosts(1, true);
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!user || !token) {
            router.replace('/(auth)/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/cars/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    await logout();
                    router.replace('/(auth)/login');
                    return;
                }
                throw new Error('Failed to delete post');
            }

            // Remove the deleted post from the state
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
            
            Alert.alert('Success', 'Post deleted successfully');
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete post');
        }
    };

    const handleEditPost = (post) => {
        // Navigate to edit screen with post data
        router.push({
            pathname: '/(tabs)/edit',
            params: {
                postId: post._id,
                title: post.title,
                caption: post.caption,
                rate: post.rate,
                image: post.image
            }
        });
    };

    const renderHeader = () => (
        <View className="bg-white rounded-xl shadow-sm mx-4 my-3">
            <ProfileHeader 
                user={user}
                imageError={imageError}
                defaultAvatar={defaultAvatar}
                onImageError={handleImageError}
            />

            {/* Your Recommendation Section */}
            <View className="mt-4 flex-row justify-between items-center border-t border-gray-100 p-4">
                <Text className="text-xl font-bold text-gray-800">
                    Your Recommendations
                </Text>
                <Text className='text-lg font-semibold text-primary1'>
                    {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                </Text>
            </View>
        </View>
    );

    const renderPostItem = ({ item }) => (
        <View className="bg-gray-00 mx-4 my-2 rounded-2xl shadow-sm overflow-hidden">
            {/* Post Header with Edit and Delete Buttons */}
            <View className="flex-row justify-between items-center p-4 py-2 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900 flex-1 mr-2">
                    {item.title}
                </Text>
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        onPress={() => handleEditPost(item)}
                        className="p-2 mr-2"
                    >
                        <Ionicons name="create-outline" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => {
                            Alert.alert(
                                'Delete Post',
                                'Are you sure you want to delete this post?',
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Delete',
                                        onPress: () => handleDeletePost(item._id),
                                        style: 'destructive'
                                    }
                                ]
                            );
                        }}
                        className="p-2"
                    >
                        <Ionicons name="trash-outline" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className='flex-row'>
                {/* Post Image */}
                <View className="w-[45%] h-40">
                    <Image 
                        source={{ uri: item.image }}
                        className="w-full h-full"
                        contentFit="cover"
                        transition={200}
                    />
                </View>

                {/* Post Content */}
                <View className="p-4 flex-col flex-1">
                    <Text 
                        className="text-gray-600 text-sm leading-5"
                        numberOfLines={5}
                        ellipsizeMode="tail"
                    >
                        {item.caption}
                    </Text>
                    
                    {/* Rating */}
                    <View className="flex-row items-center mt-auto">
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
                </View>
            </View>
        </View>
    );

    // Add admin section if user is admin
    const renderAdminSection = () => {
        if (user?.role !== 'admin') return null;
        
        return (
            <View className="mt-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Admin Panel</Text>
                <TouchableOpacity 
                    onPress={() => router.push('/(admin)/dashboard')}
                    className="bg-blue-500 rounded-lg p-4 mb-2"
                >
                    <Text className="text-white text-center font-medium">Go to Admin Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <FlatList
                data={posts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#3b82f6"
                    />
                }
                contentContainerStyle={{ 
                    paddingBottom: insets.bottom + 50,
                    paddingTop: 10
                }}
                ListEmptyComponent={
                    loading ? (
                        <View className="flex-1 items-center justify-center p-4">
                            <Text className="text-gray-500">Loading posts...</Text>
                        </View>
                    ) : (
                        <View className="flex-1 items-center justify-center p-4">
                            <Ionicons name='book-outline' size={60} color='#0E2148'/>
                            <Text className="text-gray-500">No posts found</Text>
                            <Text className='text-gray-500'>Be the First To Share a Car Recommendation!</Text>
                        </View>
                    )
                }
            />

            {/* Admin section */}
            {renderAdminSection()}
        </SafeAreaView>
    )
}

export default Profile

const styles = StyleSheet.create({})