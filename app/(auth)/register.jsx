import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import { theme } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;

/** Live checklist under the password field */
const Rule = ({ ok, label }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={15} color={ok ? theme.accentDeep : theme.muted} />
        <Text style={{ color: ok ? theme.text : theme.muted, fontSize: 12 }}>{label}</Text>
    </View>
);

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { isLoading, register } = useAuthStore();

    const clear = (field) => errors[field] && setErrors(e => ({ ...e, [field]: null }));

    const validate = () => {
        const next = {};
        const u = username.trim();
        if (u.length < 3) next.username = 'Username must contain at least 3 characters';
        else if (u.length > 20) next.username = 'Username cannot exceed 20 characters';
        if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address';
        if (!PASSWORD_RE.test(password)) next.password = 'At least 8 characters with one letter and one number';
        if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSignup = async () => {
        if (!validate()) return;
        const result = await register(username.trim(), email.trim(), password, confirmPassword);
        if (!result.success) {
            dialog.alert("Sign up failed", result.error);
        } else {
            toast.success('Welcome to RevZone!');
        }
    };

    return (
        <AuthLayout active="register" title="Create Account" subtitle="Rent cars, or list yours and start earning when you don't use it.">
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ gap: 14 }}>
                <TextField label="Username" icon="person-outline" placeholder="Choose a username" value={username}
                    onChangeText={(v) => { setUsername(v); clear('username'); }}
                    autoCapitalize="none" error={errors.username} />
                <TextField label="Email address" icon="mail-outline" placeholder="you@example.com" value={email}
                    onChangeText={(v) => { setEmail(v); clear('email'); }}
                    autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={errors.email} />
                <TextField label="Password" icon="lock-closed-outline" placeholder="Create a password" value={password}
                    onChangeText={(v) => { setPassword(v); clear('password'); }}
                    secure autoComplete="new-password" error={errors.password} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginLeft: 6 }}>
                    <Rule ok={password.length >= 8} label="8+ characters" />
                    <Rule ok={/[A-Za-z]/.test(password)} label="A letter" />
                    <Rule ok={/\d/.test(password)} label="A number" />
                </View>
                <TextField label="Confirm password" icon="shield-checkmark-outline" placeholder="Repeat your password" value={confirmPassword}
                    onChangeText={(v) => { setConfirmPassword(v); clear('confirmPassword'); }}
                    secure error={errors.confirmPassword} onSubmitEditing={handleSignup} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ marginTop: 4 }}>
                <Button title="Create Account" size="lg" loading={isLoading} onPress={handleSignup} />
            </Animated.View>
        </AuthLayout>
    );
}
