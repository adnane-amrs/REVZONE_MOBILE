import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './AppText';
import { useToastStore } from '../../store/toastStore';
import { theme } from '../../constants/theme';

const ICONS = {
    success: { name: 'checkmark-circle', color: theme.success },
    error: { name: 'alert-circle', color: theme.danger },
    info: { name: 'information-circle', color: theme.info },
};

/** Renders the toasts on top of every screen. Mounted once in the root layout. */
export default function ToastHost() {
    const insets = useSafeAreaInsets();
    const { toasts, dismiss } = useToastStore();

    return (
        <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, gap: 8 }}>
            {toasts.map(t => (
                <Animated.View key={t.id} entering={FadeInUp.springify().damping(16)} exiting={FadeOutUp.duration(200)} layout={LinearTransition}>
                    <Pressable
                        onPress={() => dismiss(t.id)}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.surface,
                            borderRadius: 999, paddingVertical: 14, paddingHorizontal: 18, borderWidth: 1, borderColor: theme.line,
                            shadowColor: theme.ink, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
                        }}
                    >
                        <Ionicons name={ICONS[t.type]?.name} size={22} color={ICONS[t.type]?.color} />
                        <Text weight="semibold" style={{ color: theme.text, fontSize: 14, flex: 1 }}>{t.message}</Text>
                    </Pressable>
                </Animated.View>
            ))}
        </View>
    );
}
