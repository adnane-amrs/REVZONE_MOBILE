import { View } from 'react-native';
import Text from '../ui/AppText';
import Avatar from '../ui/Avatar';
import { Stars } from '../ui/StarRating';
import { theme } from '../../constants/theme';
import { timeAgo } from '../../lib/dates';

/** One review: avatar, name, stars, date, comment. */
export default function ReviewItem({ review, light = false }) {
    const r = review;
    return (
        <View style={{ backgroundColor: theme.paper, borderRadius: 24, padding: 16, gap: 10, borderWidth: light ? 0 : 1, borderColor: theme.line }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar uri={r.reviewer?.profileImage} name={r.reviewer?.displayName} size={40} verified={r.reviewer?.licenseVerified} />
                <View style={{ flex: 1 }}>
                    <Text weight="bold" style={{ color: theme.text, fontSize: 14 }}>{r.reviewer?.displayName || 'RevZone member'}</Text>
                    <Text style={{ color: theme.muted, fontSize: 12 }}>
                        {timeAgo(r.createdAt)}{r.car ? ` · ${r.car.brand} ${r.car.model}` : ''}
                    </Text>
                </View>
                <Stars value={r.rating} size={13} />
            </View>
            {r.comment ? <Text style={{ color: theme.textSoft, fontSize: 14, lineHeight: 21 }}>{r.comment}</Text> : null}
        </View>
    );
}
