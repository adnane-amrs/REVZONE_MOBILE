import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Profile = () => {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    }

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 p-4" style={{ paddingTop: insets.top }}>
                <View className="items-center mt-8">
                    <Image 
                        source={{ uri: user?.profileImage }} 
                        className="w-32 h-32 rounded-full"
                    />
                    <Text className="text-2xl font-bold mt-4">{user?.username}</Text>
                    <Text className="text-gray-600 mt-2">{user?.email}</Text>
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