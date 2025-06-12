import { Link, useRouter } from "expo-router";
import { StyleSheet, TextInput, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image} from 'react-native';
import { useState, useEffect } from 'react';
import Spacer from "../../components/Spacer";
import {Ionicons} from '@expo/vector-icons'
import { useAuthStore } from '../../store/authStore';
import { Colors } from "../../constants/Colors";
import {logo} from '../../assets/images/REVZONE.png'; // Adjust the path as necessary

export default function Login(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const {user, isLoading, login} = useAuthStore();
    const router = useRouter();
    
    const handleLogin = async () => {
        console.log("Attempting login with email:", email);
        const result = await login(email, password);
        console.log("Login result:", result);
        if(!result.success) {
            Alert.alert("Error", result.error);
        } else {
            console.log("Login successful, navigating to profile");
            router.replace("/(tabs)/profile");
        }
    }
    

    return (
        <SafeAreaView className='flex-1 justify-center bg-white'>
            <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} 
            className='flex-1 justify-center'>
                {/* Logo image */}
                <View className='items-center'>
                    <Image 
                        source={require('../../assets/images/REVZONE.png')} // Adjust the path as necessary
                        alt='RevZone Logo'
                        width={20}
                        height={20} 
                        className='w-64 h-52 bg-transparent' // Adjust size as needed
                    />
                    <Text className='font-bold text-4xl'>Sign In Your Account</Text>
                    <Text className='text-lg text-gray-700'>Log in to your account</Text>
                </View>
                <Spacer height={30}/>

                <View className='items-center'>

                    <View className='w-[90%]'>
                        <View className='flex-row items-center bg-gray-200 rounded-md py-1'>
                            <Ionicons name="mail-outline" size={24} color="#4042e2" style={{ marginLeft: 10 }} />
                            <TextInput 
                                className='p-4 flex-1' 
                                placeholder='Enter your Email' 
                                onChangeText={setEmail} 
                                value={email} 
                            />
                        </View>
                    </View>

                    <View className='w-[90%] mt-5'>
                        <View className='flex-row items-center bg-gray-200 rounded-md py-1'>
                            <Ionicons name="lock-closed-outline" size={24} color="#4042e2" style={{ marginLeft: 10 }} />
                            <TextInput 
                                className='p-4 flex-1' 
                                placeholder='Enter your Password'
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                value={password}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="mr-4">
                                <Ionicons name={!showPassword ? 'eye-off' : 'eye'} size={24} color="#4042e2" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                <View className="items-end mr-6">
                    <Text className=" text-primary1 font-semibold">Forgot password?</Text>
                </View>

                <TouchableOpacity  className="items-center " disabled={isLoading} onPress={handleLogin} >
                {isLoading ? (
                    <View className="bg-primary1 text-xl font-bold text-white px-5 py-[12px] w-[90%] text-center m-2 rounded-md">
                        <ActivityIndicator color={Colors.secondary2} />
                    </View>
                ) : (
                    <View className="bg-primary1 text-xl font-bold text-white px-5 py-[12px] w-[90%] text-center m-2 rounded-md">
                        <View className='flex-row items-center justify-center'>
                            <Ionicons name='log-in-outline' size={24} color={Colors.secondary2} />
                            <Text className='text-white text-center text-lg font-bold'>  Login</Text>
                        </View>
                    </View>
                )}
                </TouchableOpacity>

                <Spacer height={10}/>

                <View className="flex-row gap-2 justify-center items-center">
                    <Text className='text-lg'>Do not Have an Account?</Text>
                    <Link href='./register' asChild>
                        <TouchableOpacity>
                            <Text className='underline text-primary1 font-bold'>Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                
            </KeyboardAvoidingView>
            {/* Footer */}
            <View className='items-center mb-2'>
                <Text className='text-gray-500'>{'\u00A9'}Copyright, All Rights Reserved</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        height: 55,
        width: '90%',
        padding: 15, // internal spacing (inside the input)         
        marginBottom: 10, // external spacing (outside the input)
    },
    inputFocused: {
        borderColor: '#007AFF',
        backgroundColor: 'gray-200',
    },
});
