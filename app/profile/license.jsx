import { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import PressableScale from '../../components/ui/PressableScale';
import Text from '../../components/ui/AppText';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import { api } from '../../lib/api';
import { pickImage } from '../../lib/images';
import { theme } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

const TIPS = [
    ['sunny-outline', 'Good lighting, no glare or flash reflection'],
    ['scan-outline', 'All four corners of the card visible'],
    ['text-outline', 'Name, number and expiry date readable'],
];

/** Driver license upload. The image is stored privately and only admins can see it. */
export default function LicenseUpload() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, setUser } = useAuthStore();
    const [picked, setPicked] = useState(null);
    const [sending, setSending] = useState(false);

    // Identity document on screen: block screenshots and recording
    useFocusEffect(useCallback(() => {
        ScreenCapture.preventScreenCaptureAsync().catch(() => {});
        return () => { ScreenCapture.allowScreenCaptureAsync().catch(() => {}); };
    }, []));

    const choose = async () => {
        const image = await pickImage({ aspect: [16, 10], title: 'Driver license photo' });
        if (image) setPicked(image);
    };

    const submit = async () => {
        setSending(true);
        try {
            await setUser(await api('/users/me/license', { method: 'POST', body: { image: picked.dataUrl } }));
            toast.success('License sent for verification');
            router.back();
        } catch (e) {
            dialog.alert('Upload failed', e.message);
        } finally {
            setSending(false);
        }
    };

    const status = user?.driverLicense?.status || 'none';

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker="Verify your" title="Driver license" icon="id-card" />
            <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
                    {status === 'rejected' ? (
                        <View style={{ flexDirection: 'row', gap: 12, backgroundColor: '#E5484D1A', borderRadius: 22, padding: 16 }}>
                            <Ionicons name="alert-circle" size={22} color={theme.danger} />
                            <Text style={{ color: theme.text, flex: 1, fontSize: 13 }}>Previous upload rejected: {user.driverLicense.rejectionReason}</Text>
                        </View>
                    ) : null}

                    <Animated.View entering={FadeInDown.duration(400)}>
                        <PressableScale onPress={choose} scaleTo={0.98} accessibilityLabel="Choose license photo"
                            style={{ height: 220, borderRadius: 30, overflow: 'hidden', backgroundColor: theme.canvas, borderWidth: picked ? 0 : 2, borderStyle: 'dashed', borderColor: theme.surface3, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            {picked ? (
                                <Animated.View entering={ZoomIn.springify().damping(14)} style={{ width: '100%', height: '100%' }}>
                                    <Image source={{ uri: picked.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                    <View style={{ position: 'absolute', right: 12, bottom: 12, backgroundColor: theme.ink, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                                        <Text weight="bold" style={{ color: theme.onInk, fontSize: 12 }}>Change</Text>
                                    </View>
                                </Animated.View>
                            ) : (
                                <>
                                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="id-card" size={30} color={theme.onAccent} />
                                    </View>
                                    <Text weight="bold" style={{ color: theme.text, fontSize: 16 }}>Add a photo of your license</Text>
                                    <Text style={{ color: theme.muted, fontSize: 13 }}>Front side, flat on a table</Text>
                                </>
                            )}
                        </PressableScale>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(80).duration(400)} style={{ backgroundColor: theme.canvas, borderRadius: 26, padding: 18, gap: 14 }}>
                        {TIPS.map(([icon, tip]) => (
                            <View key={tip} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                                <Ionicons name={icon} size={20} color={theme.accentDeep} />
                                <Text style={{ color: theme.textSoft, fontSize: 14, flex: 1 }}>{tip}</Text>
                            </View>
                        ))}
                    </Animated.View>

                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                        <Ionicons name="lock-closed" size={16} color={theme.accentDeep} />
                        <Text style={{ color: theme.muted, fontSize: 12, lineHeight: 18, flex: 1 }}>
                            Your license is stored privately and is never shown to other members. Only RevZone admins can open it to verify you. Screenshots are disabled here.
                        </Text>
                    </View>
                </ScrollView>
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 14 }}>
                    <Button title="Send for verification" icon="shield-checkmark" disabled={!picked} loading={sending} onPress={submit} />
                </View>
            </View>
        </View>
    );
}
