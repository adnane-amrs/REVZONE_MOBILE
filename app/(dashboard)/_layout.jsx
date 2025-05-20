import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Ionicons } from '@expo/vector-icons';


const DashboardLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Tabs 
            screenOptions={{
            headerShown: false, 
            tabBarStyle: {
                // backgroundColor: '#f9fafb',  // Tailwind gray-50
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb',  // Tailwind gray-200
                height: 90,
                paddingTop: 10,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
            }
            }}>
                <Tabs.Screen name='profile' options={{title: 'Profile', tabBarIcon: ({focused}) => (
                    <Ionicons 
                    size={24}
                    name={focused ? 'person': 'person-outline'}
                    color = {focused ? theme.iconColorFocused : theme.iconColor}
                    />
                ) }}/>
                <Tabs.Screen name='cars' options={{title: 'cars', tabBarIcon: ({focused}) => (
                    <Ionicons 
                    size={24}
                    name= {focused ? 'car': 'car-outline'}
                    color = {focused ? theme.iconColorFocused : theme.iconColor}
                    />
                )}}/>
                <Tabs.Screen name='create' options={{title: 'create',tabBarIcon: ({focused}) => (
                    <Ionicons 
                    size={24}
                    name={focused ? 'create' : 'create-outline'}
                    color = {focused ? theme.iconColorFocused : theme.iconColor}
                    />
                )}}/>
            </Tabs>
    )
}

export default DashboardLayout

// const styles = StyleSheet.create({})