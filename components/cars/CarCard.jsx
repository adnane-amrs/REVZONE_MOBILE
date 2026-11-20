import { View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from '../ui/PressableScale';
import Text from '../ui/AppText';
import Avatar from '../ui/Avatar';
import { theme } from '../../constants/theme';
import { labelOf, TRANSMISSIONS } from '../../constants/app';
import PriceTag from '../ui/PriceTag';

/**
 * Car listing card: photo on top, then name + price, city, rating.
 * `width` makes a fixed-size card for horizontal carousels; without it the card fills the row.
 */
export default function CarCard({ car, onPress, width }) {
    const small = !!width;
    return (
        <PressableScale onPress={onPress} scaleTo={0.98} accessibilityLabel={`${car.brand} ${car.model}`}
            style={{
                width, backgroundColor: theme.paper, borderRadius: 24, padding: 8,
                borderWidth: 1, borderColor: theme.line,
                shadowColor: '#000', shadowOpacity: theme.mode === 'dark' ? 0 : 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: theme.mode === 'dark' ? 0 : 2,
            }}>
            <View style={{ height: small ? 130 : 190, borderRadius: 18, overflow: 'hidden', backgroundColor: theme.surface2 }}>
                <Image source={{ uri: car.cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={250} />
                {!small ? (
                    <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(11,11,15,0.82)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                        <Text weight="semibold" style={{ color: '#FFFFFF', fontSize: 11 }}>{labelOf(TRANSMISSIONS, car.transmission)} · {car.seats} seats</Text>
                    </View>
                ) : null}
            </View>

            <View style={{ paddingHorizontal: 6, paddingTop: 10, paddingBottom: 4, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Text weight="bold" numberOfLines={1} style={{ flex: 1, color: theme.text, fontSize: small ? 14 : 16 }}>{car.brand} {car.model}</Text>
                    <PriceTag amount={car.pricePerDay} unit="/day" size={small ? 'sm' : 'md'} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: -8 }}>
                    <View style={{ flex: 1, gap: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Ionicons name="location-outline" size={13} color={theme.muted} />
                            <Text numberOfLines={1} style={{ color: theme.textSoft, fontSize: 12 }}>{car.city}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Ionicons name={car.ratingCount ? 'star' : 'star-outline'} size={13} color={theme.star} />
                            <Text style={{ color: theme.textSoft, fontSize: 12 }}>
                                {car.ratingCount ? `${Number(car.averageRating).toFixed(1)} (${car.tripCount || car.ratingCount} trip${(car.tripCount || car.ratingCount) > 1 ? 's' : ''})` : 'New'}
                            </Text>
                        </View>
                    </View>
                    {car.owner && !small ? <Avatar uri={car.owner.profileImage} name={car.owner.displayName} size={30} verified={car.owner.licenseVerified} /> : null}
                </View>
            </View>
        </PressableScale>
    );
}
