import { View, Text, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatMemberSince } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const ProfileHeader = ({ user, imageError, defaultAvatar, onImageError }) => {


    const { logout, token } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [posts, setPosts] = useState([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Debug logging
    console.log('User data in ProfileHeader:', {
        username: user?.username,
        email: user?.email,
        createdAt: user?.createdAt,
        createdAtType: typeof user?.createdAt,
        formattedDate: formatMemberSince(user?.createdAt)
    });

    const handleLogout = async () => {
        try {
            setShowLogoutModal(false);
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    

    if (!user) return null;

    return (
        <View className="bg-white rounded-xl pt-4 px-4 shadow-sm">
            <View className="flex-row items-center space-x-4 gap-4">
                <View className="relative">
                    <Image  
                        source={{ 
                            uri: imageError ? defaultAvatar : (user?.profileImage || defaultAvatar),
                            cache: 'reload'
                        }} 
                        className="w-24 h-24 rounded-full bg-gray-200"
                        style={{ resizeMode: 'cover' }}
                        onError={onImageError}
                    />
                    {!user?.profileImage && (
                        <TouchableOpacity className="absolute bottom-0 right-0 bg-primary1 p-2 rounded-full">
                            <Ionicons name="camera" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
                
                <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-800">{user?.username || 'User'}</Text>
                    <Text className="text-gray-600 mt-1">{user?.email || 'No email'}</Text>
                    {user?.createdAt && (
                        <Text className="text-gray-500 mt-1">
                            Member since {formatMemberSince(user.createdAt)}
                        </Text>
                    )}

                </View>
            </View>
            <View className="mt-4">
                <TouchableOpacity 
                    onPress={() => setShowLogoutModal(true)}
                    className="bg-red-500 p-[10px] rounded-lg flex-row items-center justify-center gap-1"
                >
                    <Ionicons name='log-out-outline' size={24} color={'#ffffff'}/>
                    <Text className="text-white text-lg text-center font-bold">Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Modern Logout Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showLogoutModal}
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <Pressable 
                    className="flex-1 justify-center items-center bg-black/50"
                    onPress={() => setShowLogoutModal(false)}
                >
                    <View className="bg-white rounded-2xl p-6 w-[80%] max-w-[400px] shadow-xl">
                        <View className="items-center mb-4">
                            <View className="bg-red-100 p-3 rounded-full mb-2">
                                <Ionicons name="log-out-outline" size={32} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-gray-800">Logout</Text>
                            <Text className="text-gray-500 text-center mt-2">
                                Are you sure you want to logout?
                            </Text>
                        </View>
                        
                        <View className="flex-row justify-end space-x-3 mt-4">
                            <TouchableOpacity 
                                onPress={() => setShowLogoutModal(false)}
                                className="px-4 py-2 rounded-lg"
                            >
                                <Text className="text-gray-600 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleLogout}
                                className="bg-red-500 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default ProfileHeader; 