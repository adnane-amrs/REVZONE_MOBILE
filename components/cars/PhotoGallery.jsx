import { useState } from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

function Dot({ active }) {
    const style = useAnimatedStyle(() => ({
        width: withSpring(active ? 22 : 7, { damping: 15 }),
        opacity: withSpring(active ? 1 : 0.5),
    }), [active]);
    return <Animated.View style={[{ height: 7, borderRadius: 4, backgroundColor: active ? theme.accent : theme.paper }, style]} />;
}

/** Swipeable photos with animated page dots. */
export default function PhotoGallery({ photos = [], height = 380 }) {
    const [index, setIndex] = useState(0);
    return (
        <View style={{ width, height, backgroundColor: theme.surface }}>
            <FlatList
                data={photos}
                keyExtractor={(p, i) => `${p.url}-${i}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
                renderItem={({ item }) => (
                    <Image source={{ uri: item.url }} style={{ width, height }} contentFit="cover" transition={300} />
                )}
            />
            <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }} pointerEvents="none" />
            {photos.length > 1 ? (
                <View style={{ position: 'absolute', bottom: 48, alignSelf: 'center', flexDirection: 'row', gap: 6 }} pointerEvents="none">
                    {photos.map((p, i) => <Dot key={i} active={i === index} />)}
                </View>
            ) : null}
        </View>
    );
}
