import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Text from './AppText';
import PressableScale from './PressableScale';
import { useDialogStore } from '../../store/dialogStore';
import { theme } from '../../constants/theme';

/** Button colors by Alert-style button style: cancel, destructive or default (primary). */
const buttonColors = (style) => {
    if (style === 'cancel') return { bg: theme.surface2, fg: theme.text };
    if (style === 'destructive') return { bg: theme.danger, fg: '#FFFFFF' };
    return { bg: theme.accent, fg: theme.onAccent };
};

function DialogButton({ button, onPress, flex }) {
    const c = buttonColors(button.style);
    return (
        <PressableScale onPress={onPress} haptic accessibilityRole="button" accessibilityLabel={button.text}
            style={{ flex: flex ? 1 : undefined, height: 50, borderRadius: 999, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
            <Text weight="bold" numberOfLines={1} style={{ color: c.fg, fontSize: 15 }}>{button.text}</Text>
        </PressableScale>
    );
}

/**
 * Renders the dialog requested with dialog.alert(): a rounded card in the app's colors
 * (light and dark versions), with an icon, title, message and pill buttons.
 * Mounted once in the root layout.
 */
export default function DialogHost() {
    const current = useDialogStore(s => s.current);
    const hide = useDialogStore(s => s.hide);
    if (!current) return null;

    const { title, message, buttons } = current;
    const destructive = buttons.some(b => b.style === 'destructive');
    const icon = current.icon || (destructive ? 'alert-circle' : buttons.length > 1 ? 'help-circle' : 'information-circle');
    const cancel = buttons.find(b => b.style === 'cancel');
    // Two buttons side by side (cancel first), more than two stacked
    const ordered = buttons.length === 2 && cancel ? [cancel, buttons.find(b => b !== cancel)] : buttons;
    const stacked = ordered.length > 2;

    const press = (button) => {
        if (button.style === 'destructive') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        hide();
        button.onPress?.();
    };
    // Back button / tap outside: same as Cancel (or closes a single-button dialog)
    const dismiss = () => {
        if (cancel) press(cancel);
        else if (buttons.length === 1) press(buttons[0]);
    };

    return (
        <Modal visible transparent statusBarTranslucent animationType="fade" onRequestClose={dismiss}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
                <Pressable onPress={dismiss} accessibilityLabel="Close"
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} />
                <Animated.View key={current.key} entering={ZoomIn.springify().damping(16).stiffness(220)}
                    style={{
                        width: '100%', maxWidth: 380, backgroundColor: theme.paper, borderRadius: 30, padding: 22, paddingTop: 26, gap: 18,
                        borderWidth: theme.mode === 'dark' ? 1 : 0, borderColor: theme.line,
                        shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 16,
                    }}>
                    <Animated.View entering={FadeIn.delay(80).duration(250)} style={{ alignItems: 'center', gap: 10 }}>
                        <View style={{
                            width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
                            backgroundColor: destructive ? '#FF5D5D1F' : theme.iconBg,
                        }}>
                            <Ionicons name={icon} size={28} color={destructive ? theme.danger : theme.iconFg} />
                        </View>
                        {title ? <Text weight="extrabold" style={{ color: theme.text, fontSize: 20, textAlign: 'center' }}>{title}</Text> : null}
                        {message ? <Text style={{ color: theme.textSoft, fontSize: 14, lineHeight: 21, textAlign: 'center' }}>{message}</Text> : null}
                    </Animated.View>

                    <View style={{ flexDirection: stacked ? 'column' : 'row', gap: 10 }}>
                        {ordered.map((b, i) => <DialogButton key={`${b.text}-${i}`} button={b} flex={!stacked} onPress={() => press(b)} />)}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
