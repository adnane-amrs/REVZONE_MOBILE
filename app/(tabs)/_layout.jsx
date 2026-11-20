import { useEffect } from 'react';
import { AppState, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import TabBar from '../../components/ui/TabBar';
import Text from '../../components/ui/AppText';
import { useCountsStore } from '../../store/countsStore';
import { useModeStore, MODES } from '../../store/modeStore';
import { theme } from '../../constants/theme';

const POLL_MS = 15000;

/** Full-screen accent-colored flash shown while switching between renter and owner mode. */
function SwitchOverlay({ to }) {
    const owner = to === 'owner';
    return (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(320)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <Animated.View entering={ZoomIn.springify().damping(12)}>
                <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: theme.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={owner ? 'key' : 'car-sport'} size={42} color={theme.accentLight} />
                </View>
            </Animated.View>
            <Text weight="extrabold" style={{ color: theme.onAccent, fontSize: 24 }}>{owner ? 'Switching to hosting' : 'Switching to renting'}</Text>
            <Text weight="medium" style={{ color: theme.onAccentMuted, fontSize: 14 }}>{owner ? 'Manage your cars and requests' : 'Find your next ride'}</Text>
        </Animated.View>
    );
}

const TabsLayout = () => {
    const { messages, requests, refresh } = useCountsStore();
    const mode = useModeStore(s => s.mode);
    const switching = useModeStore(s => s.switching);

    // Keep the badges fresh while the app is in the foreground
    useEffect(() => {
        refresh();
        let timer = setInterval(refresh, POLL_MS);
        const sub = AppState.addEventListener('change', (state) => {
            clearInterval(timer);
            if (state === 'active') {
                refresh();
                timer = setInterval(refresh, POLL_MS);
            }
        });
        return () => {
            clearInterval(timer);
            sub.remove();
        };
    }, [refresh]);

    // In renter mode, a dot on Profile reminds the user that requests for their cars are waiting
    const badges = { requests, inbox: messages, profile: mode === 'renter' ? requests : 0 };

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas }}>
            <Tabs
                tabBar={(props) => <TabBar {...props} visible={MODES[mode].tabs} badges={badges} />}
                screenOptions={{
                    headerShown: false,
                    sceneStyle: { backgroundColor: theme.canvas },
                    animation: 'fade',
                }}
            >
                {/* Renter side */}
                <Tabs.Screen name='explore' />
                <Tabs.Screen name='trips' />
                {/* Owner side */}
                <Tabs.Screen name='host' />
                <Tabs.Screen name='cars' />
                <Tabs.Screen name='requests' />
                {/* Both sides */}
                <Tabs.Screen name='inbox' />
                <Tabs.Screen name='profile' />
            </Tabs>
            {switching ? <SwitchOverlay to={switching} /> : null}
        </View>
    );
};

export default TabsLayout;
