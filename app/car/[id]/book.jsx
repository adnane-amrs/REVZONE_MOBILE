import { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Text from '../../../components/ui/AppText';
import Header from '../../../components/ui/Header';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import KeyboardScroll from '../../../components/ui/KeyboardScroll';
import DateRangeCalendar from '../../../components/booking/DateRangeCalendar';
import { api } from '../../../lib/api';
import { expandRanges, daysBetween, rangeLabel, eachDayKey, todayKey } from '../../../lib/dates';
import { toast } from '../../../store/toastStore';
import { useSearchStore } from '../../../store/searchStore';
import { theme } from '../../../constants/theme';
import { formatMoney } from '../../../constants/app';
import PriceTag from '../../../components/ui/PriceTag';
import { dialog } from '../../../store/dialogStore';

const Line = ({ label, value, strong }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text weight={strong ? 'bold' : 'regular'} style={{ color: strong ? theme.onInk : theme.onInkMuted, fontSize: strong ? 16 : 14 }}>{label}</Text>
        <Text weight={strong ? 'extrabold' : 'semibold'} style={{ color: theme.onInk, fontSize: strong ? 22 : 14 }}>{value}</Text>
    </View>
);

export default function BookCar() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const searchStart = useSearchStore(s => s.start);
    const searchEnd = useSearchStore(s => s.end);
    const [car, setCar] = useState(null);
    const [range, setRange] = useState({ start: null, end: null });
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        api(`/cars/${id}`).then(c => {
            setCar(c);
            // Reuse the dates from the Explore search when they are still free
            const taken = new Set([...expandRanges(c.bookedRanges), ...(c.blockedDates || [])]);
            if (searchStart && searchEnd && searchStart >= todayKey()) {
                const free = !eachDayKey(searchStart, searchEnd).some(k => taken.has(k));
                if (free) setRange({ start: searchStart, end: searchEnd });
            }
        }).catch(e => {
            dialog.alert('Error', e.message);
            router.back();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const unavailable = useMemo(
        () => new Set([...expandRanges(car?.bookedRanges), ...(car?.blockedDates || [])]),
        [car],
    );

    const days = range.start && range.end ? daysBetween(range.start, range.end) : 0;
    const total = days * (car?.pricePerDay || 0);

    const send = async () => {
        setSending(true);
        try {
            const res = await api('/bookings', {
                method: 'POST',
                body: { carId: id, startDate: range.start, endDate: range.end, message: message.trim() },
            });
            toast.success('Request sent! The owner will reply soon.');
            router.replace(`/booking/${res._id}`);
        } catch (e) {
            dialog.alert('Could not book', e.message);
        } finally {
            setSending(false);
        }
    };

    if (!car) {
        return <View style={{ flex: 1, backgroundColor: theme.canvas, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.text} size="large" /></View>;
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker="Book your" title="Trip" icon="calendar" />
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                    <KeyboardScroll contentContainerStyle={{ padding: 20, gap: 18 }}>
                        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: theme.canvas, borderRadius: 26, padding: 10 }}>
                            <Image source={{ uri: car.cover }} style={{ width: 84, height: 70, borderRadius: 18 }} contentFit="cover" />
                            <View style={{ flex: 1 }}>
                                <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 16 }}>{car.brand} {car.model}</Text>
                                <Text style={{ color: theme.muted, fontSize: 13 }}>{car.city} · {car.year}</Text>
                                <PriceTag amount={car.pricePerDay} unit="/day" size="sm" style={{ marginTop: 4 }} />
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(70).duration(400)} style={{ backgroundColor: theme.canvas, borderRadius: 28, padding: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                                <Text weight="bold" style={{ color: theme.text, fontSize: 15 }}>
                                    {range.start && !range.end ? 'Now pick the return day' : 'Pick-up and return'}
                                </Text>
                                <Text weight="semibold" style={{ color: range.start ? theme.accentDeep : theme.muted, fontSize: 14 }}>
                                    {range.start ? rangeLabel(range.start, range.end) : 'Select dates'}
                                </Text>
                            </View>
                            <DateRangeCalendar value={range} onChange={setRange} disabledKeys={unavailable} maxDays={car.maxRentalDays || 30} />
                        </Animated.View>

                        {days > 0 ? (
                            <Animated.View entering={FadeInDown.springify().damping(16)} style={{ backgroundColor: theme.ink, borderRadius: 28, padding: 20, gap: 10 }}>
                                <Line label={`${formatMoney(car.pricePerDay)} × ${days} day${days > 1 ? 's' : ''}`} value={formatMoney(total)} />
                                <Line label="Service fee" value="Free" />
                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 4 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text weight="bold" style={{ color: theme.onInk, fontSize: 16 }}>Total</Text>
                                    <Animated.View key={total} entering={ZoomIn.springify().damping(12)}>
                                        <Text weight="extrabold" style={{ color: theme.accentLight, fontSize: 24 }}>{formatMoney(total)}</Text>
                                    </Animated.View>
                                </View>
                            </Animated.View>
                        ) : null}

                        <TextField label="Message to the owner (optional)" multiline maxLength={500} value={message} onChangeText={setMessage}
                            placeholder="Introduce yourself and say what the trip is for…" />

                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                            <Ionicons name="shield-checkmark" size={18} color={theme.accentDeep} />
                            <Text style={{ color: theme.muted, fontSize: 12, lineHeight: 18, flex: 1 }}>
                                You won&apos;t be charged now. The owner has to accept your request, then you can chat to arrange the pick-up.
                            </Text>
                        </View>
                    </KeyboardScroll>

                    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 14, borderTopWidth: 1, borderColor: theme.line }}>
                        <Button
                            title={days ? `Request to book · ${formatMoney(total)}` : 'Select your dates'}
                            icon="paper-plane"
                            size="lg"
                            disabled={!days}
                            loading={sending}
                            onPress={send}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
