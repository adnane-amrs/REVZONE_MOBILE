import { Link } from "expo-router"
import { ImageBackground, SafeAreaView, Text, View } from "react-native"
import Welcome from "../assets/images/car1.jpeg"

export default function Index(){
    return(
        
        <SafeAreaView className="flex-1">
            <ImageBackground source={Welcome} resizeMode="cover" className="flex-1 w-[100%] h-[100%] bg-cover pt-[60px] pb-10">
                <View className="flex-1 justify-between"> 
                    <View className="mt-50  px-5 ">
                        <Text className="text-white text-5xl font-bold ">Welcome to<Text className="text-primary2 "> REVZONE</Text></Text>
                        <Text className="text-gray-300 text-lg">
                            A social space for car enthusiasts to connect, share, and celebrate the rides they love.
                        </Text>
                    </View>

                    <View className="w-[100%] flex flex-col justify-center items-center  gap-1">
                        <Link href="./login" className="bg-primary1 text-xl font-bold text-white px-5 py-4 w-[90%] text-center m-2 rounded-full">Login</Link>
                        <Link href="./register" className="bg-white text-xl font-bold text-  px-5 py-4 w-[90%] text-center  rounded-full">Create an Account</Link> 
                        {/* <Link href="./profile" className="bg-white text-xl font-bold text-  px-5 py-4 w-[90%] text-center  rounded-full">Profile</Link>  */}
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    )
}
