import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import Text from './AppText';
import { theme } from '../../constants/theme';

// A function so the colors follow the current light/dark palette
const variants = () => ({
    white: { bg: theme.paper, fg: theme.text },
    dark: { bg: theme.surface2, fg: theme.text },
    accent: { bg: theme.accent, fg: theme.onAccent },
    ink: { bg: theme.ink, fg: theme.onInk },
    glass: { bg: 'rgba(255,255,255,0.92)', fg: '#0B0B0F' }, // over photos: same in both versions
});

/** Round icon button (back arrow, bell, share...). Optional red badge with a count. */
export default function IconButton({ icon, onPress, variant = 'white', size = 48, iconSize, badge = 0, accessibilityLabel, style }) {
    const all = variants();
    const v = all[variant] || all.white;
    return (
        <PressableScale
            onPress={onPress}
            haptic
            scaleTo={0.9}
            accessibilityLabel={accessibilityLabel || icon}
            hitSlop={6}
            style={[{
                width: size, height: size, borderRadius: size / 2, backgroundColor: v.bg,
                alignItems: 'center', justifyContent: 'center',
            }, style]}
        >
            <Ionicons name={icon} size={iconSize || Math.round(size * 0.42)} color={v.fg} />
            {badge > 0 ? (
                <View style={{
                    position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, borderRadius: 10,
                    backgroundColor: theme.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
                    borderWidth: 2, borderColor: theme.paper,
                }}>
                    <Text weight="bold" style={{ color: theme.onInk, fontSize: 10 }}>{badge > 99 ? '99+' : badge}</Text>
                </View>
            ) : null}
        </PressableScale>
    );
}
