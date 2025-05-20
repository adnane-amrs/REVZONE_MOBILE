import { Link } from "expo-router";
import { StyleSheet, TextInput, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import { useState } from 'react';
import Spacer from "../../components/Spacer";
import {Ionicons} from '@expo/vector-icons'


export default function Login(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)


    const [isFocused, setIsFocused] = useState(false);
    
    const handleLogin = () => {
        
    }

    return (
        <SafeAreaView className='flex-1 justify-center'>
            <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className='flex-1 justify-center'>
                <View className='items-center'>
                <Text className='font-bold text-4xl'>Sign In Your Account</Text>
                <Text className='text-lg text-gray-700'>Log in to your account</Text>
                </View>
                <Spacer height={30}/>

                <View className='items-center'>

                    <TextInput className='bg-gray-300 rounded-full p-4 my-2 w-[90%] h-[50px]' 
                    placeholder='Enter your Email'/>
                    

                    <View className='w-[90%] ralative'>
                        <TextInput className='bg-gray-300 rounded-full p-4 my-2  h-[50px] ' 
                        placeholder='Enter your Password'
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        />

                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-[107px]">
                            <Ionicons name={!showPassword ? 'eye-off' : 'eye'} size={24} color="black" className='top-[89px] text-primary1' />
                        </TouchableOpacity>
                    </View>

                </View>

                <View className="items-end mr-6">
                    <Text className=" text-primary1 font-semibold">Forgot password? </Text>
                </View>

                <TouchableOpacity  className="items-center " disabled={isLoading} onPress={handleLogin} >
                    {isLoading ? (<ActivityIndicator color='#fff' />) : (<Text className="bg-primary1 text-xl font-bold text-white px-5 py-[12px] w-[90%] text-center m-2 rounded-full ">Login</Text>)}
                    
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
