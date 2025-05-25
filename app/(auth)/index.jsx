import { StyleSheet, TextInput, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity} from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function Login(){
    const {user, token, isLoading, checkAuth, logout} = useAuthStore();

    useEffect(() => {
        checkAuth();
    },[])

    return (
        <SafeAreaView className='flex-1 justify-center'>
            {isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : (
            <Text>Welcome {user?.username}</Text>
            )}
            <Text>Token: {token}</Text>
            <TouchableOpacity onPress={logout}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        height: 55,
        width: '90%',
        padding: 15, // internal spacing (inside the input)         
        marginBottom: 10, // external spacing (outside the input)
    },
    inputFocused: {
        borderColor: '#007AFF',
        backgroundColor: 'gray-200',
    },
});
