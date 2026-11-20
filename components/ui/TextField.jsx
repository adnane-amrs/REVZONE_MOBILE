import { forwardRef, useState } from 'react';
import { TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './AppText';
import { useKeyboardReveal } from './KeyboardScroll';
import { theme, fonts } from '../../constants/theme';

/**
 * Text input from the design system. `dark` for inputs on the main background (white field).
 * `secure` adds the show/hide password eye.
 */
const TextField = forwardRef(function TextField({
    label, icon, error, hint, secure = false, dark = true, multiline = false, suffix, style, inputStyle, onFocus, onBlur, ...props
}, ref) {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(secure);
    // Inside a KeyboardScroll: scroll this field above the keyboard when it gets focus
    const reveal = useKeyboardReveal();

    const bg = theme.paper;
    const fg = theme.text;
    const borderColor = error ? theme.danger : focused ? theme.accent : theme.line;

    return (
        <View style={[{ gap: 8 }, style]}>
            {label ? <Text weight="semibold" style={{ color: theme.textSoft, fontSize: 13 }}>{label}</Text> : null}
            <View style={{
                flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', gap: 10,
                backgroundColor: bg, borderRadius: multiline ? 22 : 999, borderWidth: 1.5, borderColor,
                paddingHorizontal: 18, minHeight: 56, paddingVertical: multiline ? 14 : 0,
            }}>
                {icon ? <Ionicons name={icon} size={20} color={focused ? theme.accentDeep : theme.muted} style={multiline ? { marginTop: 2 } : null} /> : null}
                <TextInput
                    ref={ref}
                    placeholderTextColor={theme.muted}
                    selectionColor={theme.accentDeep}
                    secureTextEntry={hidden}
                    multiline={multiline}
                    onFocus={(e) => { setFocused(true); reveal?.(); onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); onBlur?.(e); }}
                    style={[{
                        flex: 1, color: fg, fontFamily: fonts.medium, fontSize: 15,
                        paddingVertical: multiline ? 0 : 14, minHeight: multiline ? 96 : undefined,
                        textAlignVertical: multiline ? 'top' : 'center',
                    }, inputStyle]}
                    {...props}
                />
                {suffix ? <Text weight="semibold" style={{ color: theme.muted, fontSize: 14 }}>{suffix}</Text> : null}
                {secure ? (
                    <Pressable onPress={() => setHidden(h => !h)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
                        <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.muted} />
                    </Pressable>
                ) : null}
            </View>
            {error ? <Text style={{ color: theme.danger, fontSize: 12, marginLeft: 6 }}>{error}</Text>
                : hint ? <Text style={{ color: theme.muted, fontSize: 12, marginLeft: 6 }}>{hint}</Text> : null}
        </View>
    );
});

export default TextField;
