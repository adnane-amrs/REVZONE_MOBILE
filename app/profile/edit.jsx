import { useState } from 'react';
import { View, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import KeyboardScroll from '../../components/ui/KeyboardScroll';
import Avatar from '../../components/ui/Avatar';
import PressableScale from '../../components/ui/PressableScale';
import Text from '../../components/ui/AppText';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import { api } from '../../lib/api';
import { pickImage, uploadImage } from '../../lib/images';
import { theme } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

const PHONE_RE = /^\+?[0-9][0-9 \-]{7,18}$/;

export default function EditProfile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, setUser } = useAuthStore();
    const [form, setForm] = useState({
        fullName: user?.fullName || '', city: user?.city || '', phone: user?.phone || '', bio: user?.bio || '',
    });
    const [avatar, setAvatar] = useState(user?.profileImage || '');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

    const changeAvatar = async () => {
        const picked = await pickImage({ aspect: [1, 1], title: 'Profile picture' });
        if (!picked) return;
        setUploading(true);
        try {
            const { url } = await uploadImage(picked.dataUrl, 'avatar');
            setAvatar(url);
        } catch (e) {
            dialog.alert('Upload failed', e.message);
        } finally {
            setUploading(false);
        }
    };

    const save = async () => {
        const next = {};
        if (form.phone && !PHONE_RE.test(form.phone.trim())) next.phone = 'Enter a valid phone number (e.g. +212 6 12 34 56 78)';
        if (form.fullName.length > 60) next.fullName = 'Max 60 characters';
        setErrors(next);
        if (Object.keys(next).length) return;

        setSaving(true);
        try {
            const body = { fullName: form.fullName.trim(), city: form.city.trim(), phone: form.phone.trim(), bio: form.bio.trim() };
            if (avatar && avatar !== user.profileImage) body.profileImage = avatar;
            await setUser(await api('/users/me', { method: 'PUT', body }));
            toast.success('Profile updated');
            router.back();
        } catch (e) {
            dialog.alert('Could not save', e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker="Edit your" title="Profile" icon="person" />
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                    <KeyboardScroll contentContainerStyle={{ padding: 20, gap: 16 }}>
                        <Animated.View entering={FadeInDown.duration(400)} style={{ alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <PressableScale onPress={changeAvatar} accessibilityLabel="Change profile picture">
                                <Avatar uri={avatar} name={form.fullName || user?.username} size={104} ring />
                                <View style={{ position: 'absolute', right: 0, bottom: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: theme.paper }}>
                                    {uploading ? <ActivityIndicator size="small" color={theme.onAccent} /> : <Ionicons name="camera" size={16} color={theme.onAccent} />}
                                </View>
                            </PressableScale>
                            <Text style={{ color: theme.muted, fontSize: 12 }}>@{user?.username} · {user?.email}</Text>
                        </Animated.View>
                        <TextField label="Full name" icon="person-outline" placeholder="Your name" value={form.fullName} onChangeText={(v) => set('fullName', v)} autoCapitalize="words" error={errors.fullName} />
                        <TextField label="City" icon="location-outline" placeholder="Casablanca" value={form.city} onChangeText={(v) => set('city', v)} autoCapitalize="words" />
                        <TextField label="Phone" icon="call-outline" placeholder="+212 6 12 34 56 78" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => set('phone', v)} error={errors.phone}
                            hint="Only shared with the other person once a booking is confirmed." />
                        <TextField label="Bio" multiline maxLength={500} placeholder="Tell renters and owners about yourself" value={form.bio} onChangeText={(v) => set('bio', v)} hint={`${form.bio.length}/500`} />
                    </KeyboardScroll>
                    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 14 }}>
                        <Button title="Save changes" icon="checkmark" loading={saving} disabled={uploading} onPress={save} />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
