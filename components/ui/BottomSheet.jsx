import { useEffect, useState } from 'react';
import { Modal, Pressable, View, Dimensions } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './AppText';
import { theme } from '../../constants/theme';

const SCREEN_H = Dimensions.get('window').height;

/**
 * Sheet that slides up from the bottom. Drag the handle down (or tap outside) to close.
 */
export default function BottomSheet({ visible, onClose, title, children, footer, maxHeight = 0.88 }) {
    const insets = useSafeAreaInsets();
    const [mounted, setMounted] = useState(visible);
    const translateY = useSharedValue(SCREEN_H);
    const backdrop = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            setMounted(true);
            translateY.value = withSpring(0, { damping: 20, stiffness: 180 });
            backdrop.value = withTiming(1, { duration: 220 });
        } else if (mounted) {
            backdrop.value = withTiming(0, { duration: 200 });
            translateY.value = withTiming(SCREEN_H, { duration: 240 }, (done) => {
                if (done) runOnJS(setMounted)(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const pan = Gesture.Pan()
        .onUpdate((e) => { translateY.value = Math.max(0, e.translationY); })
        .onEnd((e) => {
            if (e.translationY > 120 || e.velocityY > 900) runOnJS(onClose)();
            else translateY.value = withSpring(0, { damping: 20 });
        });

    const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
    const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.6 }));

    if (!mounted) return null;

    return (
        <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' }, backdropStyle]}>
                    <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
                </Animated.View>
                <Animated.View style={[{
                    position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: SCREEN_H * maxHeight,
                    backgroundColor: theme.canvas, borderTopLeftRadius: 32, borderTopRightRadius: 32,
                    paddingBottom: insets.bottom + 12,
                }, sheetStyle]}>
                    <GestureDetector gesture={pan}>
                        <View style={{ paddingTop: 12, paddingBottom: 6, alignItems: 'center' }}>
                            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: theme.surface3 }} />
                            {title ? <Text weight="bold" style={{ color: theme.text, fontSize: 18, marginTop: 14 }}>{title}</Text> : null}
                        </View>
                    </GestureDetector>
                    <View style={{ flexShrink: 1 }}>{children}</View>
                    {footer ? <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>{footer}</View> : null}
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
}
