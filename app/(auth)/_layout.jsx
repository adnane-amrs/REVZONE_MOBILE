import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeScreen from '../../components/SafeScreen';
import { StatusBar } from 'expo-status-bar';
import "../globals.css";

const AuthLayout = () => {
    return (
        <SafeAreaProvider>
            <SafeScreen>
                <Stack screenOptions={{
                    headerShown: false,
                }}>
                    <Stack.Screen name='login' options={{ title: 'Login' }} />
                    <Stack.Screen name='register' options={{ title: 'Register' }} />
                </Stack>
            </SafeScreen>
            <StatusBar style='dark' />
        </SafeAreaProvider>
    )
}

export default AuthLayout
