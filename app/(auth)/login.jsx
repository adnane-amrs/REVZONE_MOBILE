import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Text from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import PressableScale from '../../components/ui/PressableScale';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import { theme } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const { isLoading, login } = useAuthStore();

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = compatible && await LocalAuthentication.isEnrolledAsync();
            setIsBiometricSupported(!!enrolled);
        })();
    }, []);

    const validate = () => {
        const next = {};
        if (!email.trim()) next.email = 'Enter your email';
        else if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address';
        if (!password) next.password = 'Enter your password';
        else if (password.length < 6) next.password = 'Password must contain at least 6 characters';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        const result = await login(email.trim(), password);
        if (!result.success) {
            dialog.alert("Login failed", result.error);
        } else {
            await AsyncStorage.setItem('userCredentials', JSON.stringify({ email: email.trim(), password }));
            toast.success('Welcome back!');
        }
    };

    const handleBiometricAuth = async () => {
        try {
            const savedCredentials = await AsyncStorage.getItem('userCredentials');
            if (!savedCredentials) {
                dialog.alert('No saved login', 'Log in once with your email and password to enable fingerprint login.');
                return;
            }
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Log in to RevZone',
                fallbackLabel: 'Use password',
                disableDeviceFallback: false,
            });
            if (result.success) {
                const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
                const loginResult = await login(savedEmail, savedPassword);
                if (!loginResult.success) dialog.alert("Login failed", loginResult.error);
                else toast.success('Welcome back!');
            }
        } catch {
            dialog.alert('Error', 'Biometric authentication failed');
        }
    };

    return (
        <AuthLayout active="login" title="Welcome Back!" subtitle="Rent cars from local owners, or manage your own listings, anytime.">
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ gap: 14 }}>
                <TextField
                    label="Email address"
                    icon="mail-outline"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={(v) => { setEmail(v); if (errors.email) setErrors(e => ({ ...e, email: null })); }}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    error={errors.email}
                />
                <TextField
                    label="Password"
                    icon="lock-closed-outline"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(v) => { setPassword(v); if (errors.password) setErrors(e => ({ ...e, password: null })); }}
                    secure
                    autoComplete="password"
                    error={errors.password}
                    onSubmitEditing={handleLogin}
                />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 4 }}>
                <View style={{ flex: 1 }}>
                    <Button title="Log In" size="lg" loading={isLoading} onPress={handleLogin} />
                </View>
                {isBiometricSupported ? (
                    <PressableScale
                        onPress={handleBiometricAuth}
                        haptic
                        accessibilityLabel="Log in with fingerprint"
                        style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Ionicons name="finger-print" size={28} color={theme.text} />
                    </PressableScale>
                ) : null}
            </Animated.View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 4 }}>
                <Ionicons name="shield-checkmark-outline" size={14} color={theme.muted} />
                <Text style={{ color: theme.muted, fontSize: 12 }}>Your session is protected with secure tokens</Text>
            </View>
        </AuthLayout>
    );
}
