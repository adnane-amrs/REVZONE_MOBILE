import { Text, SafeAreaView, ActivityIndicator, TouchableOpacity} from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function Login(){
    const {user, isLoading, checkAuth, logout} = useAuthStore();

    useEffect(() => {
        checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return (
        <SafeAreaView className='flex-1 justify-center'>
            {isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : (
            <Text>Welcome {user?.username}</Text>
            )}
            <TouchableOpacity onPress={logout}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}
