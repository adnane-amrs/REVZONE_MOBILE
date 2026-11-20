import { useState } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Text from './AppText';
import { theme, springs } from '../../constants/theme';

/** Pill tabs with a accent indicator that slides to the selected option. */
export default function SegmentedControl({ options, value, onChange, dark = true }) {
    const [width, setWidth] = useState(0);
    const index = Math.max(0, options.findIndex(o => o.value === value));
    const segment = width ? (width - 8) / options.length : 0;

    const indicator = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(index * segment, springs.gentle) }],
    }), [index, segment]);

    return (
        <View
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            style={{ flexDirection: 'row', backgroundColor: theme.paper, borderRadius: 999, padding: 4, height: 52, borderWidth: dark ? 1 : 0, borderColor: theme.line }}
        >
            {segment > 0 ? (
                <Animated.View style={[{
                    position: 'absolute', top: 4, left: 4, bottom: 4, width: segment, borderRadius: 999, backgroundColor: theme.accent,
                }, indicator]} />
            ) : null}
            {options.map(o => {
                const selected = o.value === value;
                return (
                    <Pressable
                        key={o.value}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        onPress={() => {
                            if (!selected) Haptics.selectionAsync().catch(() => {});
                            onChange(o.value);
                        }}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
                    >
                        <Text weight="bold" style={{ fontSize: 13, color: selected ? theme.onAccent : theme.textSoft }}>{o.label}</Text>
                        {o.badge ? (
                            <View style={{ minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: selected ? theme.onAccent : theme.danger, alignItems: 'center', justifyContent: 'center' }}>
                                <Text weight="bold" style={{ fontSize: 10, color: selected ? theme.accent : theme.onInk }}>{o.badge}</Text>
                            </View>
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
}
