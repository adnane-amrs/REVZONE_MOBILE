import { TextInput, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image} from 'react-native';
import Spacer from '../../components/Spacer'
import { Link, useRouter } from "expo-router"
import { useState } from 'react'
import {Ionicons} from '@expo/vector-icons'
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';


const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    
    const {isLoading, register} = useAuthStore();
    const router = useRouter();

    
    const handleSignup = async () => {
        // Validation des champs vides
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        // Validation du nom d'utilisateur
        if (username.length < 3) {
            Alert.alert("Error", "Username must contain at least 3 characters");
            return;
        }

        if (username.length > 20) {
            Alert.alert("Error", "Username cannot exceed 20 characters");
            return;
        }

        // Validation du format email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        // Validation de la force du mot de passe
        if (password.length < 8) {
            Alert.alert("Error", "Password must contain at least 8 characters");
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            Alert.alert("Error", "Password must contain at least one letter and one number");
            return;
        }

        // Validation de la correspondance des mots de passe
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        const result = await register(username, email, password, confirmPassword);
        if(!result.success) {
            Alert.alert("Error", result.error);
        } else {
            Alert.alert(
                "Success", 
                "Account created successfully! Please login.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("./login")
                    }
                ]
            );
        }
    }

    return (
        <SafeAreaView className='flex-1 justify-center bg-white'>
            <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className='flex-1 justify-center'>
                <View className='items-center'>
                    <Image 
                        source={require('../../assets/images/REVZONE.png')} // Adjust the path as necessary
                        alt='RevZone Logo'
                        width={20}
                        height={20} 
                        className='w-64 h-48 bg-transparent' // Adjust size as needed
                    />
                    <Text className='font-bold text-4xl leading-relaxed'>Create An Account</Text>
                    <Text className='text-gray-600 leading-5 px-10 text-center'>Welcome To <Text className="text-primary1 font-bold">REVZONE</Text> create your account and Join our community now</Text>
                </View>
                <Spacer height={30}/>

                <View className='items-center'>

                    <View className='w-[90%]'>
                        <View className='flex-row items-center bg-gray-200 rounded-md py-1'>
                            <Ionicons name="person-outline" size={24} color="#4042e2" style={{ marginLeft: 10 }} />
                            <TextInput 
                                className='p-4 flex-1' 
                                placeholder='Enter your Username'
                                value={username} 
                                onChangeText={setUsername}
                            />
                        </View>
                    </View>

                    <View className='w-[90%] mt-5'>
                        <View className='flex-row items-center bg-gray-200 rounded-md py-1'>
                            <Ionicons name="mail-outline" size={24} color="#4042e2" style={{ marginLeft: 10 }} />
                            <TextInput 
                                className='p-4 flex-1' 
                                placeholder='Enter your Email' 
                                value={email} 
                                onChangeText={setEmail}
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
                                value={password}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="mr-4">
                                <Ionicons name={!showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className='w-[90%] mt-5'>
                        <View className='flex-row items-center bg-gray-200 rounded-md py-1'>
                            <Ionicons name="lock-closed-outline" size={24} color="#4042e2" style={{ marginLeft: 10 }} />
                            <TextInput 
                                className='p-4 flex-1' 
                                placeholder='Confirm your Password'
                                onChangeText={setConfirmPassword}
                                value={confirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="mr-4">
                                <Ionicons name={!showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                <TouchableOpacity  className="items-center " onPress={handleSignup} disabled={isLoading} >
                {isLoading ? (
                    <View className="bg-primary1 text-xl font-bold text-white px-5 py-[12px] w-[90%] text-center m-2 rounded-md">
                        <ActivityIndicator color={Colors.secondary2} />
                    </View>
                ) : (
                    <View className="bg-primary1 text-xl font-bold text-white px-5 py-[12px] w-[90%] text-center m-2 rounded-md">
                        <View className='flex-row items-center justify-center'>
                            <Ionicons name='person-add-outline' size={22} color={Colors.secondary2} />
                            <Text className='text-white text-center text-lg font-bold'>  Sign up</Text>
                        </View>
                    </View>
                )}
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
