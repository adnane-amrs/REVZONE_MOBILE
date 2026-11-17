import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/Colors';
import Spacer from '../../components/Spacer';

const Edit = () => {
    const router = useRouter();
    const { token } = useAuthStore();
    const params = useLocalSearchParams();
    
    const [title, setTitle] = useState(params.title || '');
    const [caption, setCaption] = useState(params.caption || '');
    const [rating, setRating] = useState(parseInt(params.rate) || 3);
    const [image, setImage] = useState(params.image || null);
    const [image64, setImage64] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImageChanged, setIsImageChanged] = useState(false);

    useEffect(() => {
        if (!token) {
            Alert.alert("Error", "You must be logged in to edit a post. Please login again.");
            router.replace("/(auth)/login");
            return;
        }
    }, [token, router]);

    const handleSubmit = async () => {
        if(!title || !caption || !rating) {
            Alert.alert("Error", "Please fill all the required fields");
            return;
        }

        if (!token) {
            Alert.alert("Error", "You must be logged in to edit a post. Please login again.");
            router.replace("/(auth)/login");
            return;
        }

        // Validate image size if a new image was selected
        if (isImageChanged && image64) {
            const imageSizeInBytes = (image64.length * 3) / 4;
            const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
            
            if (imageSizeInBytes > maxSizeInBytes) {
                Alert.alert("Error", "Image is too large. Please select a smaller image (max 2MB).");
                return;
            }
        }

        try {
            setIsLoading(true);
            
            // Prepare image data if image was changed
            let imageData = null;
            if (isImageChanged && image64) {
                let base64Image = image64;
                if (base64Image.includes('base64,')) {
                    base64Image = base64Image.split('base64,')[1];
                }
                imageData = `data:image/jpeg;base64,${base64Image}`;
            }

            const updateData = {
                title: title.trim(),
                caption: caption.trim(),
                rate: rating
            };

            // Only include image if it was changed
            if (isImageChanged && imageData) {
                updateData.image = imageData;
            }

            console.log("Updating post:", params.postId);
            console.log("Update data:", { ...updateData, image: imageData ? 'Image included' : 'No image change' });

            const response = await fetch(`${API_URL}/cars/${params.postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            console.log("Response status:", response.status);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const responseText = await response.text();
                console.log("Non-JSON response:", responseText.substring(0, 200));
                throw new Error(`Server returned non-JSON response. Status: ${response.status}. Please try again later.`);
            }

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.log("JSON parse error:", parseError);
                const responseText = await response.text();
                console.log("Response text:", responseText.substring(0, 200));
                throw new Error(`Failed to parse server response: ${parseError.message}`);
            }

            if(!response.ok) {
                if (response.status === 401) {
                    Alert.alert("Session Expired", "Your session has expired. Please login again.");
                    router.replace("/(auth)/login");
                } else if (response.status === 400) {
                    const errorMessage = data.missing 
                        ? `Missing fields: ${Object.entries(data.missing)
                            .filter(([_, missing]) => missing)
                            .map(([field]) => field)
                            .join(', ')}`
                        : data.message;
                    throw new Error(errorMessage);
                } else if (response.status === 404) {
                    throw new Error("Post not found");
                } else if (response.status === 403) {
                    throw new Error("You are not authorized to edit this post");
                } else {
                    throw new Error(data.message || `Server error: ${response.status}`);
                }
                return;
            }

            Alert.alert("Success", "Post updated successfully", [
                {
                    text: "OK",
                    onPress: () => router.back()
                }
            ]);

        } catch (error) {
            console.log("Error in handleSubmit:", error);
            Alert.alert("Error", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            // Show options to choose between camera and gallery.
            // Each option requests only the permission it needs, at the moment it is needed.
            Alert.alert(
                'Select Image Source',
                'Choose where to get the image from',
                [
                    {
                        text: 'Camera',
                        onPress: async () => {
                            if (Platform.OS !== 'web') {
                                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                                if (cameraPermission.status !== 'granted') {
                                    Alert.alert('Permission Required', 'Camera permission is required.', [{ text: 'OK' }]);
                                    return;
                                }
                            }
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ['images'],
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.3,  // Reduced quality for smaller file size
                                base64: true,
                            });
                            handleImageResult(result);
                        }
                    },
                    {
                        text: 'Gallery',
                        onPress: async () => {
                            if (Platform.OS !== 'web') {
                                const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                if (mediaLibraryPermission.status !== 'granted') {
                                    Alert.alert('Permission Required', 'Photo library permission is required.', [{ text: 'OK' }]);
                                    return;
                                }
                            }
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ['images'],
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.3,  // Reduced quality for smaller file size
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
    };

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
            setIsImageChanged(true);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className='flex-1 bg-secondary1/15'>
            <View className='flex-1'>
                <ScrollView 
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className='px-5 bg-white rounded-md p-5 w-[95%] shadow-sm'>
                        <Text className='text-3xl font-bold text-center text-primary1'>Edit Car Recommendation</Text>
                        <Text className='text-gray-500 text-center'>Update your Experience with others</Text>
                        
                        {/* Text Input for title */}
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

                        {/* Input for rating */}
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

                        {/* Input for image */}
                        <View className='mt-5'>
                            <Text className='text-gray-500 text-md'>Image</Text>
                            <TouchableOpacity 
                                onPress={pickImage}
                                className='flex-row items-center p-4 rounded-md bg-gray-200'
                                style={{ minHeight: 180 }}
                            >
                                {image ? (
                                    <View className="relative w-full">
                                        <Image 
                                            source={{ uri: image }} 
                                            style={{ width: '100%', height: 180, borderRadius: 8 }}
                                            resizeMode="cover"
                                        />
                                        {isImageChanged && (
                                            <View className="absolute top-2 left-2 bg-blue-500 rounded-full px-2 py-1">
                                                <Text className="text-white text-xs">New</Text>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View className='flex-col justify-center items-center w-full'>
                                        <Ionicons name="image-outline" size={50} color="gray" style={{ marginRight: 10 }} />
                                        <Text className='text-gray-500 text-lg'>Tap to upload image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        
                        {/* Text Input for caption */}
                        <View className='mt-5'>
                            <Text className='text-gray-500 text-md'>Caption</Text>
                            <View className='flex-row items-center bg-gray-200 rounded-md'>
                                <TextInput
                                    placeholder='Write your Experience or thought about a car ...'
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
                                    <Ionicons name='checkmark-outline' size={24} color={Colors.secondary2} />
                                    <Text className='text-white text-center text-lg font-bold'>  Update</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Edit;