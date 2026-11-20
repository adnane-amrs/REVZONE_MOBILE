import { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Avatar from '../../components/ui/Avatar';
import PressableScale from '../../components/ui/PressableScale';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { timeAgo, rangeLabel } from '../../lib/dates';
import { useCountsStore } from '../../store/countsStore';
import { useModeStore } from '../../store/modeStore';
import { theme, TAB_BAR_SPACE } from '../../constants/theme';

export default function Inbox() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const refreshCounts = useCountsStore(s => s.refresh);
    const mode = useModeStore(s => s.mode);
    const [all, setItems] = useState(null);
    // Each side only sees its own conversations: renter mode = chats with owners, owner mode = chats with renters
    const items = all ? all.filter(c => c.role === mode) : null;
    const otherSideUnread = all ? all.filter(c => c.role !== mode).reduce((s, c) => s + c.unreadCount, 0) : 0;
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            setItems(await api('/messages/conversations'));
        } catch {
            setItems(list => list || []);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        load();
        refreshCounts();
    }, [load, refreshCounts]));

    const renderItem = ({ item, index }) => {
        const unread = item.unreadCount > 0;
        return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify().damping(18)} style={{ marginBottom: 10 }}>
                <PressableScale onPress={() => router.push(`/chat/${item.bookingId}`)} scaleTo={0.98}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: unread ? theme.accentSoft : theme.paper, borderRadius: 28, padding: 12, borderWidth: 1, borderColor: unread ? theme.surface3 : theme.line }}>
                    <View>
                        <Avatar uri={item.otherParty?.profileImage} name={item.otherParty?.displayName} size={56} verified={item.otherParty?.licenseVerified} />
                        {item.car?.cover ? (
                            <Image source={{ uri: item.car.cover }} style={{ position: 'absolute', right: -6, bottom: -6, width: 30, height: 30, borderRadius: 10, borderWidth: 2, borderColor: theme.paper }} contentFit="cover" />
                        ) : null}
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                            <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 15, flex: 1 }}>{item.otherParty?.displayName}</Text>
                            <Text style={{ color: unread ? theme.accentDeep : theme.muted, fontSize: 12 }}>{timeAgo(item.activityAt)}</Text>
                        </View>
                        <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 12 }}>
                            {item.car ? `${item.car.brand} ${item.car.model}` : ''} · {rangeLabel(item.startDate, item.endDate)}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <Text weight={unread ? 'bold' : 'regular'} numberOfLines={1} style={{ color: unread ? theme.text : theme.textSoft, fontSize: 13, flex: 1 }}>
                                {item.lastMessage ? `${item.lastMessage.mine ? 'You: ' : ''}${item.lastMessage.text}` : 'Say hello 👋'}
                            </Text>
                            {unread ? (
                                <View style={{ minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text weight="bold" style={{ color: theme.onAccent, fontSize: 11 }}>{item.unreadCount}</Text>
                                </View>
                            ) : <StatusPill status={item.status} size="sm" />}
                        </View>
                    </View>
                </PressableScale>
            </Animated.View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top + 12 }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 10 }}>
                <View>
                    <Text style={{ color: theme.muted, fontSize: 14 }}>{mode === 'owner' ? 'Chats with renters' : 'Chats with owners'}</Text>
                    <Text weight="extrabold" style={{ color: theme.text, fontSize: 30 }}>Inbox</Text>
                </View>
                {otherSideUnread ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.paper, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', borderWidth: 1, borderColor: theme.line }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent }} />
                        <Text weight="semibold" style={{ color: theme.textSoft, fontSize: 12 }}>
                            {otherSideUnread} unread in {mode === 'owner' ? 'renter' : 'owner'} mode (switch in Profile)
                        </Text>
                    </View>
                ) : null}
            </Animated.View>
            <FlatList
                data={items || []}
                keyExtractor={(c) => c.bookingId}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
                ListEmptyComponent={items === null ? (
                    <View>{[0, 1, 2, 3].map(i => <RowSkeleton key={i} />)}</View>
                ) : (
                    mode === 'owner' ? (
                        <EmptyState icon="chatbubbles-outline" title="No conversations yet"
                            message="When renters request your cars, you can chat with them here."
                            actionLabel="My cars" onAction={() => router.push('/cars')} />
                    ) : (
                        <EmptyState icon="chatbubbles-outline" title="No conversations yet"
                            message="When you book a car, you can chat with its owner here."
                            actionLabel="Explore cars" onAction={() => router.push('/explore')} />
                    )
                )}
                refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.accentDeep}
                    onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
