import { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../components/ui/AppText';
import Header from '../components/ui/Header';
import IconButton from '../components/ui/IconButton';
import PressableScale from '../components/ui/PressableScale';
import EmptyState from '../components/ui/EmptyState';
import { RowSkeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';
import { timeAgo } from '../lib/dates';
import { useCountsStore } from '../store/countsStore';
import { theme } from '../constants/theme';

// A function so the colors follow the current light/dark palette
const types = () => ({
    booking_request: { icon: 'paper-plane', color: theme.warning },
    booking_accepted: { icon: 'checkmark-circle', color: theme.accentDeep },
    booking_declined: { icon: 'close-circle', color: theme.danger },
    booking_cancelled: { icon: 'ban', color: theme.muted },
    booking_completed: { icon: 'flag', color: theme.success },
    new_message: { icon: 'chatbubble-ellipses', color: theme.info },
    review_received: { icon: 'star', color: theme.star },
    license_approved: { icon: 'shield-checkmark', color: theme.success },
    license_rejected: { icon: 'alert-circle', color: theme.danger },
});

export default function Notifications() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const refreshCounts = useCountsStore(s => s.refresh);
    const [items, setItems] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            setItems(await api('/notifications'));
        } catch {
            setItems(list => list || []);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const open = async (n) => {
        if (!n.read) {
            setItems(list => list.map(x => (x._id === n._id ? { ...x, read: true } : x)));
            api(`/notifications/${n._id}/read`, { method: 'PATCH' }).then(refreshCounts).catch(() => {});
        }
        if (n.type === 'new_message' && n.booking) router.push(`/chat/${n.booking}`);
        else if (n.booking) router.push(`/booking/${n.booking}`);
        else if (n.type.startsWith('license')) router.push('/profile');
    };

    const readAll = async () => {
        setItems(list => (list || []).map(x => ({ ...x, read: true })));
        await api('/notifications/read-all', { method: 'PATCH' }).catch(() => {});
        refreshCounts();
    };

    const unread = (items || []).filter(n => !n.read).length;

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker={unread ? `${unread} unread` : 'All caught up'} title="Notifications" icon="notifications"
                right={unread ? <IconButton icon="checkmark-done" variant="ink" size={52} onPress={readAll} accessibilityLabel="Mark all as read" /> : null} />
            <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                <FlatList
                    data={items || []}
                    keyExtractor={(n) => n._id}
                    contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}
                    renderItem={({ item, index }) => {
                        const all = types();
                        const t = all[item.type] || all.new_message;
                        return (
                            <Animated.View entering={FadeInDown.delay(Math.min(index, 10) * 40).springify().damping(18)} style={{ marginBottom: 10 }}>
                                <PressableScale onPress={() => open(item)} scaleTo={0.98}
                                    style={{ flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: item.read ? theme.canvas : theme.accentSoft, borderRadius: 26, padding: 14 }}>
                                    <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: `${t.color}22`, alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name={t.icon} size={21} color={t.color} />
                                    </View>
                                    <View style={{ flex: 1, gap: 3 }}>
                                        <Text weight={item.read ? 'regular' : 'semibold'} style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
                                        <Text style={{ color: theme.muted, fontSize: 12 }}>{timeAgo(item.createdAt)}</Text>
                                    </View>
                                    {!item.read ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent }} /> : null}
                                </PressableScale>
                            </Animated.View>
                        );
                    }}
                    ListEmptyComponent={items === null ? (
                        <View>{[0, 1, 2, 3].map(i => <RowSkeleton key={i} />)}</View>
                    ) : (
                        <EmptyState icon="notifications-outline" title="No notifications" message="Booking requests, confirmations and messages will appear here." />
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.accentDeep}
                        onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
                />
            </View>
        </View>
    );
}
