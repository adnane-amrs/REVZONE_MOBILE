import { StyleSheet, Text, View, TextInput, Platform, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native';
import Spacer from '../../components/Spacer';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { API_URL } from '../../constants/api';

const Create = () => {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [rating, setRating] = useState(0);
    const [image, setImage] = useState(null); // to display the image
    const [image64, setImage64] = useState([]);   // turn image to text
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {token} = useAuthStore();

    console.log(token);

    const handleSubmit = async () => {
        if(!title || !caption || !rating || !image64) {
            Alert.alert("Error", "Please fill all the fields");
            return;
        }

        if (!token) {
            console.log("No token found in state");
            Alert.alert("Error", "You must be logged in to create a post. Please login again.");
            router.replace("/(auth)/login");
            return;
        }

        try {
            setIsLoading(true);
            
            // Prepare image for Cloudinary
            let base64Image = image64;
            // Remove any existing data URL prefix
            if (base64Image.includes('base64,')) {
                base64Image = base64Image.split('base64,')[1];
            }

            // Add proper data URL prefix for Cloudinary
            const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

            console.log("Making request to:", `${API_URL}/cars`);
            console.log("Image data length:", imageDataUrl.length);

            const response = await fetch(`${API_URL}/cars`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    caption,
                    rate: rating.toString(),
                    image: imageDataUrl,
                }),
            });

            console.log("Response status:", response.status);
            const responseText = await response.text();
            console.log("Raw response:", responseText);

            let data;
            try {
                data = JSON.parse(responseText);
                console.log("Parsed response data:", data);
            } catch (parseError) {
                console.log("Failed to parse response as JSON:", parseError);
                throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
            }

            if(!response.ok) {
                if (response.status === 401) {
                    Alert.alert("Session Expired", "Your session has expired. Please login again.");
                    router.replace("/(auth)/login");
                } else if (response.status === 400) {
                    // Handle validation errors
                    const errorMessage = data.missing 
                        ? `Missing fields: ${Object.entries(data.missing)
                            .filter(([_, missing]) => missing)
                            .map(([field]) => field)
                            .join(', ')}`
                        : data.message;
                    throw new Error(errorMessage);
                } else {
                    throw new Error(data.message || `Server error: ${response.status}`);
                }
                return;
            }

            Alert.alert("Success", "Car recommendation shared successfully");

            setTitle('');
            setCaption('');
            setRating(3);
            setImage(null);
            setImage64(null);

            router.push('/');

        } catch (error) {
            console.log("Error creating post:", error);
            Alert.alert("Error", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const pickImage = async () => {
        try {
            // Request permissions for both camera and media library
            if (Platform.OS !== 'web') {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                
                if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
                    Alert.alert(
                        'Permission Required',
                        'Please grant camera and photo library permissions to upload images.',
                        [{ text: 'OK' }]
                    );
                    return;
                }
            }

            // Show options to choose between camera and gallery
            Alert.alert(
                'Select Image Source',
                'Choose where to get the image from',
                [
                    {
                        text: 'Camera',
                        onPress: async () => {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.7,  // Increased quality for better image
                                base64: true,
                            });
                            handleImageResult(result);
                        }
                    },
                    {
                        text: 'Gallery',
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.7,  // Increased quality for better image
                                base64: true,
                            });
                            handleImageResult(result);
                        }
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ]
            );
        } catch (error) {
            console.log("Error picking image", error);
            Alert.alert("Error", "Error picking image");
        }
    }

    const handleImageResult = async (result) => {
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            
            if (result.assets[0].base64) {
                setImage64(result.assets[0].base64);
            } else {
                // Convert the image to base64 if not already provided
                try {
                    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                        encoding: FileSystem.EncodingType.Base64
                    });
                    setImage64(base64);
                } catch (error) {
                    console.log("Error converting image to base64:", error);
                    Alert.alert("Error", "Failed to process image. Please try again.");
                }
            }
        }
    }
    
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className='flex-1 bg-secondary1/15'>

            <View className='flex-1' style={{ paddingTop: insets.top }}>
                <ScrollView 
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className='px-5 bg-white rounded-md p-5 w-[95%] shadow-sm'>
                        <Text className='text-3xl font-bold  text-center text-primary1'>Add Car Recommendation</Text>
                        <Text className='text-gray-500 text-center'>Share your Experience with others</Text>
                        {/* Text Input for title*/}
                        <Spacer height={20}/>
                        <View className='mt-5'>
                            <Text className='text-gray-500 text-md'>Title</Text>
                            <View className='flex-row items-center bg-gray-200 rounded-md'>
                                <Ionicons name="car-sport-outline" size={24} color="gray" style={{ marginLeft: 10 }} />
                                <TextInput
                                    placeholder='Enter title'
                                    value={title}
                                    onChangeText={setTitle}
                                    className='p-4 flex-1'
                                />
                            </View>
                        </View>

                        {/* Input for rating*/}

                        <View className='mt-5'>
                            <Text className='text-gray-500 text-md'>Your Rating</Text>
                            <View className='flex-row items-center justify-center bg-gray-200 rounded-md px-4 py-4'>
                                {[1,2,3,4,5].map((num) => (
                                    <TouchableOpacity key={num} onPress={() => setRating(num)}>
                                        <Ionicons
                                            name={rating >= num ? 'star' : 'star-outline'}
                                            size={32}
                                            color={rating >= num ? "#EFB036" : 'gray'}
                                            style={{ marginHorizontal: 10 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Input for image*/}
                        
                        <View className='mt-5'>
                            <Text className='text-gray-500 text-md'>Image</Text>
                            <TouchableOpacity 
                                onPress={pickImage}
                                className='flex-row items-center p-4 rounded-md bg-gray-200'
                                style={{ minHeight: 180 }}
                            >
                                {image ? (
                                    <Image 
                                        source={{ uri: image }} 
                                        style={{ width: '100%', height: 180, borderRadius: 8 }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className='flex-col justify-center items-center w-full'>
                                        <Ionicons name="image-outline" size={50} color="gray" style={{ marginRight: 10 }} />
                                        <Text className='text-gray-500 text-lg'>Tap to upload image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        
                        {/* Text Input for caption*/}

                        <View className='mt-5'>
                            <Text className='text-gray-500 text-md'>Caption</Text>
                            <View className='flex-row items-center bg-gray-200 rounded-md'>

                                <TextInput
                                    placeholder='Write yout Experience or thought about a car ...'
                                    value={caption}
                                    onChangeText={setCaption}
                                    className='flex-1 wrapper p-4'
                                    multiline
                                    style={{ minHeight: 70, textAlignVertical: 'top' }}
                                />
                            </View>
                        </View>

                        <Spacer height={20}/>

                        <TouchableOpacity className='bg-primary1 rounded-md p-4' disabled={isLoading} onPress={handleSubmit}>
                            {isLoading ? (<ActivityIndicator color={Colors.secondary2} />) : (
                                <View className='flex-row items-center justify-center'>
                                    <Ionicons name='cloud-upload-outline' size={24} color={Colors.secondary2} />
                                    <Text className='text-white text-center text-lg font-bold'>  Share</Text>
                                </View>
                            )}
                            
                        </TouchableOpacity>

                        
                    </View>
                    
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    )
}

export default Create;

const styles = StyleSheet.create({})