import { View, ActivityIndicator } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors.js'

export default function Loader({size="large"}){
    return (
        <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            
        }}>
            <ActivityIndicator size={size} color={Colors.primary1}/>
        </View>
    )
}

