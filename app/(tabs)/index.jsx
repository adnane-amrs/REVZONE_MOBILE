import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

    const mockPosts = [
    {
        id: '1',
        user: {
        name: 'Sarah Johnson',
        username: '@sarahj',
        avatar: 'https://picsum.photos/40/40?random=1',
        },
        content: 'Just had the most amazing coffee at this local café! The atmosphere is perfect for working and the baristas are so friendly. ☕️✨',
        image: 'https://picsum.photos/400/300?random=1',
        rating: 5,
        likes: 124,
        location: 'Downtown Coffee Co.',
        isLiked: false,
    },
    {
        id: '2',
        user: {
        name: 'Mike Chen',
        username: '@mikec',
        avatar: 'https://picsum.photos/40/40?random=2',
        },
        content: 'Sunset hike was absolutely breathtaking today! Nothing beats being in nature after a long week. 🌅🥾',
        image: 'https://picsum.photos/400/300?random=2',
        rating: 4,
        likes: 89,
        location: 'Mountain Trail Park',
        isLiked: true,
    },
    {
        id: '3',
        user: {
        name: 'Emma Wilson',
        username: '@emmaw',
        avatar: 'https://picsum.photos/40/40?random=3',
        },
        content: 'Finally finished reading this incredible book! The plot twists kept me up all night. 📚🔍',
        image: 'https://picsum.photos/400/300?random=3',
        rating: 5,
        likes: 67,
        location: 'Central Library',
        isLiked: false,
    },
    ];

    const StarRating = ({ rating }) => {
    return (
        <View className="flex-row items-center mb-3">
        <View className="flex-row mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
                key={star}
                name={star <= rating ? "star" : "star-outline"}
                size={18}
                color={star <= rating ? "#4042e2" : "#D1D5DB"}
                style={{ marginRight: 4 }}
            />
            ))}
        </View>
        <Text className="text-sm text-gray-600">{rating}/5</Text>
        </View>
    );
    };

    const PostItem = ({ post, onLike }) => {
    return (
        <View className="bg-white mx-4 my-3 border border-gray-200 rounded-lg shadow-sm">
        {/* Header */}
        <View className="flex-row p-4 items-center">
            <Image 
            source={{ uri: post.user.avatar }} 
            className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
            <View className="flex-row items-center mb-1">
                <Text className="text-base font-semibold text-dark mr-2">
                {post.user.name}
                </Text>
                <Text className="text-sm text-gray-500">
                {post.user.username}
                </Text>
            </View>
            <View className="flex-row items-center">
                <Text className="text-sm mr-1">📍</Text>
                <Text className="text-sm text-gray-500">{post.location}</Text>
            </View>
            </View>
        </View>

        {/* Post Image */}
        <Image 
            source={{ uri: post.image }} 
            className="w-full h-72"
            resizeMode="cover"
        />

        {/* Content */}
        <View className="p-4">
            <Text className="text-base text-gray-800 leading-6 mb-4">
            {post.content}
            </Text>
            
            {/* Rating */}
            <StarRating rating={post.rating} />

            {/* Actions */}
            <View className="flex-row justify-between items-center mt-2">
            <TouchableOpacity
                className="flex-row items-center py-2 px-2"
                onPress={() => onLike(post.id)}
            >
                <Text className={`text-2xl mr-2 ${post.isLiked ? 'text-red-500' : 'text-gray-400'}`}>
                {post.isLiked ? '❤️' : '🤍'}
                </Text>
                <Text className="text-base font-medium text-gray-900">
                {post.likes}
                </Text>
            </TouchableOpacity>

            <View className="flex-row">
                <TouchableOpacity className="py-2 px-4">
                <Text className="text-base text-gray-600">Share</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-2 px-4">
                <Text className="text-base text-gray-600">Comment</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </View>
    );
    };

    const SocialFeed = () => {
    const [posts, setPosts] = useState(mockPosts);
    const insets = useSafeAreaInsets();

    const handleLike = (postId) => {
        setPosts(prevPosts =>
        prevPosts.map(post =>
            post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
                }
            : post
        )
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white py-4 px-5 border-b border-gray-200 items-center" style={{ paddingTop: insets.top }}>
                <Text className="text-xl font-bold text-gray-900">Feed</Text>
            </View>

            {/* Feed */}
            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10, paddingBottom: 80 }}
            >
                {posts.map((post) => (
                <PostItem key={post.id} post={post} onLike={handleLike} />
                ))}
            </ScrollView>
        </View>
    );
};

export default SocialFeed;