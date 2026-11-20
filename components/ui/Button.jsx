import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import Text from './AppText';
import { theme } from '../../constants/theme';

// A function so the colors follow the current light/dark palette
const variants = () => ({
    accent: { bg: theme.accent, fg: theme.onAccent, border: theme.accent },
    white: { bg: theme.paper, fg: theme.text, border: theme.line },
    dark: { bg: theme.surface2, fg: theme.text, border: theme.surface2 },
    ink: { bg: theme.ink, fg: theme.onInk, border: theme.ink },
    outline: { bg: 'transparent', fg: theme.text, border: theme.surface3 },
    outlineDark: { bg: 'transparent', fg: theme.text, border: theme.surface3 },
    danger: { bg: 'transparent', fg: theme.danger, border: theme.danger },
});

const SIZES = {
    sm: { height: 40, px: 16, font: 13, icon: 16 },
    md: { height: 52, px: 20, font: 15, icon: 19 },
    lg: { height: 58, px: 24, font: 16, icon: 20 },
};

/** Pill button from the design system. variant: accent | white | dark | ink | outline | outlineDark | danger */
export default function Button({
    title, onPress, variant = 'accent', size = 'md', icon, iconRight, loading = false, disabled = false,
    full = true, style, haptic = true,
}) {
    const all = variants();
    const v = all[variant] || all.accent;
    const s = SIZES[size] || SIZES.md;

    return (
        <PressableScale
            onPress={onPress}
            disabled={disabled || loading}
            haptic={haptic}
            accessibilityLabel={title}
            style={[{
                height: s.height,
                paddingHorizontal: s.px,
                borderRadius: 999,
                backgroundColor: v.bg,
                borderWidth: 1.5,
                borderColor: v.border,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: full ? 'stretch' : 'flex-start',
            }, style]}
        >
            {loading ? (
                <ActivityIndicator color={v.fg} />
            ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {icon ? <Ionicons name={icon} size={s.icon} color={v.fg} /> : null}
                    <Text weight="bold" style={{ color: v.fg, fontSize: s.font }}>{title}</Text>
                    {iconRight ? <Ionicons name={iconRight} size={s.icon} color={v.fg} /> : null}
                </View>
            )}
        </PressableScale>
    );
}
