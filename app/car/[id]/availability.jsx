import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../../../components/ui/AppText';
import Header from '../../../components/ui/Header';
import Button from '../../../components/ui/Button';
import DateRangeCalendar from '../../../components/booking/DateRangeCalendar';
import { api } from '../../../lib/api';
import { expandRanges } from '../../../lib/dates';
import { toast } from '../../../store/toastStore';
import { theme } from '../../../constants/theme';
import { dialog } from '../../../store/dialogStore';

/** Owner blocks the days the car is not available. Days booked by renters are locked. */
export default function Availability() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [car, setCar] = useState(null);
    const [blocked, setBlocked] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api(`/cars/${id}`).then(c => {
            if (!c.isOwner) {
                router.back();
                return;
            }
            setCar(c);
            setBlocked(c.blockedDates || []);
        }).catch(e => {
            dialog.alert('Error', e.message);
            router.back();
        });
    }, [id, router]);

    const booked = useMemo(() => expandRanges(car?.bookedRanges), [car]);
    const changed = car && JSON.stringify([...blocked].sort()) !== JSON.stringify([...(car.blockedDates || [])].sort());

    const save = async () => {
        setSaving(true);
        try {
            const res = await api(`/cars/${id}/availability`, { method: 'PUT', body: { blockedDates: blocked } });
            setCar(c => ({ ...c, blockedDates: res.blockedDates }));
            toast.success('Availability saved');
            router.back();
        } catch (e) {
            dialog.alert('Could not save', e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker={car ? `${car.brand} ${car.model}` : 'Your car'} title="Availability" icon="calendar" />
            <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                {!car ? (
                    <ActivityIndicator color={theme.accentDeep} style={{ marginTop: 60 }} />
                ) : (
                    <>
                        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
                            <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', gap: 12, backgroundColor: theme.canvas, borderRadius: 24, padding: 16 }}>
                                <Ionicons name="information-circle" size={22} color={theme.accentDeep} />
                                <Text style={{ color: theme.textSoft, fontSize: 13, lineHeight: 19, flex: 1 }}>
                                    Tap the days your car is <Text weight="bold" style={{ color: theme.text, fontSize: 13 }}>not available</Text>. Renters won&apos;t be able to book them. Days already booked by a renter are locked.
                                </Text>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={{ backgroundColor: theme.canvas, borderRadius: 28, padding: 16 }}>
                                <DateRangeCalendar mode="multiple" value={blocked} onChange={setBlocked} disabledKeys={booked} />
                            </Animated.View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text weight="semibold" style={{ color: theme.text, fontSize: 14 }}>{blocked.length} day{blocked.length === 1 ? '' : 's'} blocked</Text>
                                {blocked.length ? <Text weight="bold" onPress={() => setBlocked([])} style={{ color: theme.accentDeep, fontSize: 14 }}>Clear all</Text> : null}
                            </View>
                        </ScrollView>
                        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 14, borderTopWidth: 1, borderColor: theme.line }}>
                            <Button title={changed ? 'Save availability' : 'No changes'} icon="checkmark" disabled={!changed} loading={saving} onPress={save} />
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}
