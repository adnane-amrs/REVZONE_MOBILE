import { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import IconButton from '../../components/ui/IconButton';
import PressableScale from '../../components/ui/PressableScale';
import EmptyState from '../../components/ui/EmptyState';
import { Tag } from '../../components/ui/Chip';
import { RatingBadge } from '../../components/ui/StarRating';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { toast } from '../../store/toastStore';
import { theme, TAB_BAR_SPACE } from '../../constants/theme';
import PriceTag from '../../components/ui/PriceTag';
import { dialog } from '../../store/dialogStore';

const Action = ({ icon, label, onPress, color = theme.text }) => (
    <PressableScale onPress={onPress} haptic accessibilityLabel={label}
        style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: 18, backgroundColor: theme.surface2 }}>
        <Ionicons name={icon} size={18} color={color} />
        <Text weight="semibold" style={{ color, fontSize: 11 }}>{label}</Text>
    </PressableScale>
);

/** Owner side: my listings, with edit / calendar / pause / delete. */
export default function MyCars() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [cars, setCars] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            setCars(await api('/cars/mine'));
        } catch (e) {
            toast.error(e.message);
            setCars(c => c || []);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const toggle = async (car) => {
        try {
            const res = await api(`/cars/${car._id}/active`, { method: 'PATCH', body: { isActive: !car.isActive } });
            setCars(list => list.map(c => (c._id === car._id ? { ...c, isActive: res.isActive } : c)));
            toast.success(res.isActive ? 'Listing is live again' : 'Listing paused');
        } catch (e) {
            dialog.alert('Error', e.message);
        }
    };

    const remove = (car) => {
        dialog.alert('Delete listing', `Delete your ${car.brand} ${car.model}? This cannot be undone.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await api(`/cars/${car._id}`, { method: 'DELETE' });
                        setCars(list => list.filter(c => c._id !== car._id));
                        toast.success('Listing deleted');
                    } catch (e) {
                        dialog.alert('Cannot delete', e.message);
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item, index }) => {
        const status = item.moderationStatus === 'hidden'
            ? { label: 'Hidden', color: '#E5484D22', text: theme.danger, icon: 'eye-off' }
            : item.isActive ? { label: 'Live', color: theme.accentSoft, text: theme.accentDeep, icon: 'radio-button-on' }
                : { label: 'Paused', color: '#F59E0B22', text: theme.warningText, icon: 'pause' };
        return (
            <Animated.View entering={FadeInDown.delay(index * 70).springify().damping(18)} exiting={FadeOut} layout={LinearTransition.springify()} style={{ marginBottom: 14 }}>
                <View style={{ backgroundColor: theme.paper, borderRadius: 30, padding: 10, gap: 10, borderWidth: 1, borderColor: theme.line }}>
                    <PressableScale onPress={() => router.push(`/car/${item._id}`)} scaleTo={0.98} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                        <View style={{ width: 110, height: 90, borderRadius: 22, overflow: 'hidden', backgroundColor: theme.surface2 }}>
                            <Image source={{ uri: item.cover }} style={{ width: '100%', height: '100%', opacity: item.isActive ? 1 : 0.5 }} contentFit="cover" />
                        </View>
                        <View style={{ flex: 1, gap: 5 }}>
                            <Tag label={status.label} icon={status.icon} color={status.color} textColor={status.text} />
                            <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 16 }}>{item.brand} {item.model}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <PriceTag amount={item.pricePerDay} unit="/day" size="sm" />
                                <RatingBadge rating={item.averageRating} count={item.ratingCount} size={12} />
                            </View>
                        </View>
                        {item.pendingRequests ? (
                            <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: theme.accent, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 }}>
                                <Text weight="bold" style={{ color: theme.onAccent, fontSize: 11 }}>{item.pendingRequests} request{item.pendingRequests > 1 ? 's' : ''}</Text>
                            </View>
                        ) : null}
                    </PressableScale>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Action icon="create-outline" label="Edit" onPress={() => router.push(`/listing/${item._id}/edit`)} />
                        <Action icon="calendar-outline" label="Calendar" onPress={() => router.push(`/car/${item._id}/availability`)} />
                        <Action icon={item.isActive ? 'pause-outline' : 'play-outline'} label={item.isActive ? 'Pause' : 'Resume'} onPress={() => toggle(item)} />
                        <Action icon="trash-outline" label="Delete" color={theme.danger} onPress={() => remove(item)} />
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top + 12 }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ color: theme.muted, fontSize: 14 }}>{cars?.length ? `${cars.length} car${cars.length > 1 ? 's' : ''} listed` : 'Your'}</Text>
                    <Text weight="extrabold" style={{ color: theme.text, fontSize: 30 }}>My cars</Text>
                </View>
                <IconButton icon="add" variant="accent" size={54} onPress={() => router.push('/listing/new')} accessibilityLabel="List a new car" />
            </Animated.View>
            <FlatList
                data={cars || []}
                keyExtractor={(c) => c._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
                ListEmptyComponent={cars === null ? (
                    <View>{[0, 1, 2].map(i => <RowSkeleton key={i} />)}</View>
                ) : (
                    <EmptyState icon="key-outline" title="No cars listed yet" message="List your car in a few minutes and start earning when you don't use it."
                        actionLabel="List your car" onAction={() => router.push('/listing/new')} />
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={theme.accentDeep} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
