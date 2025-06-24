import { Stack, useRouter, useSegments } from 'expo-router';
import "../app/globals.css";
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootLayout = () => {
    const router = useRouter();
    const segments = useSegments();
    const { checkAuth, user, token } = useAuthStore();
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

        const isSignedIn = !!user && !!token;
        const isAdmin = user?.role === 'admin';

        // Get the current location (e.g., '(auth)', '(tabs)', '(admin)')
        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';
        const inAdminGroup = segments[0] === '(admin)';
        const isAtRoot = segments.length === 0 || segments[0] === 'index';
        
        // --- NEW, MORE ROBUST LOGIC ---

        if (isSignedIn) {
            if (isAdmin) {
                // If admin is NOT in the admin area, force them there.
                if (!inAdminGroup) {
                    router.replace('/(admin)/dashboard');
                }
            } else {
                // If a regular user is in the admin area, kick them out.
                if (inAdminGroup) {
                    router.replace('/(tabs)/index');
                }
                // If a regular user is on the login/welcome screen, send to tabs.
                else if (inAuthGroup || isAtRoot) {
                    router.replace('/');
                }
            }
        } else {
            // If not signed in, they should be on the auth or welcome screen.
            // If they are anywhere else, redirect them to the welcome screen.
            if (!inAuthGroup && !isAtRoot) {
                router.replace('/');
            }
        }

    }, [user, token, segments, isReady, router]);

    if (!isReady) {
        return null; // or a loading screen
    }

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name='index' />
                <Stack.Screen name='(tabs)' />
                <Stack.Screen name='(auth)' />
                <Stack.Screen name='(admin)' />
            </Stack>
        </SafeAreaProvider>
    );
}

export default RootLayout;