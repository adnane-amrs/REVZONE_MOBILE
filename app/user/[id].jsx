import { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Header from '../../components/ui/Header';
import Avatar from '../../components/ui/Avatar';
import PressableScale from '../../components/ui/PressableScale';
import EmptyState from '../../components/ui/EmptyState';
import { RatingBadge } from '../../components/ui/StarRating';
import ReviewItem from '../../components/cars/ReviewItem';
import { api } from '../../lib/api';
import { memberSince } from '../../lib/dates';
import { theme } from '../../constants/theme';
import PriceTag from '../../components/ui/PriceTag';

const Badge = ({ icon, label, on }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: on ? theme.accentSoft : theme.surface2, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
        <Ionicons name={icon} size={14} color={on ? theme.accentDeep : theme.muted} />
        <Text weight="semibold" style={{ color: on ? theme.accentDeep : theme.muted, fontSize: 12 }}>{label}</Text>
    </View>
);

/** Public profile: what other members can see about someone (no email or phone). */
export default function PublicProfile() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api(`/users/${id}`).then(setUser).catch(e => setError(e.message));
    }, [id]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker="Member" title={user ? user.displayName : 'Profile'} icon="person" />
            <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                {error ? <EmptyState icon="person-outline" title="Profile not found" message={error} /> : !user ? (
                    <ActivityIndicator color={theme.accentDeep} style={{ marginTop: 60 }} />
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
                        <Animated.View entering={FadeInDown.duration(400)} style={{ alignItems: 'center', gap: 10 }}>
                            <Avatar uri={user.profileImage} name={user.displayName} size={96} verified={user.licenseVerified} ring />
                            <Text weight="extrabold" style={{ color: theme.text, fontSize: 24 }}>{user.displayName}</Text>
                            <Text style={{ color: theme.muted, fontSize: 13 }}>{user.city ? `${user.city} · ` : ''}Member since {memberSince(user.memberSince)}</Text>
                            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <Badge icon="shield-checkmark" label={user.licenseVerified ? 'Verified driver' : 'License not verified'} on={user.licenseVerified} />
                                <RatingBadge rating={user.averageRating} count={user.ratingCount} />
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={{ flexDirection: 'row', gap: 10 }}>
                            {[[user.tripCount, 'Trips'], [user.carsListed, 'Cars listed'], [user.ratingCount, 'Reviews']].map(([v, l]) => (
                                <View key={l} style={{ flex: 1, backgroundColor: theme.canvas, borderRadius: 24, paddingVertical: 16, alignItems: 'center' }}>
                                    <Text weight="extrabold" style={{ color: theme.text, fontSize: 22 }}>{v || 0}</Text>
                                    <Text style={{ color: theme.muted, fontSize: 12 }}>{l}</Text>
                                </View>
                            ))}
                        </Animated.View>

                        {user.bio ? (
                            <View style={{ backgroundColor: theme.canvas, borderRadius: 24, padding: 18 }}>
                                <Text style={{ color: theme.textSoft, fontSize: 14, lineHeight: 21 }}>{user.bio}</Text>
                            </View>
                        ) : null}

                        {user.cars?.length ? (
                            <View style={{ gap: 12 }}>
                                <Text weight="bold" style={{ color: theme.text, fontSize: 19 }}>{user.displayName.split(' ')[0]}&apos;s cars</Text>
                                <FlatList
                                    horizontal
                                    data={user.cars}
                                    keyExtractor={(c) => c._id}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ gap: 12 }}
                                    renderItem={({ item }) => (
                                        <PressableScale onPress={() => router.push(`/car/${item._id}`)} style={{ width: 200, backgroundColor: theme.canvas, borderRadius: 26, padding: 8 }}>
                                            <Image source={{ uri: item.cover }} style={{ width: '100%', height: 120, borderRadius: 20 }} contentFit="cover" />
                                            <View style={{ padding: 8, gap: 4 }}>
                                                <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 14 }}>{item.brand} {item.model}</Text>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <PriceTag amount={item.pricePerDay} unit="/day" size="sm" />
                                                    <RatingBadge rating={item.averageRating} count={item.ratingCount} size={12} />
                                                </View>
                                            </View>
                                        </PressableScale>
                                    )}
                                />
                            </View>
                        ) : null}

                        <View style={{ gap: 12 }}>
                            <Text weight="bold" style={{ color: theme.text, fontSize: 19 }}>Reviews</Text>
                            {user.reviews?.length ? user.reviews.map((r, i) => (
                                <Animated.View key={r._id} entering={FadeInDown.delay(i * 50)}>
                                    <ReviewItem review={r} />
                                </Animated.View>
                            )) : <Text style={{ color: theme.muted, fontSize: 14 }}>No reviews yet.</Text>}
                        </View>
                    </ScrollView>
                )}
            </View>
        </View>
    );
}
