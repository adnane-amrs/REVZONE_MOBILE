import { useCallback, useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../ui/AppText';
import Chip from '../ui/Chip';
import EmptyState from '../ui/EmptyState';
import { RowSkeleton } from '../ui/Skeleton';
import BookingCard from './BookingCard';
import { api } from '../../lib/api';
import { useCountsStore } from '../../store/countsStore';
import { theme, TAB_BAR_SPACE } from '../../constants/theme';

// Sub-tabs for each side of the app
const CONFIG = {
    renter: {
        kicker: 'Your',
        title: 'Trips',
        groups: [
            { key: 'upcoming', label: 'Upcoming', match: (b) => ['pending', 'accepted'].includes(b.status) },
            { key: 'active', label: 'On trip', match: (b) => b.status === 'active' },
            { key: 'past', label: 'Past', match: (b) => ['completed', 'declined', 'cancelled'].includes(b.status) },
        ],
        empty: { icon: 'map-outline', title: 'No trips here yet', message: 'Find a car you love and send a booking request.', action: 'Explore cars', to: '/explore' },
    },
    owner: {
        kicker: 'Booking',
        title: 'Requests',
        groups: [
            { key: 'pending', label: 'New', match: (b) => b.status === 'pending' },
            { key: 'upcoming', label: 'Confirmed', match: (b) => ['accepted', 'active'].includes(b.status) },
            { key: 'past', label: 'History', match: (b) => ['completed', 'declined', 'cancelled'].includes(b.status) },
        ],
        empty: { icon: 'file-tray-outline', title: 'No requests here', message: 'When renters book your cars, their requests show up here.', action: 'Manage my cars', to: '/cars' },
    },
};

/** Trips (renter side) or booking requests (owner side). */
export default function BookingsScreen({ role }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const refreshCounts = useCountsStore(s => s.refresh);
    const config = CONFIG[role];
    const [group, setGroup] = useState(config.groups[0].key);
    const [list, setList] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            setList(await api(`/bookings?role=${role}`));
        } catch {
            setList(l => l || []);
        }
    }, [role]);

    useFocusEffect(useCallback(() => {
        load();
        refreshCounts();
    }, [load, refreshCounts]));

    const current = config.groups.find(g => g.key === group);
    const filtered = useMemo(() => {
        if (!list) return null;
        const items = list.filter(current.match);
        // Upcoming: soonest first. History: most recent first.
        return current.key === 'past'
            ? items.sort((a, b) => b.startDate.localeCompare(a.startDate))
            : items.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }, [list, current]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top + 12 }}>
            <View style={{ paddingHorizontal: 20, gap: 16, paddingBottom: 12 }}>
                <Animated.View entering={FadeInDown.duration(400)}>
                    <Text style={{ color: theme.muted, fontSize: 14 }}>{config.kicker}</Text>
                    <Text weight="extrabold" style={{ color: theme.text, fontSize: 30 }}>{config.title}</Text>
                </Animated.View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {config.groups.map(g => (
                        <Chip key={g.key} label={`${g.label}${list ? ` · ${list.filter(g.match).length}` : ''}`}
                            selected={group === g.key} onPress={() => setGroup(g.key)} />
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filtered || []}
                keyExtractor={(b) => b._id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(18)} style={{ marginBottom: 14 }}>
                        <BookingCard booking={item} onPress={() => router.push(`/booking/${item._id}`)} />
                    </Animated.View>
                )}
                ListEmptyComponent={filtered === null ? (
                    <View>{[0, 1, 2].map(i => <RowSkeleton key={i} />)}</View>
                ) : (
                    <EmptyState icon={config.empty.icon} title={config.empty.title} message={config.empty.message}
                        actionLabel={config.empty.action} onAction={() => router.push(config.empty.to)} />
                )}
                refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.accentDeep}
                    onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
