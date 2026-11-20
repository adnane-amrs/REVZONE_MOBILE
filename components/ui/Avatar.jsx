import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Text from './AppText';
import { theme } from '../../constants/theme';

// Classic car paint colors: [light, dark, text color]
const PAINTS = [
    ['#E63946', '#8E1621', '#FFFFFF'], // racing red
    ['#2E8B57', '#0F3D25', '#FFFFFF'], // british racing green
    ['#5BC0EB', '#1F6F96', '#FFFFFF'], // gulf blue
    ['#14838E', '#0B4F56', '#FFFFFF'], // revzone teal
    ['#2E5058', '#163238', '#FFFFFF'], // deep slate
    ['#7B5CD6', '#3B2577', '#FFFFFF'], // midnight purple
    ['#C9CED6', '#7C828C', '#1A2326'], // silver
    ['#FFD23F', '#C99A00', '#1A2326'], // modena yellow
];

const initials = (name = '') => name.split(/[\s_.-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';

/** Same name -> same paint color, every time. */
const paintFor = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return PAINTS[hash % PAINTS.length];
};

/**
 * Generated avatar in the RevZone car style: paint-colored circle with racing stripes and initials.
 * Drawn on the phone, so no username is sent to a third-party avatar service.
 */
function CarAvatar({ name, size }) {
    const [light, dark, fg] = paintFor(name);
    const stripe = size * 0.1;
    return (
        <LinearGradient colors={[light, dark]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {/* Twin racing stripes */}
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: size * 0.5 - stripe * 1.35, width: stripe, backgroundColor: 'rgba(255,255,255,0.22)' }} />
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: size * 0.5 + stripe * 0.35, width: stripe, backgroundColor: 'rgba(255,255,255,0.22)' }} />
            <Text weight="extrabold" style={{ color: fg, fontSize: size * 0.36, letterSpacing: 0.5 }}>{initials(name)}</Text>
        </LinearGradient>
    );
}

// Old accounts still store a DiceBear link: show the RevZone avatar instead
const isGenerated = (uri) => !uri || uri.includes('api.dicebear.com');

/** Round profile picture (uploaded photo, or the generated car avatar) with an optional verified tick. */
export default function Avatar({ uri, name, size = 44, verified = false, ring = false }) {
    const [failed, setFailed] = useState(false);
    const showPhoto = !isGenerated(uri) && !failed;

    return (
        <View style={{ width: size, height: size }}>
            <View style={{
                width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: theme.surface3,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: ring ? 2 : 0, borderColor: theme.accent,
            }}>
                {showPhoto ? (
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} onError={() => setFailed(true)} />
                ) : (
                    <CarAvatar name={name} size={size} />
                )}
            </View>
            {verified ? (
                <View style={{
                    position: 'absolute', right: -2, bottom: -2, width: size * 0.38, height: size * 0.38, borderRadius: size,
                    backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.paper,
                }}>
                    <Ionicons name="checkmark" size={size * 0.22} color={theme.onAccent} />
                </View>
            ) : null}
        </View>
    );
}
