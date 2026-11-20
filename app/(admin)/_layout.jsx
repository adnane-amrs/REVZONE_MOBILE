import { Stack } from 'expo-router';
import { theme } from '../../constants/theme';

const AdminLayout = () => (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.canvas }, animation: 'slide_from_right' }}>
        <Stack.Screen name='dashboard' />
        <Stack.Screen name='users' />
        <Stack.Screen name='listings' />
        <Stack.Screen name='licenses' />
    </Stack>
);

export default AdminLayout;
