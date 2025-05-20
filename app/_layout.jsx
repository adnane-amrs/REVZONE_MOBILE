import { Stack } from 'expo-router';
import "../app/globals.css";

const RootLayout = () => {


    return (
        <Stack screenOptions={{
        }}>
            <Stack.Screen name='index' options={{headerShown: false, title: 'Home'}}/>
            <Stack.Screen name='(auth)' options={{ headerShown: false }}/>
            <Stack.Screen name='(dashboard)' options={{headerShown: false}}/>
            
        </Stack>    
    )
}

export default RootLayout
