import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { springs } from '../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Pressable that shrinks slightly with a spring when touched.
 * Layout/appearance go in `style` (Reanimated components only receive style objects).
 */
export default function PressableScale({
    children, style, onPress, onLongPress, disabled, scaleTo = 0.96, haptic = false, hitSlop, accessibilityLabel,
}) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            hitSlop={hitSlop}
            disabled={disabled}
            onPressIn={() => { scale.value = withSpring(scaleTo, springs.press); }}
            onPressOut={() => { scale.value = withSpring(1, springs.press); }}
            onPress={(e) => {
                if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onPress?.(e);
            }}
            onLongPress={onLongPress}
            style={[style, animatedStyle, disabled && { opacity: 0.5 }]}
        >
            {children}
        </AnimatedPressable>
    );
}
