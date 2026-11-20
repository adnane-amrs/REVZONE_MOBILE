import { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import PressableScale from '../../components/ui/PressableScale';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { CarCardSkeleton } from '../../components/ui/Skeleton';
import CarCard from '../../components/cars/CarCard';
import SearchSheet from '../../components/cars/SearchSheet';
import FilterSheet from '../../components/cars/FilterSheet';
import { useAuthStore } from '../../store/authStore';
import { useCountsStore } from '../../store/countsStore';
import { useSearchStore, countActiveFilters, EMPTY_FILTERS } from '../../store/searchStore';
import { api, qs } from '../../lib/api';
import { rangeLabel } from '../../lib/dates';
import { theme, TAB_BAR_SPACE, statusBarStyle } from '../../constants/theme';
import { labelOf, TRANSMISSIONS, FUEL_TYPES, SORTS, formatMoney } from '../../constants/app';

const PAGE_SIZE = 8;

const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/** Title row of a section, with an optional "See all" link. */
const SectionTitle = ({ title, action, onAction }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
        <Text weight="bold" style={{ color: theme.text, fontSize: 18 }}>{title}</Text>
        {action ? <Text weight="medium" onPress={onAction} style={{ color: theme.muted, fontSize: 13 }}>{action}</Text> : null}
    </View>
);

/** Round brand shortcut: initials in a circle, filled when selected. */
const BrandBubble = ({ brand, selected, onPress }) => (
    <PressableScale onPress={onPress} haptic accessibilityLabel={brand} style={{ alignItems: 'center', gap: 7, width: 64 }}>
        <View style={{
            width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center',
            backgroundColor: selected ? theme.accent : theme.paper, borderWidth: 1, borderColor: selected ? theme.accent : theme.line,
        }}>
            <Text weight="extrabold" style={{ color: selected ? theme.onAccent : theme.text, fontSize: 15 }}>{brand.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text numberOfLines={1} weight={selected ? 'bold' : 'medium'} style={{ color: selected ? theme.text : theme.textSoft, fontSize: 12 }}>{brand}</Text>
    </PressableScale>
);

export default function Explore() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const notifications = useCountsStore(s => s.notifications);
    const { city, start, end, filters, setWhereWhen, setFilters } = useSearchStore();

    const [cars, setCars] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [facets, setFacets] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [topRated, setTopRated] = useState([]);
    const requestId = useRef(0);

    const query = useCallback((p) => qs({
        page: p, limit: PAGE_SIZE, city, start, end,
        minPrice: filters.minPrice, maxPrice: filters.maxPrice, transmission: filters.transmission,
        fuelType: filters.fuelType, seats: filters.seats, brand: filters.brand, sort: filters.sort,
    }), [city, start, end, filters]);

    const load = useCallback(async (p = 1, mode = 'initial') => {
        const id = ++requestId.current;
        if (mode === 'initial') setLoading(true);
        if (mode === 'more') setLoadingMore(true);
        if (mode === 'refresh') setRefreshing(true);
        try {
            const data = await api(`/cars${query(p)}`);
            if (id !== requestId.current) return; // a newer search started meanwhile
            setCars(prev => (p === 1 ? data.cars : [...prev, ...data.cars]));
            setPage(data.page);
            setTotalPages(data.totalPages);
            setTotal(data.total);
            setError(null);
        } catch (e) {
            if (id === requestId.current) setError(e.message);
        } finally {
            if (id === requestId.current) {
                setLoading(false);
                setLoadingMore(false);
                setRefreshing(false);
            }
        }
    }, [query]);

    useEffect(() => { load(1); }, [load]);
    useEffect(() => { api('/cars/facets').then(setFacets).catch(() => {}); }, []);
    useEffect(() => { api(`/cars${qs({ sort: 'rating', limit: 6 })}`).then(d => setTopRated(d.cars || [])).catch(() => {}); }, []);

    // The header is dark in both versions: light status bar icons while Explore is shown
    useFocusEffect(useCallback(() => {
        setStatusBarStyle('light');
        return () => setStatusBarStyle(statusBarStyle());
    }, []));

    const loadMore = () => {
        if (!loading && !loadingMore && page < totalPages) load(page + 1, 'more');
    };

    const activeCount = countActiveFilters(filters);
    const firstName = (user?.fullName || user?.username || '').split(' ')[0];

    // Removable chips for the filters currently applied
    const applied = [
        filters.sort !== 'newest' && { key: 'sort', label: labelOf(SORTS, filters.sort) },
        filters.transmission && { key: 'transmission', label: labelOf(TRANSMISSIONS, filters.transmission) },
        filters.fuelType && { key: 'fuelType', label: labelOf(FUEL_TYPES, filters.fuelType) },
        filters.seats && { key: 'seats', label: `${filters.seats}+ seats` },
        filters.brand && { key: 'brand', label: filters.brand },
        (filters.minPrice || filters.maxPrice) && { key: 'price', label: `${filters.minPrice ? formatMoney(filters.minPrice) : '0'} – ${filters.maxPrice ? formatMoney(filters.maxPrice) : 'max'}` },
    ].filter(Boolean);

    const removeFilter = (key) => {
        if (key === 'price') setFilters({ ...filters, minPrice: '', maxPrice: '' });
        else if (key === 'sort') setFilters({ ...filters, sort: 'newest' });
        else setFilters({ ...filters, [key]: '' });
    };

    const searching = activeCount > 0 || !!city || !!start;

    const header = (
        <View style={{ gap: 22, paddingBottom: 16 }}>
            {/* Dark header: greeting, notifications, search and filters */}
            <View style={{ backgroundColor: theme.ink, paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, gap: 20 }}>
                <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar uri={user?.profileImage} name={user?.fullName || user?.username} size={46} />
                    <View style={{ flex: 1 }}>
                        <Text weight="bold" numberOfLines={1} style={{ color: theme.onInk, fontSize: 17 }}>Hi {firstName || 'there'}</Text>
                        <Text style={{ color: theme.onInkMuted, fontSize: 13 }}>{greeting()},</Text>
                    </View>
                    <PressableScale onPress={() => router.push('/notifications')} haptic accessibilityLabel="Notifications"
                        style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="notifications-outline" size={21} color={theme.onInk} />
                        {notifications > 0 ? <View style={{ position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 5, backgroundColor: theme.danger }} /> : null}
                    </PressableScale>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(80).duration(400)} style={{ flexDirection: 'row', gap: 10 }}>
                    <PressableScale onPress={() => setSearchOpen(true)} scaleTo={0.98} accessibilityLabel="Search by city and dates"
                        style={{ flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', paddingHorizontal: 16 }}>
                        <Ionicons name="search" size={19} color={theme.onInk} />
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} weight={city || start ? 'semibold' : 'regular'} style={{ color: city || start ? theme.onInk : theme.onInkMuted, fontSize: 14 }}>
                                {city || start ? [city, start ? rangeLabel(start, end) : null].filter(Boolean).join(' · ') : 'Search your car…'}
                            </Text>
                        </View>
                    </PressableScale>
                    <PressableScale onPress={() => setFilterOpen(true)} haptic accessibilityLabel="Filters"
                        style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="options-outline" size={21} color={theme.onInk} />
                        {activeCount ? (
                            <View style={{ position: 'absolute', top: -3, right: -3, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                                <Text weight="bold" style={{ color: theme.onAccent, fontSize: 10 }}>{activeCount}</Text>
                            </View>
                        ) : null}
                    </PressableScale>
                </Animated.View>
            </View>

            {facets?.brands?.length ? (
                <Animated.View entering={FadeInDown.delay(120).duration(400)} style={{ gap: 12 }}>
                    <SectionTitle title="Top Brands" action="See all" onAction={() => setFilterOpen(true)} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
                        {facets.brands.slice(0, 12).map(b => {
                            const selected = filters.brand?.toLowerCase() === b.toLowerCase();
                            return <BrandBubble key={b} brand={b} selected={selected} onPress={() => setFilters({ ...filters, brand: selected ? '' : b })} />;
                        })}
                    </ScrollView>
                </Animated.View>
            ) : null}

            {!searching && topRated.length ? (
                <Animated.View entering={FadeInDown.delay(160).duration(400)} style={{ gap: 12 }}>
                    <SectionTitle title="Top Rated" action="See all" onAction={() => setFilters({ ...filters, sort: 'rating' })} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
                        {topRated.map(car => <CarCard key={car._id} car={car} width={220} onPress={() => router.push(`/car/${car._id}`)} />)}
                    </ScrollView>
                </Animated.View>
            ) : null}

            {applied.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 }}>
                    {applied.map(a => (
                        <PressableScale key={a.key} onPress={() => removeFilter(a.key)} accessibilityLabel={`Remove ${a.label}`}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.accent, borderRadius: 999, paddingVertical: 7, paddingLeft: 12, paddingRight: 8 }}>
                            <Text weight="semibold" style={{ color: theme.onAccent, fontSize: 12 }}>{a.label}</Text>
                            <Ionicons name="close-circle" size={16} color={theme.onAccent} />
                        </PressableScale>
                    ))}
                </View>
            ) : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
                <Text weight="bold" style={{ color: theme.text, fontSize: 18 }}>
                    {loading ? 'Searching…' : searching ? `${total} car${total === 1 ? '' : 's'} found` : 'All Vehicles'}
                </Text>
                <Text weight="medium" style={{ color: theme.muted, fontSize: 13 }}>{labelOf(SORTS, filters.sort)}</Text>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas }}>
            <FlatList
                data={loading ? [] : cars}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + insets.bottom }}
                ListHeaderComponent={header}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay((index % PAGE_SIZE) * 70).springify().damping(18)} style={{ marginBottom: 16, paddingHorizontal: 20 }}>
                        <CarCard car={item} onPress={() => router.push(`/car/${item._id}`)} />
                    </Animated.View>
                )}
                ListEmptyComponent={loading ? (
                    <View style={{ paddingHorizontal: 20 }}>{[0, 1, 2].map(i => <CarCardSkeleton key={i} />)}</View>
                ) : error ? (
                    <EmptyState icon="cloud-offline-outline" title="Couldn't load cars" message={error} actionLabel="Try again" onAction={() => load(1)} />
                ) : (
                    <EmptyState icon="search-outline" title="No cars match"
                        message="Try other dates, another city or fewer filters."
                        actionLabel="Clear search" onAction={() => { setWhereWhen({}); setFilters({ ...EMPTY_FILTERS }); }} />
                )}
                ListFooterComponent={loadingMore ? <ActivityIndicator color={theme.accentDeep} style={{ marginVertical: 16 }} /> : null}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(1, 'refresh')} tintColor={theme.onInk} colors={[theme.onAccent]} progressBackgroundColor={theme.accent} />}
                showsVerticalScrollIndicator={false}
            />

            <SearchSheet
                visible={searchOpen}
                onClose={() => setSearchOpen(false)}
                initial={{ city, start, end }}
                cities={facets?.cities}
                onApply={(v) => { setWhereWhen(v); setSearchOpen(false); }}
            />
            <FilterSheet
                visible={filterOpen}
                onClose={() => setFilterOpen(false)}
                initial={filters}
                facets={facets}
                onApply={(f) => { setFilters(f); setFilterOpen(false); }}
            />
        </View>
    );
}
