import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native'
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

const Profile = () => {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 p-4">
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
        </SafeAreaView>
    )
}

export default Profile

const styles = StyleSheet.create({})