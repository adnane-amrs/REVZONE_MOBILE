import { Stack, useRouter, useSegments } from 'expo-router';
import "../app/globals.css";
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootLayout = () => {
    const router = useRouter();
    const segments = useSegments();
    const {checkAuth, user, token} = useAuthStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            await checkAuth();
            setIsReady(true);
        };
        initialize();
    }, []);

    useEffect(() => {
        if (!isReady) return;

        const inAuthScreen = segments[0] === '(auth)';
        const inWelcomeScreen = segments[0] === 'index';
        const isSignedIn = user && token;

        if (isSignedIn && (inAuthScreen || inWelcomeScreen)) {
            router.replace('/(tabs)/index');
        } else if (!isSignedIn && !inAuthScreen && !inWelcomeScreen) {
            router.replace('/');
        }
    }, [user, token, segments, isReady]);

    if (!isReady) {
        return null; // or a loading screen if you prefer
    }

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{
                headerShown: false,
            }}>
                <Stack.Screen name='index' options={{ headerShown: false }}/>
                <Stack.Screen name='(tabs)' options={{headerShown: false}}/>
                <Stack.Screen name='(auth)' options={{ headerShown: false }}/>
            </Stack>
        </SafeAreaProvider>
    )
}

export default RootLayout;