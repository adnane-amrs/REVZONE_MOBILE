import { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import PressableScale from '../../components/ui/PressableScale';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { useAuthStore } from '../../store/authStore';
import { useCountsStore } from '../../store/countsStore';
import { useModeStore, MODES } from '../../store/modeStore';
import { useThemeStore, THEME_OPTIONS } from '../../store/themeStore';
import { api } from '../../lib/api';
import { memberSince } from '../../lib/dates';
import { theme, TAB_BAR_SPACE } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

// A function so the colors follow the current light/dark palette
const licenseStates = () => ({
    none: { icon: 'id-card-outline', title: 'Verify your driver license', text: 'Verified renters get accepted faster.', color: theme.accentDeep, cta: 'Verify now' },
    pending: { icon: 'hourglass-outline', title: 'License under review', text: 'An admin is checking your document.', color: theme.warning },
    approved: { icon: 'shield-checkmark', title: 'Verified driver', text: 'Your license has been approved.', color: theme.success },
    rejected: { icon: 'alert-circle-outline', title: 'License rejected', color: theme.danger, cta: 'Upload again' },
});

const Stat = ({ value, label }) => (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
        <Text weight="extrabold" style={{ color: theme.text, fontSize: 22 }}>{value}</Text>
        <Text style={{ color: theme.muted, fontSize: 12 }}>{label}</Text>
    </View>
);

const MenuRow = ({ icon, label, onPress, badge, danger, last }) => (
    <PressableScale onPress={onPress} scaleTo={0.98} accessibilityLabel={label}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderColor: theme.line }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: danger ? '#E5484D1A' : theme.iconBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={icon} size={19} color={danger ? theme.danger : theme.iconFg} />
        </View>
        <Text weight="semibold" style={{ flex: 1, color: danger ? theme.danger : theme.text, fontSize: 15 }}>{label}</Text>
        {badge ? (
            <View style={{ minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text weight="bold" style={{ color: theme.onAccent, fontSize: 11 }}>{badge}</Text>
            </View>
        ) : null}
        {!danger ? <Ionicons name="chevron-forward" size={18} color={theme.muted} /> : null}
    </PressableScale>
);

export default function Profile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, setUser, logout } = useAuthStore();
    const { notifications, requests } = useCountsStore();
    const { mode, setMode } = useModeStore();
    const themePreference = useThemeStore(s => s.preference);
    const setThemePreference = useThemeStore(s => s.setPreference);
    const [refreshing, setRefreshing] = useState(false);
    const isOwnerMode = mode === 'owner';

    const switchMode = () => {
        const next = isOwnerMode ? 'renter' : 'owner';
        setMode(next);
        // Let the transition cover the screen, then open the home tab of the other side
        setTimeout(() => router.replace(MODES[next].home), 250);
    };

    const refresh = useCallback(async () => {
        try {
            setUser(await api('/users/me'));
        } catch {
            // keep the cached profile
        }
    }, [setUser]);

    useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

    const confirmLogout = () => {
        dialog.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: () => { useCountsStore.getState().reset(); logout(); } },
        ], { icon: 'log-out-outline' });
    };

    if (!user) return null;
    const license = licenseStates()[user.driverLicense?.status || 'none'];
    const isNone = !user.driverLicense || user.driverLicense.status === 'none';

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.canvas }}
            contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom, gap: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.accentDeep} onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }} />}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View entering={FadeInDown.duration(400)} style={{ backgroundColor: theme.paper, borderRadius: 34, padding: 20, gap: 18, borderWidth: 1, borderColor: theme.line }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <Avatar uri={user.profileImage} name={user.displayName || user.username} size={76} verified={user.licenseVerified} ring />
                    <View style={{ flex: 1, gap: 3 }}>
                        <Text weight="extrabold" numberOfLines={1} style={{ color: theme.text, fontSize: 22 }}>{user.fullName || user.username}</Text>
                        <Text style={{ color: theme.muted, fontSize: 13 }}>@{user.username}{user.city ? ` · ${user.city}` : ''}</Text>
                        <Text style={{ color: theme.muted, fontSize: 12 }}>Member since {memberSince(user.createdAt || user.memberSince)}</Text>
                    </View>
                </View>
                {user.bio ? <Text style={{ color: theme.textSoft, fontSize: 14, lineHeight: 20 }}>{user.bio}</Text> : null}
                <View style={{ flexDirection: 'row', backgroundColor: theme.surface2, borderRadius: 24, paddingVertical: 14 }}>
                    <Stat value={user.tripCount ?? 0} label="Trips" />
                    <View style={{ width: 1, backgroundColor: theme.surface3 }} />
                    <Stat value={user.carsListed ?? 0} label="Cars" />
                    <View style={{ width: 1, backgroundColor: theme.surface3 }} />
                    <Stat value={user.ratingCount ? Number(user.averageRating).toFixed(1) : '–'} label={`${user.ratingCount || 0} reviews`} />
                </View>
                <Button title="Edit profile" icon="create-outline" variant="white" size="sm" onPress={() => router.push('/profile/edit')} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(40).duration(400)}>
                <PressableScale onPress={switchMode} haptic scaleTo={0.97} accessibilityLabel={isOwnerMode ? 'Switch to renter mode' : 'Switch to owner mode'}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.ink, borderRadius: 30, padding: 10, paddingRight: 18 }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={isOwnerMode ? 'car-sport' : 'key'} size={24} color={theme.accentLight} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.onInkMuted, fontSize: 12 }}>You are in {MODES[mode].label.toLowerCase()} mode</Text>
                        <Text weight="extrabold" style={{ color: theme.onInk, fontSize: 16 }}>{isOwnerMode ? 'Switch to renting' : 'Switch to hosting'}</Text>
                        <Text style={{ color: theme.onInkMuted, fontSize: 12 }}>
                            {isOwnerMode ? 'Browse and book cars' : requests ? `${requests} request${requests > 1 ? 's' : ''} waiting for you` : 'List your cars and manage requests'}
                        </Text>
                    </View>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="swap-horizontal" size={20} color={theme.onAccent} />
                    </View>
                    {!isOwnerMode && requests ? <View style={{ position: 'absolute', top: 10, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: theme.danger }} /> : null}
                </PressableScale>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(80).duration(400)}>
                <PressableScale onPress={() => license.cta && router.push('/profile/license')} scaleTo={license.cta ? 0.98 : 1}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: isNone ? theme.accent : theme.paper, borderRadius: 28, padding: 16, borderWidth: isNone ? 0 : 1, borderColor: theme.line }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isNone ? theme.paper : `${license.color}22`, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={license.icon} size={22} color={license.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text weight="bold" style={{ color: isNone ? theme.onAccent : theme.text, fontSize: 15 }}>{license.title}</Text>
                        <Text style={{ color: isNone ? theme.onAccentMuted : theme.muted, fontSize: 12 }}>
                            {user.driverLicense?.status === 'rejected' ? user.driverLicense.rejectionReason : license.text}
                        </Text>
                    </View>
                    {license.cta ? <Ionicons name="arrow-forward" size={20} color={isNone ? theme.onAccent : theme.text} /> : null}
                </PressableScale>
            </Animated.View>

            {/* Light / dark version of the app */}
            <Animated.View entering={FadeInDown.delay(110).duration(400)} style={{ backgroundColor: theme.paper, borderRadius: 30, padding: 16, gap: 14, borderWidth: 1, borderColor: theme.line }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={theme.mode === 'dark' ? 'moon' : 'sunny'} size={19} color={theme.iconFg} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text weight="semibold" style={{ color: theme.text, fontSize: 15 }}>Appearance</Text>
                        <Text style={{ color: theme.muted, fontSize: 12 }}>{themePreference === 'system' ? 'Follows your phone settings' : `Always ${themePreference}`}</Text>
                    </View>
                </View>
                <SegmentedControl options={THEME_OPTIONS} value={themePreference} onChange={(v) => setThemePreference(v, '/profile')} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(140).duration(400)} style={{ backgroundColor: theme.paper, borderRadius: 30, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: theme.line }}>
                {isOwnerMode ? <MenuRow icon="add-circle-outline" label="List a new car" onPress={() => router.push('/listing/new')} /> : null}
                <MenuRow icon="notifications-outline" label="Notifications" badge={notifications || null} onPress={() => router.push('/notifications')} />
                <MenuRow icon="star-outline" label="My public profile & reviews" onPress={() => router.push(`/user/${user.id || user._id}`)} />
                {user.role === 'admin' ? <MenuRow icon="speedometer-outline" label="Admin dashboard" onPress={() => router.push('/(admin)/dashboard')} /> : null}
                <MenuRow icon="log-out-outline" label="Log out" danger last onPress={confirmLogout} />
            </Animated.View>
        </ScrollView>
    );
}
