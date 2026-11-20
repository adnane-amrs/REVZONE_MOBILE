import { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import IconButton from '../../components/ui/IconButton';
import PressableScale from '../../components/ui/PressableScale';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import BookingCard from '../../components/booking/BookingCard';
import { useAuthStore } from '../../store/authStore';
import { useCountsStore } from '../../store/countsStore';
import { api } from '../../lib/api';
import { todayKey, MONTHS_LONG } from '../../lib/dates';
import { theme, TAB_BAR_SPACE } from '../../constants/theme';
import { formatMoney } from '../../constants/app';

const EARNING = ['accepted', 'active', 'completed'];

const MiniStat = ({ icon, value, label }) => (
    <View style={{ flex: 1, backgroundColor: theme.inkSoft, borderRadius: 20, padding: 12, gap: 6 }}>
        <Ionicons name={icon} size={17} color={theme.accentLight} />
        <View>
            <Text weight="extrabold" style={{ color: theme.onInk, fontSize: 18 }}>{value}</Text>
            <Text weight="medium" style={{ color: theme.onInkMuted, fontSize: 11 }}>{label}</Text>
        </View>
    </View>
);

const Section = ({ title, action, onAction, children, delay = 0 }) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text weight="bold" style={{ color: theme.text, fontSize: 19 }}>{title}</Text>
            {action ? (
                <PressableScale onPress={onAction} hitSlop={8}>
                    <View style={{ backgroundColor: theme.accentSoft, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 }}>
                        <Text weight="bold" style={{ color: theme.accentDeep, fontSize: 12 }}>{action}</Text>
                    </View>
                </PressableScale>
            ) : null}
        </View>
        {children}
    </Animated.View>
);

/** Owner side home: earnings, requests waiting for an answer, upcoming handovers. */
export default function HostDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const notifications = useCountsStore(s => s.notifications);
    const refreshCounts = useCountsStore(s => s.refresh);
    const [bookings, setBookings] = useState(null);
    const [cars, setCars] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const [b, c] = await Promise.all([api('/bookings?role=owner'), api('/cars/mine')]);
            setBookings(b);
            setCars(c);
        } catch {
            setBookings(x => x || []);
            setCars(x => x || []);
        }
        refreshCounts();
    }, [refreshCounts]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const stats = useMemo(() => {
        if (!bookings || !cars) return null;
        const month = todayKey().slice(0, 7);
        const earned = bookings.filter(b => EARNING.includes(b.status));
        return {
            thisMonth: earned.filter(b => b.startDate.startsWith(month)).reduce((s, b) => s + b.totalPrice, 0),
            allTime: earned.reduce((s, b) => s + b.totalPrice, 0),
            liveCars: cars.filter(c => c.isActive && c.moderationStatus !== 'hidden').length,
            pending: bookings.filter(b => b.status === 'pending').sort((a, b) => a.startDate.localeCompare(b.startDate)),
            upcoming: bookings.filter(b => ['accepted', 'active'].includes(b.status)).sort((a, b) => a.startDate.localeCompare(b.startDate)),
        };
    }, [bookings, cars]);

    const firstName = (user?.fullName || user?.username || '').split(' ')[0];
    const loading = stats === null;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.canvas }}
            contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom, gap: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.accentDeep} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.muted, fontSize: 14 }}>Hosting{firstName ? ` · ${firstName}` : ''}</Text>
                    <Text weight="extrabold" style={{ color: theme.text, fontSize: 28 }}>Your dashboard</Text>
                </View>
                <IconButton icon="notifications-outline" variant="white" badge={notifications} onPress={() => router.push('/notifications')} accessibilityLabel="Notifications" />
            </Animated.View>

            {loading ? (
                <View style={{ gap: 16 }}>
                    <Skeleton height={190} radius={32} />
                    <Skeleton height={120} radius={28} />
                </View>
            ) : cars.length === 0 ? (
                <EmptyState icon="key-outline" title="Start hosting"
                    message="List your car, choose when it's available and earn money from renters near you."
                    actionLabel="List your first car" onAction={() => router.push('/listing/new')} />
            ) : (
                <>
                    <Animated.View entering={ZoomIn.springify().damping(16)} style={{ backgroundColor: theme.ink, borderRadius: 32, padding: 20, gap: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text weight="semibold" style={{ color: theme.onInkMuted, fontSize: 13 }}>Earnings in {MONTHS_LONG[new Date().getMonth()]}</Text>
                                <Text weight="extrabold" style={{ color: theme.onInk, fontSize: 34 }}>{formatMoney(stats.thisMonth)}</Text>
                                <Text weight="medium" style={{ color: theme.onInkMuted, fontSize: 12 }}>{formatMoney(stats.allTime)} since you started</Text>
                            </View>
                            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="trending-up" size={22} color={theme.accentLight} />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <MiniStat icon="car-sport-outline" value={stats.liveCars} label="Cars live" />
                            <MiniStat icon="calendar-outline" value={stats.upcoming.length} label="Upcoming" />
                            <MiniStat icon="star-outline" value={user?.ratingCount ? Number(user.averageRating).toFixed(1) : '–'} label="Rating" />
                        </View>
                    </Animated.View>

                    <Section title="Needs your answer" action={stats.pending.length ? 'See all' : null} onAction={() => router.push('/requests')} delay={80}>
                        {stats.pending.length ? stats.pending.slice(0, 3).map(b => (
                            <BookingCard key={b._id} booking={b} onPress={() => router.push(`/booking/${b._id}`)} />
                        )) : (
                            <View style={{ backgroundColor: theme.paper, borderRadius: 24, padding: 18, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.line }}>
                                <Ionicons name="checkmark-done-circle" size={24} color={theme.accentDeep} />
                                <Text style={{ color: theme.textSoft, fontSize: 14, flex: 1 }}>All caught up. New booking requests will show up here.</Text>
                            </View>
                        )}
                    </Section>

                    <Section title="Upcoming handovers" action={stats.upcoming.length > 3 ? 'See all' : null} onAction={() => router.push('/requests')} delay={140}>
                        {stats.upcoming.length ? stats.upcoming.slice(0, 3).map(b => (
                            <BookingCard key={b._id} booking={b} onPress={() => router.push(`/booking/${b._id}`)} />
                        )) : (
                            <Text style={{ color: theme.muted, fontSize: 14 }}>No confirmed trips yet.</Text>
                        )}
                    </Section>

                    <Section title="Quick actions" delay={200}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {[
                                ['add-circle-outline', 'List a car', () => router.push('/listing/new')],
                                ['car-sport-outline', 'My cars', () => router.push('/cars')],
                                ['chatbubbles-outline', 'Messages', () => router.push('/inbox')],
                            ].map(([icon, label, onPress]) => (
                                <PressableScale key={label} onPress={onPress} haptic style={{ flex: 1, backgroundColor: theme.paper, borderRadius: 24, paddingVertical: 18, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: theme.line }}>
                                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name={icon} size={21} color={theme.iconFg} />
                                    </View>
                                    <Text weight="semibold" style={{ color: theme.text, fontSize: 12 }}>{label}</Text>
                                </PressableScale>
                            ))}
                        </View>
                    </Section>
                </>
            )}
        </ScrollView>
    );
}
