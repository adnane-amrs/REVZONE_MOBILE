import { Stack } from 'expo-router';
import { theme } from '../../constants/theme';

const AuthLayout = () => (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.canvas }, animation: 'slide_from_right' }}>
        <Stack.Screen name='login' />
        <Stack.Screen name='register' />
    </Stack>
);

export default AuthLayout;
