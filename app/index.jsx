import { Link } from "expo-router"
import { ImageBackground, SafeAreaView, Text, View } from "react-native"
import Welcome from "../assets/images/car1.jpeg"
import { useAuthStore } from '../store/authStore';

export default function Index(){
    const { user, token } = useAuthStore();
    const isLoggedIn = user && token;

    return(
        <SafeAreaView className="flex-1">
            <ImageBackground source={Welcome} resizeMode="cover" className="flex-1 w-[100%] h-[100%] bg-cover pt-[65px] pb-10">
                <View className="flex-1 justify-between"> 
                    <View className="mt-50  px-5 ">
                        <Text className="text-white text-5xl font-bold ">WELCOME TO<Text className="text-primary2 "> REVZONE</Text></Text>
                        <Text className="text-gray-300 text-lg">
                        A social hub where car enthusiasts connect.
                        </Text>
                    </View>

                    <View className="w-[100%] flex flex-col justify-center items-center  gap-1">
                        {isLoggedIn ? (
                            <>
                                <Link href="/(tabs)" className="bg-primary1 text-xl font-bold text-white px-5 py-4 w-[90%] text-center m-2 rounded-full">
                                    Go to Home
                                </Link>
                                <Link href="/(tabs)/profile" className="bg-white text-xl font-bold text-primary1 px-5 py-4 w-[90%] text-center rounded-full">
                                    View Profile
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/(auth)/login" className="bg-primary1 text-xl font-bold text-white px-5 py-4 w-[90%] text-center m-2 rounded-full">
                                    LOGIN
                                </Link>
                                <Link href="/(auth)/register" className="bg-white text-xl font-bold text-dark px-5 py-4 w-[90%] text-center rounded-full">
                                    CREATE AN ACCOUNT
                                </Link>
                            </>
                        )}
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    )
} 