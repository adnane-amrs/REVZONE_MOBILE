import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Text from './AppText';
import { theme } from '../../constants/theme';

const ICONS = {
    // Renter side
    explore: ['home', 'home-outline', 'Explore'],
    trips: ['map', 'map-outline', 'Trips'],
    // Owner side
    host: ['speedometer', 'speedometer-outline', 'Hosting'],
    cars: ['car-sport', 'car-sport-outline', 'My cars'],
    requests: ['file-tray-full', 'file-tray-full-outline', 'Requests'],
    // Both
    inbox: ['chatbubbles', 'chatbubbles-outline', 'Inbox'],
    profile: ['person', 'person-outline', 'Profile'],
};

/**
 * Floating dark tab bar: the active tab is a lime pill with its label,
 * the others are plain icons. The pill grows/shrinks with a spring when switching.
 * `visible` lists the tabs of the current mode (renter or owner), in order.
 */
export default function TabBar({ state, navigation, badges = {}, visible }) {
    const insets = useSafeAreaInsets();
    const routes = (visible || Object.keys(ICONS))
        .map(name => state.routes.find(r => r.name === name))
        .filter(Boolean);
    // Owner mode has 5 tabs: smaller circles so the bar still fits a 360px-wide phone
    const compact = routes.length > 4;
    const size = compact ? 48 : 56;

    return (
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 12) + 4, alignItems: 'center' }}>
            <View style={{
                flexDirection: 'row', gap: compact ? 6 : 8, padding: compact ? 6 : 7, borderRadius: 999,
                backgroundColor: theme.ink,
                shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12,
            }}>
                {routes.map((route) => {
                    const focused = state.routes[state.index]?.key === route.key;
                    const [iconOn, iconOff, label] = ICONS[route.name];
                    const badge = badges[route.name] || 0;

                    const onPress = () => {
                        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                        if (!focused && !event.defaultPrevented) {
                            Haptics.selectionAsync().catch(() => {});
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <Pressable key={route.key} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label}>
                            <Animated.View
                                layout={LinearTransition.springify().damping(16).stiffness(180)}
                                style={{
                                    height: size, minWidth: size, borderRadius: size / 2, paddingHorizontal: focused ? (compact ? 14 : 20) : 0,
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    // Lime pill on the dark bar, in both light and dark versions
                                    backgroundColor: focused ? theme.accent : 'transparent',
                                }}
                            >
                                <Ionicons name={focused ? iconOn : iconOff} size={compact ? 20 : 22} color={focused ? theme.onAccent : 'rgba(255,255,255,0.85)'} />
                                {focused ? (
                                    <Animated.View entering={FadeIn.duration(220)}>
                                        <Text weight="bold" style={{ color: theme.onAccent, fontSize: compact ? 13 : 14 }}>{label}</Text>
                                    </Animated.View>
                                ) : null}
                                {badge > 0 && !focused ? (
                                    <View style={{
                                        position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5,
                                        backgroundColor: theme.accent, borderWidth: 2, borderColor: theme.ink,
                                    }} />
                                ) : null}
                            </Animated.View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
