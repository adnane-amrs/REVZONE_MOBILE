import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Text from './AppText';
import { theme } from '../../constants/theme';

/** Read-only rating: ★ 4.8 (12) */
export function RatingBadge({ rating = 0, count = 0, dark = true, size = 13 }) {
    const color = theme.text;
    if (!count) {
        return <Text weight="semibold" style={{ color: theme.accentDeep, fontSize: size }}>New</Text>;
    }
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={size + 1} color={theme.star} />
            <Text weight="bold" style={{ color, fontSize: size }}>{Number(rating).toFixed(1)}</Text>
            <Text style={{ color: theme.muted, fontSize: size - 1 }}>({count})</Text>
        </View>
    );
}

function Star({ index, value, onChange, size }) {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const filled = index < value;
    return (
        <Pressable
            accessibilityLabel={`${index + 1} star${index ? 's' : ''}`}
            hitSlop={6}
            onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                scale.value = withSequence(withSpring(1.35, { damping: 6 }), withSpring(1));
                onChange(index + 1);
            }}
        >
            <Animated.View style={style}>
                <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color={filled ? theme.star : theme.surface3} />
            </Animated.View>
        </Pressable>
    );
}

/** Tappable 1–5 stars that bounce when selected. */
export function StarInput({ value, onChange, size = 34 }) {
    return (
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
            {[0, 1, 2, 3, 4].map(i => <Star key={i} index={i} value={value} onChange={onChange} size={size} />)}
        </View>
    );
}

/** Row of stars for display. */
export function Stars({ value = 0, size = 14 }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[0, 1, 2, 3, 4].map(i => (
                <Ionicons key={i} name={i < Math.round(value) ? 'star' : 'star-outline'} size={size} color={i < Math.round(value) ? theme.star : theme.surface3} />
            ))}
        </View>
    );
}
