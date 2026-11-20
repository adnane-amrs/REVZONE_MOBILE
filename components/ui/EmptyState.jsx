import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import Text from './AppText';
import Button from './Button';
import { theme } from '../../constants/theme';

/** Friendly message for empty lists, with an optional action. */
export default function EmptyState({ icon = 'car-sport-outline', title, message, actionLabel, onAction, dark = true }) {
    return (
        <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 12 }}>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: theme.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Ionicons name={icon} size={38} color={theme.iconFg} />
            </View>
            <Text weight="bold" style={{ color: theme.text, fontSize: 18, textAlign: 'center' }}>{title}</Text>
            {message ? <Text style={{ color: theme.muted, fontSize: 14, textAlign: 'center', lineHeight: 21 }}>{message}</Text> : null}
            {actionLabel ? (
                <View style={{ marginTop: 10, alignSelf: 'stretch' }}>
                    <Button title={actionLabel} onPress={onAction} />
                </View>
            ) : null}
        </Animated.View>
    );
}
