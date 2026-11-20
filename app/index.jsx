import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown, FadeInUp, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import Text from '../components/ui/AppText';
import PressableScale from '../components/ui/PressableScale';
import { useAuthStore } from '../store/authStore';
import { theme } from '../constants/theme';

/** One of the three ">>>" chevrons on the start button; they light up one after another. */
function Chevron({ index }) {
    const opacity = useSharedValue(0.25);
    useEffect(() => {
        opacity.value = withDelay(index * 180, withRepeat(withSequence(
            withTiming(1, { duration: 420 }),
            withTiming(0.25, { duration: 420 }),
            withTiming(0.25, { duration: 300 }),
        ), -1));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View style={[{ marginLeft: index ? -9 : 0 }, style]}>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Animated.View>
    );
}

export default function Welcome() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const signedIn = useAuthStore(s => !!s.user && !!s.token);

    // Slow "Ken Burns" zoom on the background photo
    const zoom = useSharedValue(1);
    useEffect(() => {
        zoom.value = withRepeat(withTiming(1.12, { duration: 9000, easing: Easing.inOut(Easing.quad) }), -1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const bgStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));

    // Signed-in users are redirected by the root layout (e.g. after a light/dark switch): don't flash the welcome screen
    if (signedIn) return <View style={{ flex: 1, backgroundColor: theme.canvas }} />;

    return (
        <View style={{ flex: 1, backgroundColor: theme.ink }}>
            <StatusBar style="light" />
            <Animated.Image
                source={require('../assets/images/welcome.jpeg')}
                resizeMode="cover"
                style={[{ position: 'absolute', width: '100%', height: '100%' }, bgStyle]}
            />
            {/* Dark at the top for the headline, clear in the middle for the car, dark again for the button */}
            <LinearGradient
                colors={['rgba(11,11,15,0.85)', 'rgba(11,11,15,0.15)', 'rgba(11,11,15,0.1)', 'rgba(11,11,15,0.9)']}
                locations={[0, 0.38, 0.6, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View style={{ flex: 1, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20, paddingHorizontal: 24, justifyContent: 'space-between' }}>
                <View style={{ gap: 14 }}>
                    <Animated.View entering={FadeInDown.duration(500)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="car-sport" size={16} color={theme.onAccent} />
                        </View>
                        <Text weight="bold" style={{ color: theme.paper, fontSize: 15, letterSpacing: 0.5 }}>RevZone</Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(120).duration(600)}>
                        <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 38, lineHeight: 44, letterSpacing: -0.5 }}>
                            Rent the Car{'\n'}<Text weight="extrabold" style={{ color: theme.paper, fontSize: 38, letterSpacing: -0.5 }}>You Always Wanted</Text>
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(220).duration(600)}>
                        <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 22, maxWidth: 300 }}>
                            Book cars from local owners across Morocco, or earn money by sharing yours.
                        </Text>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInUp.delay(350).springify().damping(16)} style={{ gap: 18 }}>
                    <PressableScale onPress={() => router.push('/(auth)/register')} haptic scaleTo={0.97} accessibilityLabel="Get started"
                        style={{ height: 66, borderRadius: 999, backgroundColor: theme.paper, flexDirection: 'row', alignItems: 'center', padding: 7, paddingRight: 22 }}>
                        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="car-sport" size={24} color={theme.onAccent} />
                        </View>
                        <Text weight="bold" style={{ flex: 1, textAlign: 'center', color: theme.text, fontSize: 16 }}>Get Started</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {[0, 1, 2].map(i => <Chevron key={i} index={i} />)}
                        </View>
                    </PressableScale>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' }}>
                        Already have an account?{' '}
                        <Text weight="bold" onPress={() => router.push('/(auth)/login')} style={{ color: theme.paper, fontSize: 14, textDecorationLine: 'underline' }}>Sign in</Text>
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}
