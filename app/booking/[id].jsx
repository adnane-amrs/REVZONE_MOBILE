import { useCallback, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import PressableScale from '../../components/ui/PressableScale';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';
import { RatingBadge } from '../../components/ui/StarRating';
import { api } from '../../lib/api';
import { rangeLabel, shortDate } from '../../lib/dates';
import { toast } from '../../store/toastStore';
import { useCountsStore } from '../../store/countsStore';
import { theme } from '../../constants/theme';
import { formatMoney } from '../../constants/app';
import PriceTag from '../../components/ui/PriceTag';
import { dialog } from '../../store/dialogStore';

const STEPS = [
    { key: 'pending', label: 'Requested', icon: 'paper-plane' },
    { key: 'accepted', label: 'Confirmed', icon: 'checkmark' },
    { key: 'active', label: 'On trip', icon: 'car-sport' },
    { key: 'completed', label: 'Done', icon: 'flag' },
];

/** Progress line pending → confirmed → on trip → done, filling up with a spring. */
function Timeline({ status }) {
    const stopped = ['declined', 'cancelled'].includes(status);
    const reached = stopped ? 0 : STEPS.findIndex(s => s.key === status);
    const [width, setWidth] = useState(0);
    const fill = useAnimatedStyle(() => ({
        width: withDelay(250, withSpring(width ? (width * Math.max(0, reached)) / (STEPS.length - 1) : 0, { damping: 18 })),
    }), [reached, width]);

    return (
        <View style={{ paddingVertical: 6 }}>
            <View onLayout={(e) => setWidth(e.nativeEvent.layout.width - 40)} style={{ position: 'absolute', left: 20, right: 20, top: 24, height: 4, borderRadius: 2, backgroundColor: theme.surface2 }}>
                <Animated.View style={[{ height: 4, borderRadius: 2, backgroundColor: stopped ? theme.danger : theme.accent }, fill]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {STEPS.map((s, i) => {
                    const done = !stopped && i <= reached;
                    return (
                        <View key={s.key} style={{ alignItems: 'center', gap: 6, width: 64 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? theme.accent : theme.surface2, borderWidth: 3, borderColor: theme.paper }}>
                                <Ionicons name={s.icon} size={16} color={done ? theme.onAccent : theme.muted} />
                            </View>
                            <Text weight="semibold" style={{ color: done ? theme.text : theme.muted, fontSize: 11 }}>{s.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const Card = ({ children, style }) => <View style={[{ backgroundColor: theme.canvas, borderRadius: 28, padding: 18 }, style]}>{children}</View>;

export default function BookingDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const refreshCounts = useCountsStore(s => s.refresh);
    const [b, setB] = useState(null);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(null);

    const load = useCallback(async () => {
        try {
            setB(await api(`/bookings/${id}`));
        } catch (e) {
            setError(e.message);
        }
    }, [id]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const act = (action, { confirm, success } = {}) => {
        const run = async () => {
            setBusy(action);
            try {
                setB(await api(`/bookings/${id}/${action}`, { method: 'PATCH' }));
                toast.success(success);
                refreshCounts();
            } catch (e) {
                dialog.alert('Error', e.message);
                load();
            } finally {
                setBusy(null);
            }
        };
        if (confirm) {
            dialog.alert(confirm.title, confirm.message, [
                { text: 'Keep it', style: 'cancel' },
                { text: confirm.cta, style: 'destructive', onPress: run },
            ]);
        } else {
            run();
        }
    };

    if (error) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
                <Header kicker="Trip" title="Not found" icon="alert" />
                <EmptyState dark={false} icon="alert-circle-outline" title="Booking not found" message={error} />
            </View>
        );
    }
    if (!b) {
        return <View style={{ flex: 1, backgroundColor: theme.canvas, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.text} size="large" /></View>;
    }

    const isOwner = b.role === 'owner';
    const other = b.otherParty;

    // Actions available to this person for this status
    const actions = [];
    if (isOwner && b.status === 'pending') {
        actions.push(<Button key="accept" title="Accept request" icon="checkmark" loading={busy === 'accept'} onPress={() => act('accept', { success: 'Booking confirmed!' })} />);
        actions.push(<Button key="decline" title="Decline" variant="danger" loading={busy === 'decline'}
            onPress={() => act('decline', { success: 'Request declined', confirm: { title: 'Decline request', message: `Decline ${other.displayName}'s request?`, cta: 'Decline' } })} />);
    }
    if (!isOwner && b.status === 'pending') {
        actions.push(<Button key="cancel" title="Cancel request" variant="danger" loading={busy === 'cancel'}
            onPress={() => act('cancel', { success: 'Request cancelled', confirm: { title: 'Cancel request', message: 'Cancel this booking request?', cta: 'Cancel request' } })} />);
    }
    if (b.status === 'accepted') {
        actions.push(<Button key="cancel" title="Cancel booking" variant="danger" loading={busy === 'cancel'}
            onPress={() => act('cancel', { success: 'Booking cancelled', confirm: { title: 'Cancel booking', message: `${other.displayName} will be notified.`, cta: 'Cancel booking' } })} />);
    }
    if (isOwner && b.status === 'active') {
        actions.push(<Button key="complete" title="Car returned · End trip" icon="flag" loading={busy === 'complete'}
            onPress={() => act('complete', { success: 'Trip completed', confirm: { title: 'End the trip', message: 'Confirm the car was returned.', cta: 'End trip' } })} />);
    }
    if (b.canReview) {
        actions.push(<Button key="review" title={isOwner ? 'Review the renter' : 'Review your trip'} icon="star" onPress={() => router.push(`/review/${b._id}`)} />);
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker={isOwner ? 'Booking' : 'Your trip'} title={rangeLabel(b.startDate, b.endDate)} icon="calendar" />
            <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <PressableScale onPress={() => b.car && router.push(`/car/${b.car._id}`)} scaleTo={0.98}
                            style={{ borderRadius: 30, overflow: 'hidden', backgroundColor: theme.canvas }}>
                            {b.car?.cover ? <Image source={{ uri: b.car.cover }} style={{ width: '100%', height: 170 }} contentFit="cover" /> : null}
                            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 18 }}>{b.car ? `${b.car.brand} ${b.car.model}` : 'Deleted listing'}</Text>
                                    <Text style={{ color: theme.muted, fontSize: 13 }}>{b.car?.city} · {b.car?.year}</Text>
                                </View>
                                <StatusPill status={b.status} />
                            </View>
                        </PressableScale>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(60).duration(400)}>
                        <Card><Timeline status={b.status} /></Card>
                    </Animated.View>

                    {['declined', 'cancelled'].includes(b.status) ? (
                        <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                            <Ionicons name="information-circle" size={22} color={theme.danger} />
                            <Text style={{ color: theme.textSoft, flex: 1, fontSize: 13 }}>
                                {b.status === 'declined' ? 'The owner declined this request.'
                                    : b.cancelledBy === 'system' ? 'The request expired before the owner answered.'
                                        : `Cancelled by the ${b.cancelledBy}.`}
                            </Text>
                        </Card>
                    ) : null}

                    <Animated.View entering={FadeInDown.delay(120).duration(400)}>
                        <Card style={{ gap: 14 }}>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {[['Pick-up', b.startDate], ['Return', b.endDate]].map(([label, key]) => (
                                    <View key={label} style={{ flex: 1, backgroundColor: theme.surface2, borderRadius: 20, padding: 14 }}>
                                        <Text style={{ color: theme.muted, fontSize: 12 }}>{label}</Text>
                                        <Text weight="bold" style={{ color: theme.text, fontSize: 16 }}>{shortDate(key)}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: theme.textSoft, fontSize: 14 }}>{formatMoney(b.pricePerDay)} × {b.days} day{b.days > 1 ? 's' : ''}</Text>
                                <Text weight="semibold" style={{ color: theme.text, fontSize: 14 }}>{formatMoney(b.totalPrice)}</Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: theme.line }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text weight="bold" style={{ color: theme.text, fontSize: 16 }}>{isOwner ? 'You earn' : 'Total'}</Text>
                                <PriceTag amount={b.totalPrice} size="lg" />
                            </View>
                        </Card>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(180).duration(400)}>
                        <Card style={{ gap: 14 }}>
                            <PressableScale onPress={() => router.push(`/user/${other._id}`)} scaleTo={0.98} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Avatar uri={other.profileImage} name={other.displayName} size={52} verified={other.licenseVerified} />
                                <View style={{ flex: 1, gap: 2 }}>
                                    <Text style={{ color: theme.muted, fontSize: 12 }}>{isOwner ? 'Renter' : 'Owner'}</Text>
                                    <Text weight="bold" style={{ color: theme.text, fontSize: 16 }}>{other.displayName}</Text>
                                    <RatingBadge rating={other.averageRating} count={other.ratingCount} size={12} />
                                </View>
                                {other.licenseVerified ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.accentSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                                        <Ionicons name="shield-checkmark" size={12} color={theme.accentDeep} />
                                        <Text weight="bold" style={{ color: theme.accentDeep, fontSize: 11 }}>Verified</Text>
                                    </View>
                                ) : null}
                            </PressableScale>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Button title="Message" icon="chatbubble-ellipses-outline" variant="white" size="sm" onPress={() => router.push(`/chat/${b._id}`)} />
                                </View>
                                {b.otherPartyPhone ? (
                                    <View style={{ flex: 1 }}>
                                        <Button title="Call" icon="call-outline" variant="ink" size="sm" onPress={() => Linking.openURL(`tel:${b.otherPartyPhone.replace(/\s/g, '')}`)} />
                                    </View>
                                ) : null}
                            </View>
                            {!b.otherPartyPhone && ['pending'].includes(b.status) ? (
                                <Text style={{ color: theme.muted, fontSize: 12 }}>Phone numbers are shared once the booking is confirmed.</Text>
                            ) : null}
                        </Card>
                    </Animated.View>

                    {b.message ? (
                        <Card style={{ gap: 6 }}>
                            <Text weight="semibold" style={{ color: theme.muted, fontSize: 12 }}>Message from the renter</Text>
                            <Text style={{ color: theme.text, fontSize: 14, lineHeight: 21 }}>“{b.message}”</Text>
                        </Card>
                    ) : null}

                    {actions.length ? <View style={{ gap: 10, marginTop: 4 }}>{actions}</View> : null}
                    {b.reviewed ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.accentDeep} />
                            <Text style={{ color: theme.muted, fontSize: 13 }}>You reviewed this trip</Text>
                        </View>
                    ) : null}
                </ScrollView>
            </View>
        </View>
    );
}
