import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { theme } from '../../constants/theme';

/** Pulsing placeholder shown while content loads. */
function Skeleton({ width = '100%', height = 16, radius = 12, style }) {
    const opacity = useSharedValue(0.45);
    useEffect(() => {
        opacity.value = withRepeat(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: theme.surface2 }, animated, style]} />;
}

/** Placeholder with the shape of a car card. */
export function CarCardSkeleton() {
    return (
        <View style={{ backgroundColor: theme.paper, borderRadius: 24, padding: 8, gap: 10, marginBottom: 16, borderWidth: 1, borderColor: theme.line }}>
            <Skeleton height={190} radius={18} />
            <View style={{ paddingHorizontal: 6, paddingBottom: 6, gap: 8 }}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="35%" height={12} />
            </View>
        </View>
    );
}

/** Placeholder for list rows (trips, conversations). */
export function RowSkeleton() {
    return (
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: theme.surface, borderRadius: 26, padding: 12, marginBottom: 12 }}>
            <Skeleton width={64} height={64} radius={20} />
            <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="70%" height={16} />
                <Skeleton width="45%" height={12} />
            </View>
        </View>
    );
}

export default Skeleton;
