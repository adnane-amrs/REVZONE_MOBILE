import { View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from '../ui/PressableScale';
import Text from '../ui/AppText';
import Avatar from '../ui/Avatar';
import StatusPill from '../ui/StatusPill';
import { theme } from '../../constants/theme';
import { rangeLabel } from '../../lib/dates';
import PriceTag from '../ui/PriceTag';

/** A trip (renter view) or a request (owner view). */
export default function BookingCard({ booking, onPress }) {
    const b = booking;
    const highlight = b.role === 'owner' && b.status === 'pending';
    return (
        <PressableScale onPress={onPress} scaleTo={0.98} accessibilityLabel={`${b.car?.brand} ${b.car?.model}, ${b.status}`}
            style={{ backgroundColor: theme.paper, borderRadius: 30, padding: 10, gap: 12, borderWidth: highlight ? 1.5 : 1, borderColor: highlight ? theme.accent : theme.line }}>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <View style={{ width: 92, height: 78, borderRadius: 22, overflow: 'hidden', backgroundColor: theme.surface2 }}>
                    {b.car?.cover ? <Image source={{ uri: b.car.cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                    <StatusPill status={b.status} size="sm" />
                    <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 16 }}>
                        {b.car ? `${b.car.brand} ${b.car.model}` : 'Deleted listing'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="calendar-outline" size={13} color={theme.muted} />
                        <Text style={{ color: theme.muted, fontSize: 13 }}>{rangeLabel(b.startDate, b.endDate)} · {b.days} day{b.days > 1 ? 's' : ''}</Text>
                    </View>
                </View>
            </View>
            <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: theme.canvas, borderRadius: 999, padding: 6, paddingRight: 16,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Avatar uri={b.otherParty?.profileImage} name={b.otherParty?.displayName} size={32} verified={b.otherParty?.licenseVerified} />
                    <View>
                        <Text style={{ color: theme.muted, fontSize: 11 }}>{b.role === 'owner' ? 'Renter' : 'Owner'}</Text>
                        <Text weight="semibold" numberOfLines={1} style={{ color: theme.text, fontSize: 13 }}>{b.otherParty?.displayName}</Text>
                    </View>
                </View>
                <PriceTag amount={b.totalPrice} size="sm" />
            </View>
            {b.canReview ? (
                <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: theme.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                    <Ionicons name="star" size={11} color={theme.onAccent} />
                    <Text weight="bold" style={{ color: theme.onAccent, fontSize: 11 }}>Review</Text>
                </View>
            ) : null}
        </PressableScale>
    );
}
