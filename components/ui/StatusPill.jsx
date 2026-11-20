import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './AppText';
import { BOOKING_STATUS } from '../../constants/app';

/** Colored booking status: Pending, Confirmed, On trip... */
export default function StatusPill({ status, size = 'md' }) {
    const s = BOOKING_STATUS[status] || BOOKING_STATUS.pending;
    const small = size === 'sm';
    return (
        <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
            backgroundColor: `${s.color}22`, borderRadius: 999,
            paddingHorizontal: small ? 9 : 12, paddingVertical: small ? 4 : 6,
        }}>
            <Ionicons name={s.icon} size={small ? 12 : 14} color={s.color} />
            <Text weight="bold" style={{ color: s.color, fontSize: small ? 11 : 12 }}>{s.label}</Text>
        </View>
    );
}
