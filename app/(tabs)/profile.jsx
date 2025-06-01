import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';


const Profile = () => {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Debug logs
    console.log("User data:", user);
    console.log("Profile image URL:", user?.profileImage);
    console.log("Username:", user?.username);

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    }

    // Default avatar URL from DiceBear API
    const defaultAvatar = `https://api.dicebear.com/9.x/lorelei/svg?seed=${user?.username || 'default'}`;
    console.log("Default avatar URL:", defaultAvatar);

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 p-4" style={{ paddingTop: insets.top }}>
                <View className="items-center mt-8">
                    <View className="relative">
                        <Image 
                            source={{ uri: user?.profileImage || defaultAvatar }} 
                            className="w-32 h-32 rounded-full"
                            onError={(e) => {
                                console.log("Image loading error:", e.nativeEvent.error);
                                console.log("Attempted URL:", user?.profileImage || defaultAvatar);
                            }}
                        />
                        {!user?.profileImage && (
                            <View className="absolute bottom-0 right-0 bg-primary1 p-2 rounded-full">
                                <Ionicons name="camera" size={20} color="white" />
                            </View>
                        )}
                    </View>
                    <Text className="text-2xl font-bold mt-4">{user?.username || 'User'}</Text>
                    <Text className="text-gray-600 mt-2">{user?.email || 'No email'}</Text>
                </View>

                <View className="mt-8">
                    <TouchableOpacity 
                        onPress={handleLogout}
                        className="bg-red-500 p-4 rounded-full"
                    >
                        <Text className="text-white text-center font-bold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default Profile

const styles = StyleSheet.create({})