import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeScreen from '../../components/SafeScreen';
import { StatusBar } from 'expo-status-bar';
import "../globals.css";

const AdminLayout = () => {
    return (
        <SafeAreaProvider>
            <SafeScreen >
                <Stack screenOptions={{
                    headerShown: false,
                }}>
                    <Stack.Screen name='dashboard' options={{ title: 'Admin Dashboard' }} />
                    <Stack.Screen name='users' options={{ title: 'User Management' }} />
                    <Stack.Screen name='posts' options={{ title: 'Post Management' }} />
                </Stack>
            </SafeScreen>
            <StatusBar style='dark' />
        </SafeAreaProvider>
    )
}

export default AdminLayout 