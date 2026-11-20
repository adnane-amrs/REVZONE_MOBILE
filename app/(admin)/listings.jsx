import { useEffect, useState } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Header from '../../components/ui/Header';
import TextField from '../../components/ui/TextField';
import Chip, { Tag } from '../../components/ui/Chip';
import Button from '../../components/ui/Button';
import PressableScale from '../../components/ui/PressableScale';
import EmptyState from '../../components/ui/EmptyState';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { useAdminStore } from '../../store/adminStore';
import { toast } from '../../store/toastStore';
import { theme } from '../../constants/theme';
import PriceTag from '../../components/ui/PriceTag';
import { dialog } from '../../store/dialogStore';

export default function ListingModeration() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { listings, listingPagination, getListings, setListingVisibility, deleteListing, isLoading } = useAdminStore();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { getListings(page, 10, search, status).then(() => setLoaded(true)); }, 300);
        return () => clearTimeout(t);
    }, [page, search, status, getListings]);

    const toggleVisibility = async (l) => {
        const next = l.moderationStatus === 'hidden' ? 'visible' : 'hidden';
        const res = await setListingVisibility(l._id, next);
        if (res.success) toast.success(next === 'hidden' ? 'Listing hidden from Explore' : 'Listing visible again');
        else dialog.alert('Error', res.error);
    };

    const remove = (l) => {
        dialog.alert('Delete listing', `Delete the ${l.brand} ${l.model} of ${l.owner?.username}? Pending bookings will be cancelled.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const res = await deleteListing(l._id);
                    if (res.success) toast.success('Listing deleted'); else dialog.alert('Error', res.error);
                },
            },
        ]);
    };

    const renderItem = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 40).duration(350)} exiting={FadeOut} layout={LinearTransition} style={{ marginBottom: 12 }}>
            <View style={{ backgroundColor: theme.canvas, borderRadius: 26, padding: 10, gap: 10 }}>
                <PressableScale onPress={() => router.push(`/car/${item._id}`)} scaleTo={0.98} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Image source={{ uri: item.cover }} style={{ width: 92, height: 72, borderRadius: 18, opacity: item.moderationStatus === 'hidden' ? 0.4 : 1 }} contentFit="cover" />
                    <View style={{ flex: 1, gap: 3 }}>
                        <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 15 }}>{item.brand} {item.model} · {item.year}</Text>
                        <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 12 }}>{item.owner?.fullName || item.owner?.username} · {item.city}</Text>
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            <PriceTag amount={item.pricePerDay} unit="/day" size="sm" />
                            {item.moderationStatus === 'hidden' ? <Tag label="Hidden" color="#E5484D22" textColor={theme.danger} /> : null}
                            {!item.isActive ? <Tag label="Paused" color="#F59E0B22" textColor={theme.warningText} /> : null}
                        </View>
                    </View>
                </PressableScale>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <PressableScale onPress={() => toggleVisibility(item)} haptic style={{ flex: 1, height: 42, borderRadius: 21, backgroundColor: theme.paper, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={item.moderationStatus === 'hidden' ? 'eye-outline' : 'eye-off-outline'} size={17} color={theme.text} />
                        <Text weight="semibold" style={{ color: theme.text, fontSize: 13 }}>{item.moderationStatus === 'hidden' ? 'Show' : 'Hide'}</Text>
                    </PressableScale>
                    <PressableScale onPress={() => remove(item)} haptic style={{ flex: 1, height: 42, borderRadius: 21, backgroundColor: '#E5484D1A', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="trash-outline" size={17} color={theme.danger} />
                        <Text weight="semibold" style={{ color: theme.danger, fontSize: 13 }}>Delete</Text>
                    </PressableScale>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker="Admin" title="Listings" icon="car-sport" />
            <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                <View style={{ padding: 20, paddingBottom: 8, gap: 12 }}>
                    <TextField icon="search" placeholder="Search brand, model or city" value={search} onChangeText={(v) => { setSearch(v); setPage(1); }} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {[['', 'All'], ['visible', 'Visible'], ['hidden', 'Hidden'], ['paused', 'Paused']].map(([v, l]) => (
                            <Chip key={l} label={l} selected={status === v} onPress={() => { setStatus(v); setPage(1); }} />
                        ))}
                    </ScrollView>
                </View>
                <FlatList
                    data={listings}
                    keyExtractor={(l) => l._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: insets.bottom + 30 }}
                    ListEmptyComponent={!loaded || isLoading ? <View>{[0, 1, 2].map(i => <RowSkeleton key={i} />)}</View> : <EmptyState icon="car-outline" title="No listings found" />}
                    ListFooterComponent={listingPagination.totalPages > 1 ? (
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 6 }}>
                            <View style={{ flex: 1 }}><Button title="Previous" size="sm" variant="dark" disabled={page <= 1} onPress={() => setPage(p => p - 1)} /></View>
                            <Text style={{ color: theme.muted }}>{page}/{listingPagination.totalPages}</Text>
                            <View style={{ flex: 1 }}><Button title="Next" size="sm" variant="dark" disabled={page >= listingPagination.totalPages} onPress={() => setPage(p => p + 1)} /></View>
                        </View>
                    ) : null}
                />
            </View>
        </View>
    );
}
