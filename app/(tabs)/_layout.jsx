import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors as AppColors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabsLayout = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tabs 
            screenOptions={{
                headerShown: false,
                headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: AppColors.primary1,
                },
                tabBarStyle: {
                    paddingTop: 10,
                    position: 'absolute',
                    // bottom: insets.bottom,
                    left: 20,
                    right: 20,
                    elevation: 0,
                    backgroundColor: AppColors.dark,
                    
                    height: 70,
                    shadowColor: AppColors.primary1,
                    shadowOffset: {
                        width: 0,
                        height: 10,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: AppColors.primary1,
                tabBarInactiveTintColor: AppColors.secondary1,
            }}>
            <Tabs.Screen 
                name='index' 
                options={{
                    tabBarIcon: ({focused}) => (
                        <View className="flex items-center justify-center">
                            <View className={`flex items-center justify-center w-10 h-10 text-white rounded-full ${focused ? 'bg-primary1' : 'bg-transparent'}`}>
                                <Ionicons 
                                    size={24}
                                    name={focused ? 'home' : 'home-outline'}
                                    color={focused ? AppColors.secondary2 : AppColors.secondary1}
                                />
                            </View>
                        </View>
                    )
                }}
            />
            
            <Tabs.Screen 
                name='create' 
                options={{
                    tabBarIcon: ({focused}) => (
                        <View className="flex items-center justify-center">
                            <View className={`flex items-center justify-center w-10 h-10 text-white rounded-full ${focused ? 'bg-primary1' : 'bg-transparent'}`}>
                                <Ionicons 
                                    size={24}
                                    name={focused ? 'add-circle' : 'add-circle-outline'}
                                    color={focused ? AppColors.secondary2 : AppColors.secondary1}
                                />
                            </View>
                        </View>
                    )
                }}
            />
            <Tabs.Screen 
                name='profile' 
                options={{
                    tabBarIcon: ({focused}) => (
                        <View className="flex items-center justify-center">
                            <View className={`flex items-center justify-center w-10 h-10 text-white rounded-full ${focused ? 'bg-primary1' : 'bg-transparent'}`}>
                                <Ionicons 
                                    size={24}
                                    name={focused ? 'person' : 'person-outline'}
                                    color={focused ? AppColors.secondary2 : AppColors.secondary1}
                                />
                            </View>
                        </View>
                    )
                }}
            />
        </Tabs>
    )
}

export default TabsLayout

// const styles = StyleSheet.create({})