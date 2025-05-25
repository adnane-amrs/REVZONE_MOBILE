import { StyleSheet, TextInput, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert} from 'react-native';
import Spacer from '../../components/Spacer'
import { Link, useRouter } from "expo-router"
import { useState } from 'react'
import {Ionicons} from '@expo/vector-icons'
import { useAuthStore } from '../../store/authStore';

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    
    const {user, isLoading, register, token} = useAuthStore();
    const router = useRouter();

    
    const handleSignup = async () => {
        const result = await register(username, email, password, confirmPassword);
        if(!result.success) {
            Alert.alert("Error", result.error);
        } else {
            Alert.alert("Success", "Account created successfully! Please login.");
            router.replace("./login");
        }
    }

    return (
        <SafeAreaView className='flex-1 justify-center'>
            <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className='flex-1 justify-center'>
                <View className='items-center'>
                <Text className='font-bold text-4xl leading-relaxed'>Create An Account</Text>
                <Text className='text-gray-600 leading-5 px-10 text-center'>Welcome To <Text className="text-primary1 font-bold">REVZONE</Text> create your account and Join our community now</Text>
                </View>
                <Spacer height={30}/>

                <View className='items-center'>

                    <TextInput className='bg-gray-300 rounded-full p-4 my-2 w-[90%] h-[52px]' 
                    placeholder='Enter your Username'
                    value={username} onChangeText={setUsername}/>

                    <TextInput className='bg-gray-300 rounded-full p-4 my-2 w-[90%] h-[52px]' 
                    placeholder='Enter your Email' value={email} onChangeText={setEmail}/>
                    

                    <View className='w-[90%] ralative'>
                        <TextInput className='bg-gray-300 rounded-full p-4 my-2  h-[52px] ' 
                        placeholder='Enter your Password'
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={!showPassword}
                        />

                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-[107px]">
                            <Ionicons name={!showPassword ? 'eye-off' : 'eye'} size={24} color="black" className='top-[89px] text-primary1' />
                        </TouchableOpacity>
                    </View>

                    <View className='w-[90%] ralative'>
                        <TextInput className='bg-gray-300 rounded-full p-4 my-2  h-[52px] ' 
                        placeholder='Confirm your Password'
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        />

                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 bottom-[107px]">
                            <Ionicons name={!showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="black" className='top-[89px] text-primary1' />
                        </TouchableOpacity>
                    </View>

                    {/* <Text className='text-gray-600 text-sm px-4 mt-2'>
                        Password must be at least 8 characters long and contain:
                        {'\n'}- At least one letter
                        {'\n'}- At least one number
                    </Text> */}

                </View>

                <View className="items-end mr-6">
                    <Text className=" text-primary1 font-semibold">Forgot password? </Text>
                </View>

                <TouchableOpacity  className="items-center " onPress={handleSignup} disabled={isLoading} >
                    {isLoading ? (<ActivityIndicator color='#fff' />) : (<Text className="bg-primary1 text-xl font-bold text-white px-5 py-[12px] w-[90%] text-center m-2 rounded-full ">Sign up</Text>)}
                </TouchableOpacity>

                <Spacer height={10}/>

                <View className="flex-row gap-2 justify-center items-center">
                    <Text className='text-lg'>Already Have an Account?</Text>
                    <Link href='./login' asChild>
                        <TouchableOpacity> 
                            <Text className='underline text-primary1 font-bold'>Log In</Text>
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
export default Register

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
});
