import { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import IconButton from '../../components/ui/IconButton';
import PressableScale from '../../components/ui/PressableScale';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { theme } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

const StatTile = ({ icon, label, value, color, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={{ width: '48%' }}>
        <View style={{ backgroundColor: theme.paper, borderRadius: 26, padding: 16, gap: 12, borderWidth: 1, borderColor: theme.line }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${color}22`, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View>
                <Text weight="extrabold" style={{ color: theme.text, fontSize: 26 }}>{value ?? 0}</Text>
                <Text style={{ color: theme.muted, fontSize: 12 }}>{label}</Text>
            </View>
        </View>
    </Animated.View>
);

const ActionRow = ({ icon, title, subtitle, onPress, badge, highlight }) => (
    <PressableScale onPress={onPress} scaleTo={0.98} accessibilityLabel={title}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: highlight ? theme.accent : theme.paper, borderRadius: 26, padding: 14, borderWidth: highlight ? 0 : 1, borderColor: theme.line }}>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: theme.iconBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={icon} size={21} color={theme.iconFg} />
        </View>
        <View style={{ flex: 1 }}>
            <Text weight="bold" style={{ color: highlight ? theme.onAccent : theme.text, fontSize: 15 }}>{title}</Text>
            <Text style={{ color: highlight ? theme.onAccentMuted : theme.muted, fontSize: 12 }}>{subtitle}</Text>
        </View>
        {badge ? (
            <View style={{ minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 7, backgroundColor: highlight ? theme.paper : theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text weight="bold" style={{ color: highlight ? theme.accentDeep : theme.onAccent, fontSize: 12 }}>{badge}</Text>
            </View>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={highlight ? theme.onAccent : theme.muted} />
    </PressableScale>
);

export default function AdminDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuthStore();
    const { userStats, getUserStats, listingStats, getListingStats } = useAdminStore();
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(() => Promise.all([getUserStats(), getListingStats()]), [getUserStats, getListingStats]);

    useFocusEffect(useCallback(() => {
        load();
        // Admin data: block screenshots and screen recording
        ScreenCapture.preventScreenCaptureAsync().catch(() => {});
        return () => { ScreenCapture.allowScreenCaptureAsync().catch(() => {}); };
    }, [load]));

    const handleLogout = () => {
        dialog.alert("Log out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", onPress: logout, style: "destructive" },
        ], { icon: 'log-out-outline' });
    };

    const tiles = [
        { icon: 'people-outline', label: 'Users', value: userStats.totalUsers, color: theme.info },
        { icon: 'checkmark-circle-outline', label: 'Active users', value: userStats.activeUsers, color: theme.success },
        { icon: 'pause-circle-outline', label: 'Suspended', value: userStats.suspendedUsers, color: theme.warning },
        { icon: 'close-circle-outline', label: 'Banned', value: userStats.bannedUsers, color: theme.danger },
        { icon: 'car-sport-outline', label: 'Live listings', value: listingStats.visibleListings, color: theme.accentDeep },
        { icon: 'eye-off-outline', label: 'Hidden listings', value: listingStats.hiddenListings, color: theme.muted },
        { icon: 'calendar-outline', label: 'Active bookings', value: listingStats.activeBookings, color: theme.info },
        { icon: 'flag-outline', label: 'Completed trips', value: listingStats.completedBookings, color: theme.success },
    ];

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.canvas }}
            contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 30, gap: 20 }}
            refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.accentDeep} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        >
            <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.muted, fontSize: 14 }}>Admin · {user?.username}</Text>
                    <Text weight="extrabold" style={{ color: theme.text, fontSize: 28 }}>Dashboard</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <IconButton icon="car-sport-outline" variant="accent" onPress={() => router.push('/explore')} accessibilityLabel="Open the rental app" />
                    <IconButton icon="log-out-outline" variant="white" onPress={handleLogout} accessibilityLabel="Log out" />
                </View>
            </Animated.View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
                {tiles.map((t, i) => <StatTile key={t.label} {...t} index={i} />)}
            </View>

            <View style={{ gap: 10 }}>
                <Text weight="bold" style={{ color: theme.text, fontSize: 19 }}>Moderation</Text>
                <ActionRow icon="id-card-outline" title="Driver licenses" subtitle="Approve or reject uploaded licenses"
                    badge={userStats.pendingLicenses || null} highlight={userStats.pendingLicenses > 0} onPress={() => router.push('/(admin)/licenses')} />
                <ActionRow icon="people-outline" title="Manage users" subtitle={`${userStats.newUsersThisWeek || 0} new this week`} onPress={() => router.push('/(admin)/users')} />
                <ActionRow icon="car-outline" title="Manage listings" subtitle={`${listingStats.newListingsThisWeek || 0} new this week · ${listingStats.pausedListings || 0} paused`} onPress={() => router.push('/(admin)/listings')} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <Ionicons name="eye-off-outline" size={13} color={theme.muted} />
                <Text style={{ color: theme.muted, fontSize: 11 }}>Screenshots are disabled in the admin area</Text>
            </View>
        </ScrollView>
    );
}
