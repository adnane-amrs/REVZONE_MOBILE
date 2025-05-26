import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Create = () => {
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center" style={{ paddingTop: insets.top }}>
                <Text className="text-2xl font-bold text-gray-900">Add a New Car</Text>
            </View>
        </View>
    )
}

export default Create;

const styles = StyleSheet.create({})