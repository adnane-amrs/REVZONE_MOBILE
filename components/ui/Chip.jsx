import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import Text from './AppText';
import { theme } from '../../constants/theme';

/** Selectable pill (filters, features). */
function Chip({ label, selected = false, onPress, icon, dark = true, style }) {
    const bg = selected ? theme.accent : dark ? theme.surface : theme.paper;
    const fg = selected ? theme.onAccent : theme.text;
    return (
        <PressableScale
            onPress={onPress}
            haptic
            accessibilityLabel={label}
            style={[{
                flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 40,
                borderRadius: 999, backgroundColor: bg,
                borderWidth: 1, borderColor: selected ? theme.accent : theme.line,
            }, style]}
        >
            {icon ? <Ionicons name={icon} size={16} color={fg} /> : null}
            <Text weight="semibold" style={{ color: fg, fontSize: 13 }}>{label}</Text>
        </PressableScale>
    );
}

/** Small uppercase tag, like "BEST FOR SIMPLE ISSUES" in the design. */
export function Tag({ label, color = theme.surface2, textColor = theme.textSoft, icon, style }) {
    return (
        <View style={[{
            flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
            backgroundColor: color, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
        }, style]}>
            {icon ? <Ionicons name={icon} size={12} color={textColor} /> : null}
            <Text weight="bold" style={{ color: textColor, fontSize: 10, letterSpacing: 0.6 }}>{label.toUpperCase()}</Text>
        </View>
    );
}

export default Chip;
