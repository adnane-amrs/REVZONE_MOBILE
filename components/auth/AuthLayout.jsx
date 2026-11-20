import { View, KeyboardAvoidingView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Text from '../ui/AppText';
import PressableScale from '../ui/PressableScale';
import KeyboardScroll from '../ui/KeyboardScroll';
import { theme } from '../../constants/theme';

const TABS = [
    { key: 'login', label: 'Log In', href: '/(auth)/login' },
    { key: 'register', label: 'Sign Up', href: '/(auth)/register' },
];

/**
 * Shared frame of the login and sign-up screens: dark header with the logo and a title,
 * then a sheet with the "Log In | Sign Up" switch and the form.
 */
export default function AuthLayout({ active, title, subtitle, children }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: theme.ink }}>
            <StatusBar style="light" />
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <KeyboardScroll contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 30 }}>
                        <PressableScale onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} haptic accessibilityLabel="Back"
                            style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="arrow-back" size={20} color={theme.onInk} />
                        </PressableScale>
                        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center', gap: 8, marginTop: -6 }}>
                            <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="car-sport" size={32} color={theme.onAccent} />
                            </View>
                            <Text weight="extrabold" style={{ color: theme.onInk, fontSize: 28, marginTop: 10 }}>{title}</Text>
                            <Text style={{ color: theme.onInkMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 290 }}>{subtitle}</Text>
                        </Animated.View>
                    </View>

                    <Animated.View entering={FadeInUp.springify().damping(18)} style={{
                        flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 32, borderTopRightRadius: 32,
                        paddingHorizontal: 22, paddingTop: 22, paddingBottom: insets.bottom + 24, gap: 18,
                    }}>
                        <View style={{ flexDirection: 'row', backgroundColor: theme.surface2, borderRadius: 999, padding: 4 }}>
                            {TABS.map(tab => {
                                const on = tab.key === active;
                                return (
                                    <Pressable key={tab.key} onPress={() => !on && router.replace(tab.href)}
                                        accessibilityRole="tab" accessibilityState={{ selected: on }}
                                        style={{ flex: 1, height: 46, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? theme.accent : 'transparent' }}>
                                        <Text weight="bold" style={{ color: on ? theme.onAccent : theme.textSoft, fontSize: 15 }}>{tab.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        {children}
                    </Animated.View>
                </KeyboardScroll>
            </KeyboardAvoidingView>
        </View>
    );
}
