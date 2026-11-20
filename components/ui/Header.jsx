import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import IconButton from './IconButton';
import Text from './AppText';
import { theme, statusBarStyle } from '../../constants/theme';

/**
 * Screen header from the design: round back button + white pill with an icon and two lines.
 *   <Header kicker="Unlock" title="Experts" icon="car-sport" />
 */
export default function Header({ title, kicker, icon = 'car-sport', onBack, right, back = true, dark = false }) {
    const router = useRouter();
    const handleBack = onBack || (() => (router.canGoBack() ? router.back() : router.replace('/explore')));

    return (
        <Animated.View entering={FadeInDown.duration(350)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 }}>
            {/* Status bar icons that contrast with the canvas behind the header */}
            <StatusBar style={statusBarStyle()} />
            {back ? <IconButton icon="arrow-back" onPress={handleBack} variant="white" size={52} accessibilityLabel="Back" /> : null}
            <View style={{
                flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: dark ? theme.surface2 : theme.paper, borderRadius: 999, borderWidth: 1, borderColor: theme.line, paddingVertical: 7, paddingLeft: 7, paddingRight: 18,
                alignSelf: 'center', maxWidth: 260,
            }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={icon} size={19} color={theme.onAccent} />
                </View>
                <View style={{ flexShrink: 1 }}>
                    {kicker ? <Text numberOfLines={1} style={{ fontSize: 12, color: theme.muted }}>{kicker}</Text> : null}
                    <Text numberOfLines={1} weight="bold" style={{ fontSize: 15, color: theme.text }}>{title}</Text>
                </View>
            </View>
            <View style={{ flex: 1 }} />
            {right}
        </Animated.View>
    );
}
