import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Image,
    FlatList,
    Share,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';
import { formatPublishDate } from '../../lib/utils';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Loader from '../../components/Loader';

const SocialFeed = () => {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const {token} = useAuthStore()
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [imageErrors, setImageErrors] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({});
    const [likedPosts, setLikedPosts] = useState({});
    const [comments, setComments] = useState({});
    const [commentText, setCommentText] = useState({});
    const [showComments, setShowComments] = useState({});

    const getDefaultAvatar = (username) => {
        return `https://api.dicebear.com/9.x/initials/png?seed=${username || 'default'}`;
    }

    const handleImageError = (userId) => {
        setImageErrors(prev => ({
            ...prev,
            [userId]: true
        }));
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const fetchPosts = async(pageNum=1, refresh=false) => {
        try {
            if(refresh) setRefreshing(true);
            else if (pageNum === 1) setLoading(true);

            const response = await fetch(`${API_URL}/cars?page=${pageNum}&limit=4`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError("Response was not JSON");
            }

            const data = await response.json();
            console.log("API Response:", JSON.stringify(data, null, 2));
            
            if (refresh || pageNum === 1) {
                setPosts(data.cars || []);
                // Initialize likedPosts state with the isLiked status from the backend
                const initialLikedPosts = {};
                data.cars.forEach(car => {
                    initialLikedPosts[car._id] = car.isLiked;
                });
                setLikedPosts(initialLikedPosts);
            } else {
                setPosts(prevPosts => [...prevPosts, ...(data.cars || [])]);
                // Update likedPosts state for new posts
                const newLikedPosts = {};
                data.cars.forEach(car => {
                    newLikedPosts[car._id] = car.isLiked;
                });
                setLikedPosts(prev => ({...prev, ...newLikedPosts}));
            }
            
            setHasMore(data.cars?.length === 5);
            setPage(pageNum);
            
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
            setHasMore(false);
        } finally {
            if (refresh) {
                await sleep(800);
                setRefreshing(false);
            }
            else setLoading(false);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, [])

    const handleLoadMore = async () => {
        if (!hasMore || loading || refreshing){
            await sleep(1000);
            await fetchPosts(page + 1);
        }
    
    }

    if(loading) return <Loader/> ;

    const handleRefresh = async () => {
        setPosts([]);
        setPage(1);
        await fetchPosts(1, true);
    }

    const toggleExpand = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleLike = async (postId) => {
        try {
            const response = await fetch(`${API_URL}/cars/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to like/unlike post');
            }

            const data = await response.json();
            setLikedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));

            // Update the post's likes count in the posts array
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                        ? { ...post, likes: data.likes }
                        : post
                )
            );
        } catch (error) {
            console.error('Error liking/unliking post:', error);
            Alert.alert('Error', 'Failed to like/unlike post');
        }
    };

    const fetchComments = async (postId) => {
        try {
            const response = await fetch(`${API_URL}/cars/${postId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data = await response.json();
            setComments(prev => ({
                ...prev,
                [postId]: data
            }));

            // Update the post's comment count in the posts array
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                        ? { ...post, commentCount: data.length }
                        : post
                )
            );
        } catch (error) {
            console.error('Error fetching comments:', error);
            Alert.alert('Error', 'Failed to fetch comments');
        }
    };

    const handleComment = async (postId) => {
        if (!commentText[postId]?.trim()) {
            Alert.alert('Error', 'Please enter a comment');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/cars/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: commentText[postId] }),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const newComment = await response.json();
            
            // Update comments state
            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newComment]
            }));

            // Update the post's comment count in the posts array
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                        ? { ...post, commentCount: (post.commentCount || 0) + 1 }
                        : post
                )
            );

            // Clear the comment input
            setCommentText(prev => ({
                ...prev,
                [postId]: ''
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
            Alert.alert('Error', 'Failed to add comment');
        }
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));

        if (!comments[postId]) {
            fetchComments(postId);
        }
    };

    const renderItem = ({ item }) => {
        console.log("Rendering item:", item); // Debug log
        console.log("Image URL:", item.image); // Debug log for image URL

        return (
            <View className="bg-white mx-4 my-3 rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <View className="flex-row p-4 items-center">
                    <Image 
                        source={{ 
                            uri: imageErrors[item.user._id] ? getDefaultAvatar(item.user.username) : (item.user.profileImage || getDefaultAvatar(item.user.username)),
                            cache: 'reload'
                        }} 
                        className="w-12 h-12 rounded-full mr-3 bg-gray-100"
                        style={{ resizeMode: 'cover' }}
                        onError={() => handleImageError(item.user._id)}
                    />
                    <View className="flex-1">
                        <View className='flex-row justify-between items-center'>
                            <Text className="text-base font-semibold text-gray-900">
                                {item.user.username}
                            </Text>
                            {/* Rating */}
                            <View className="flex-row items-center">
                                <View className="flex-row">
                                    {[...Array(5)].map((_, index) => (
                                        <Ionicons
                                            key={index}
                                            name={index < item.rate ? "star" : "star-outline"}
                                            size={16}
                                            color={index < item.rate ? "#4042e2" : "#7d96f5"}
                                            style={{ marginRight: 1 }}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                        <Text className="text-sm text-gray-500 mt-0.5">
                            Shared on {formatPublishDate(item.createdAt)}
                        </Text>
                    </View>
                </View>

                {/* Title and Content */}
                <View className="px-4 pb-3">
                    <Text className="text-xl font-bold text-gray-900 mb-2">
                        {item.title}
                    </Text>
                    <Text 
                        className="text-base text-gray-700 leading-6 mb-1"
                        numberOfLines={expandedPosts[item._id] ? undefined : 2}
                    >
                        {item.caption}
                    </Text>
                    {item.caption.length > 100 && (
                        <TouchableOpacity onPress={() => toggleExpand(item._id)}>
                            <Text className="text-primary1 font-medium text-sm">
                                {expandedPosts[item._id] ? 'Show less' : 'Show more'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Post Image */}
                <View className="w-full aspect-[4/3]">
                    <Image 
                        source={{ uri: item.image }}
                        className="w-full h-full"
                        contentFit="cover"
                        transition={200}
                        onError={(error) => {
                            console.log("Post image error:", error.nativeEvent.error);
                            console.log("Failed image URL:", item.image);
                        }}
                    />
                </View>

                {/* Rating and Actions */}
                <View className="p-4">
                    <View className="flex-row justify-between items-center border-b border-gray-100 pb-3">
                        <View className="flex-row items-center gap-4">
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => handleLike(item._id)}
                            >
                                <Ionicons
                                    name={likedPosts[item._id] ? "heart" : "heart-outline"}
                                    size={24}
                                    color={likedPosts[item._id] ? "#4042e2" : "#8e8e93"}
                                />
                                <Text className="text-base font-medium text-gray-900 ml-1.5">
                                    {item.likes?.length || 0}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => toggleComments(item._id)}
                            >
                                <Ionicons
                                    name="chatbubble-outline"
                                    size={24}
                                    color="#8e8e93"
                                />
                                <Text className="text-base font-medium text-gray-900 ml-1.5">
                                    {item.commentCount || 0}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center"
                            >
                                <Ionicons
                                    name="share-outline"
                                    size={24}
                                    color="#8e8e93"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Comments Section */}
                    {showComments[item._id] && (
                        <View className="mt-3">
                            {/* Comment Input */}
                            <View className="flex-row items-center mb-3">
                                <TextInput
                                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 mr-2"
                                    placeholder="Add a comment..."
                                    value={commentText[item._id] || ''}
                                    onChangeText={(text) => setCommentText(prev => ({
                                        ...prev,
                                        [item._id]: text
                                    }))}
                                />
                                <TouchableOpacity
                                    onPress={() => handleComment(item._id)}
                                    className="bg-primary1 rounded-full p-2"
                                >
                                    <Ionicons name="send" size={20} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Comments List */}
                            {comments[item._id]?.map((comment) => (
                                <View key={comment._id || `${comment.user._id}-${comment.createdAt}`} className="flex-row items-start mb-3">
                                    <Image
                                        source={{ 
                                            uri: imageErrors[comment.user._id] ? getDefaultAvatar(comment.user.username) : (comment.user.profileImage || getDefaultAvatar(comment.user.username)),
                                            cache: 'reload'
                                        }}
                                        className="w-8 h-8 rounded-full mr-2 bg-gray-100"
                                        style={{ resizeMode: 'cover' }}
                                        onError={() => handleImageError(comment.user._id)}
                                    />
                                    <View className="flex-1 bg-gray-100 rounded-lg p-2">
                                        <Text className="font-semibold text-sm">
                                            {comment.user.username}
                                        </Text>
                                        <Text className="text-sm text-gray-700">
                                            {comment.text}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-300/50">
            {/* Header */}
            <View className="bg-dark py-4 px-5 border-b border-gray-200 items-center justify-center" style={{ paddingTop: insets.top }}>
                <Text className="text-xl font-bold text-white text-center">REVZONE</Text>
            </View>

            {/* Feed */}
            <FlatList 
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                refreshing={refreshing}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing}
                        onRefresh={() => fetchPosts(1, true)}
                        
                        tintColor={Colors.primary1}
                    />
                }
                onRefresh={handleRefresh}
                ListFooterComponent={
                    hasMore && posts.length > 0 ? (<ActivityIndicator size="small" color="#0E2148"/>) : null
                }
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={
                    loading ? (
                        <View className="flex-1 items-center justify-center p-4">
                            <Text className="text-gray-500">Loading posts...</Text>
                        </View>
                    ) : (
                        <View className="flex-1 items-center justify-center p-4">
                            <Ionicons name='book-outline' size={60} color='#0E2148'/>
                            <Text className="text-gray-500">No posts found</Text>
                            <Text className='text-gray-500'>Be the First To Share  a Car Recommendation!</Text>
                        </View>
                    )
                }
                
            />
        </View>
    );
};

export default SocialFeed;