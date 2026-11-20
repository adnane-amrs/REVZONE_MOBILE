import { Stack, useRouter, useSegments } from 'expo-router';
import "../app/globals.css";
import { useEffect, useState } from 'react';
import { Appearance, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useModeStore, MODES } from '../store/modeStore';
import { useThemeStore } from '../store/themeStore';
import ToastHost from '../components/ui/ToastHost';
import DialogHost from '../components/ui/DialogHost';
import { theme, statusBarStyle } from '../constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const RootLayout = () => {
    const router = useRouter();
    const segments = useSegments();
    const { checkAuth, user, token } = useAuthStore();
    const loadMode = useModeStore(s => s.load);
    const mode = useModeStore(s => s.mode);
    const loadTheme = useThemeStore(s => s.load);
    const scheme = useThemeStore(s => s.scheme);
    const [isReady, setIsReady] = useState(false);

    const [fontsLoaded, fontError] = useFonts({
        'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
        'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
        'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
        'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
        'PlusJakartaSans-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    });

    useEffect(() => {
        const initialize = async () => {
            await Promise.all([checkAuth(), loadMode(), loadTheme()]);
            setIsReady(true);
        };
        initialize();
    }, [checkAuth, loadMode, loadTheme]);

    // Follow the phone when it switches between light and dark (if the user chose "System")
    useEffect(() => {
        const sub = Appearance.addChangeListener(() => useThemeStore.getState().syncWithSystem());
        return () => sub.remove();
    }, []);

    const appReady = isReady && (fontsLoaded || fontError);

    useEffect(() => {
        if (appReady) SplashScreen.hideAsync().catch(() => {});
    }, [appReady]);

    // Route guard: where each kind of user is allowed to be
    useEffect(() => {
        if (!appReady) return;

        const isSignedIn = !!user && !!token;
        const isAdmin = user?.role === 'admin';
        const inAuthGroup = segments[0] === '(auth)';
        const inAdminGroup = segments[0] === '(admin)';
        const isAtRoot = segments.length === 0 || segments[0] === 'index';

        if (!isSignedIn) {
            // Signed-out users can only see the welcome and auth screens
            if (!inAuthGroup && !isAtRoot) router.replace('/');
            return;
        }
        // Users reopen the app on the side they used last (renter or owner).
        // After a light/dark switch the screens re-mount at the root: go back to where the user was.
        const returnTo = useThemeStore.getState().takeReturnTo();
        const home = returnTo || MODES[mode].home;
        if (inAdminGroup && !isAdmin) {
            // Regular users are kicked out of the admin area
            router.replace(home);
        } else if (inAuthGroup || isAtRoot) {
            // Admins land on the dashboard, but can also open the rental app from there
            router.replace(isAdmin ? '/(admin)/dashboard' : home);
        }
        // `mode` is read but not a dependency: switching sides navigates by itself
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token, segments, appReady, router]);

    if (!appReady) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.canvas }}>
            <SafeAreaProvider>
                <StatusBar style={statusBarStyle()} />
                {/* key: switching light/dark re-mounts every screen so they re-read the theme */}
                <View key={scheme} style={{ flex: 1 }}>
                <Stack screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: theme.canvas },
                }}>
                    <Stack.Screen name='index' options={{ animation: 'fade' }} />
                    <Stack.Screen name='(tabs)' options={{ animation: 'fade' }} />
                    <Stack.Screen name='(auth)' options={{ animation: 'fade' }} />
                    <Stack.Screen name='(admin)' />
                    <Stack.Screen name='car/[id]/book' options={{ animation: 'slide_from_bottom' }} />
                    <Stack.Screen name='review/[bookingId]' options={{ animation: 'slide_from_bottom' }} />
                </Stack>
                </View>
                <DialogHost />
                <ToastHost />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

export default RootLayout;
