import { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown, FadeInUp, interpolate, Extrapolation, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue,
    useAnimatedReaction, runOnJS,
} from 'react-native-reanimated';
import Text from '../../../components/ui/AppText';
import Button from '../../../components/ui/Button';
import IconButton from '../../../components/ui/IconButton';
import PressableScale from '../../../components/ui/PressableScale';
import Avatar from '../../../components/ui/Avatar';
import EmptyState from '../../../components/ui/EmptyState';
import { Tag } from '../../../components/ui/Chip';
import { RatingBadge } from '../../../components/ui/StarRating';
import PhotoGallery from '../../../components/cars/PhotoGallery';
import ReviewItem from '../../../components/cars/ReviewItem';
import { api } from '../../../lib/api';
import { memberSince } from '../../../lib/dates';
import { toast } from '../../../store/toastStore';
import { theme, statusBarStyle } from '../../../constants/theme';
import { FEATURES, TRANSMISSIONS, FUEL_TYPES, labelOf, iconOf, formatMoney } from '../../../constants/app';
import { dialog } from '../../../store/dialogStore';

const GALLERY_H = 400;
const { width } = Dimensions.get('window');

const SpecTile = ({ icon, label, value }) => (
    <View style={{ width: (width - 40 - 10) / 2, backgroundColor: theme.paper, borderRadius: 24, padding: 16, gap: 10, borderWidth: 1, borderColor: theme.line }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: theme.iconBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={icon} size={19} color={theme.iconFg} />
        </View>
        <View>
            <Text style={{ color: theme.muted, fontSize: 12 }}>{label}</Text>
            <Text weight="bold" style={{ color: theme.text, fontSize: 15 }}>{value}</Text>
        </View>
    </View>
);

const SectionTitle = ({ children, right }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text weight="bold" style={{ color: theme.text, fontSize: 19 }}>{children}</Text>
        {right}
    </View>
);

export default function CarDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [car, setCar] = useState(null);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);
    // Light status bar icons over the photo, dark ones once the light top bar appears
    const [solidTop, setSolidTop] = useState(false);
    const [toggling, setToggling] = useState(false);

    const load = useCallback(async () => {
        try {
            setCar(await api(`/cars/${id}`));
            setError(null);
        } catch (e) {
            setError(e.message);
        }
    }, [id]);

    // Reload when coming back from edit / availability screens
    useFocusEffect(useCallback(() => { load(); }, [load]));

    const scrollY = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });
    useAnimatedReaction(
        () => scrollY.value > GALLERY_H - 120,
        (solid, previous) => { if (solid !== previous) runOnJS(setSolidTop)(solid); },
    );

    // Parallax: the photo moves slower than the content and zooms when pulled down
    const galleryStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(scrollY.value, [-200, 0, GALLERY_H], [-100, 0, GALLERY_H * 0.45], Extrapolation.CLAMP) },
            { scale: interpolate(scrollY.value, [-200, 0], [1.5, 1], Extrapolation.CLAMP) },
        ],
    }));
    // Solid top bar fades in once the photo is scrolled away
    const topBarStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [GALLERY_H - 160, GALLERY_H - 80], [0, 1], Extrapolation.CLAMP),
    }));

    const toggleActive = async () => {
        setToggling(true);
        try {
            const res = await api(`/cars/${id}/active`, { method: 'PATCH', body: { isActive: !car.isActive } });
            setCar(c => ({ ...c, isActive: res.isActive }));
            toast.success(res.isActive ? 'Listing is live again' : 'Listing paused');
        } catch (e) {
            dialog.alert('Error', e.message);
        } finally {
            setToggling(false);
        }
    };

    if (error) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
                <IconButton icon="arrow-back" onPress={() => router.back()} />
                <EmptyState icon="car-outline" title="Car not found" message={error} actionLabel="Back to Explore" onAction={() => router.replace('/explore')} />
            </View>
        );
    }
    if (!car) {
        return <View style={{ flex: 1, backgroundColor: theme.canvas, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.accent} size="large" /></View>;
    }

    const owner = car.owner;
    const features = FEATURES.filter(f => car.features?.includes(f.value));

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas }}>
            <StatusBar style={solidTop ? statusBarStyle() : 'light'} />
            <Animated.ScrollView
                onScroll={onScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
            >
                {/* Inside the scroll content so the photos stay swipeable */}
                <Animated.View style={galleryStyle}>
                    <PhotoGallery photos={car.photos} height={GALLERY_H} />
                </Animated.View>

                <View style={{ marginTop: -36, backgroundColor: theme.canvas, borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 20, paddingTop: 26, gap: 30, minHeight: 600 }}>
                    <Animated.View entering={FadeInDown.duration(450)} style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <Tag label={car.city} icon="location" color={theme.accentSoft} textColor={theme.accentDeep} />
                            {car.tripCount ? <Tag label={`${car.tripCount} trips`} icon="flag" /> : <Tag label="New listing" icon="sparkles" />}
                            {car.isOwner && !car.isActive ? <Tag label="Paused" icon="pause" color="#F59E0B22" textColor={theme.warningText} /> : null}
                            {car.moderationStatus === 'hidden' ? <Tag label="Hidden by admin" icon="eye-off" color="#E5484D22" textColor={theme.danger} /> : null}
                        </View>
                        <Text weight="extrabold" style={{ color: theme.text, fontSize: 30, lineHeight: 36 }}>{car.brand} {car.model}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <RatingBadge rating={car.averageRating} count={car.ratingCount} size={14} />
                            <Text style={{ color: theme.muted, fontSize: 14 }}>· {car.year}</Text>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(80).duration(450)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        <SpecTile icon="people-outline" label="Seats" value={`${car.seats} seats`} />
                        <SpecTile icon={iconOf(TRANSMISSIONS, car.transmission)} label="Gearbox" value={labelOf(TRANSMISSIONS, car.transmission)} />
                        <SpecTile icon={iconOf(FUEL_TYPES, car.fuelType)} label="Fuel" value={labelOf(FUEL_TYPES, car.fuelType)} />
                        <SpecTile icon="calendar-outline" label="Year" value={String(car.year)} />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(140).duration(450)}>
                        <SectionTitle>About this car</SectionTitle>
                        <Text numberOfLines={expanded ? undefined : 4} style={{ color: theme.textSoft, fontSize: 15, lineHeight: 23 }}>{car.description}</Text>
                        {car.description?.length > 180 ? (
                            <PressableScale onPress={() => setExpanded(e => !e)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Text weight="bold" style={{ color: theme.accentDeep, fontSize: 14, textDecorationLine: 'underline' }}>{expanded ? 'Show less' : 'Read more'}</Text>
                                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={theme.accentDeep} />
                                </View>
                            </PressableScale>
                        ) : null}
                    </Animated.View>

                    {features.length ? (
                        <View>
                            <SectionTitle>Features</SectionTitle>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {features.map(f => (
                                    <View key={f.value} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: theme.paper, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.line }}>
                                        <Ionicons name={f.icon} size={16} color={theme.accentDeep} />
                                        <Text weight="semibold" style={{ color: theme.text, fontSize: 13 }}>{f.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}

                    {owner ? (
                        <View>
                            <SectionTitle>Hosted by</SectionTitle>
                            <PressableScale onPress={() => router.push(`/user/${owner._id}`)} scaleTo={0.98}
                                style={{ backgroundColor: theme.paper, borderRadius: 28, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: theme.line }}>
                                <Avatar uri={owner.profileImage} name={owner.displayName} size={58} verified={owner.licenseVerified} />
                                <View style={{ flex: 1, gap: 3 }}>
                                    <Text weight="bold" style={{ color: theme.text, fontSize: 17 }}>{owner.displayName}</Text>
                                    <RatingBadge rating={owner.averageRating} count={owner.ratingCount} dark={false} />
                                    <Text style={{ color: theme.muted, fontSize: 12 }}>Member since {memberSince(owner.memberSince)}</Text>
                                </View>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.ink, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name="arrow-forward" size={20} color={theme.accentLight} style={{ transform: [{ rotate: '-45deg' }] }} />
                                </View>
                            </PressableScale>
                        </View>
                    ) : null}

                    <View>
                        <SectionTitle right={car.ratingCount ? <RatingBadge rating={car.averageRating} count={car.ratingCount} /> : null}>Reviews</SectionTitle>
                        {car.reviews?.length ? (
                            <View style={{ gap: 10 }}>
                                {car.reviews.map((r, i) => (
                                    <Animated.View key={r._id} entering={FadeInDown.delay(i * 60)}>
                                        <ReviewItem review={r} />
                                    </Animated.View>
                                ))}
                            </View>
                        ) : (
                            <View style={{ backgroundColor: theme.paper, borderRadius: 24, padding: 20, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: theme.line }}>
                                <Ionicons name="chatbubble-ellipses-outline" size={26} color={theme.muted} />
                                <Text style={{ color: theme.muted, fontSize: 14 }}>No reviews yet. Be the first to drive it!</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Top bar: transparent over the photo, solid after scrolling */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 10 }}>
                <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.canvas, borderBottomWidth: 1, borderColor: theme.line }, topBarStyle]} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <IconButton icon="arrow-back" variant="glass" onPress={() => router.back()} accessibilityLabel="Back" />
                    <Animated.View style={[{ flex: 1 }, topBarStyle]}>
                        <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 16 }}>{car.brand} {car.model}</Text>
                    </Animated.View>
                    {car.isOwner ? <IconButton icon="create-outline" variant="glass" onPress={() => router.push(`/listing/${car._id}/edit`)} accessibilityLabel="Edit listing" /> : null}
                </View>
            </View>

            {/* Sticky bottom bar */}
            <Animated.View entering={FadeInUp.delay(200).springify().damping(18)} style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 12 }}>
                <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.surface, borderRadius: 999, padding: 8, paddingLeft: 22,
                    borderWidth: 1, borderColor: theme.line, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
                }}>
                    {car.isOwner ? (
                        <>
                            <View style={{ flex: 1 }}>
                                <Button title={car.isActive ? 'Pause' : 'Resume'} icon={car.isActive ? 'pause' : 'play'} variant="dark" loading={toggling} onPress={toggleActive} />
                            </View>
                            <View style={{ flex: 1.3 }}>
                                <Button title="Availability" icon="calendar" onPress={() => router.push(`/car/${car._id}/availability`)} />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={{ flex: 1 }}>
                                <Text weight="extrabold" style={{ color: theme.text, fontSize: 20 }}>{formatMoney(car.pricePerDay)}</Text>
                                <Text style={{ color: theme.muted, fontSize: 12 }}>per day · all included</Text>
                            </View>
                            <Button title="Book now" iconRight="arrow-forward" full={false} onPress={() => router.push(`/car/${car._id}/book`)} />
                        </>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}
