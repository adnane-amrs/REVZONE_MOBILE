import { useEffect, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import KeyboardScroll from '../../components/ui/KeyboardScroll';
import { StarInput } from '../../components/ui/StarRating';
import { api } from '../../lib/api';
import { toast } from '../../store/toastStore';
import { theme, fonts } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

const MOODS = ['', 'Disappointing', 'Could be better', 'Good', 'Great', 'Excellent!'];

export default function LeaveReview() {
    const { bookingId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [booking, setBooking] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        api(`/bookings/${bookingId}`).then(b => {
            if (!b.canReview) {
                dialog.alert('Review', b.reviewed ? 'You already reviewed this trip.' : 'You can review once the trip is completed.');
                router.back();
                return;
            }
            setBooking(b);
        }).catch(e => {
            dialog.alert('Error', e.message);
            router.back();
        });
    }, [bookingId, router]);

    const submit = async () => {
        setSending(true);
        try {
            await api('/reviews', { method: 'POST', body: { bookingId, rating, comment: comment.trim() } });
            toast.success('Thanks for your review!');
            router.back();
        } catch (e) {
            dialog.alert('Could not send review', e.message);
        } finally {
            setSending(false);
        }
    };

    if (!booking) {
        return <View style={{ flex: 1, backgroundColor: theme.canvas, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.text} size="large" /></View>;
    }

    const renter = booking.role === 'renter';
    const other = booking.otherParty;

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker="Share your" title="Feedback" icon="chatbubble-ellipses" />
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                    <KeyboardScroll contentContainerStyle={{ padding: 20, gap: 18 }} offset={220}>
                        <Animated.View entering={FadeInDown.duration(450)} style={{ backgroundColor: theme.canvas, borderRadius: 32, padding: 22, paddingTop: 36, alignItems: 'center', gap: 16, marginTop: 22 }}>
                            <View style={{ position: 'absolute', top: -26, width: 52, height: 52, borderRadius: 26, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: theme.paper }}>
                                <Ionicons name={renter ? 'car-sport-outline' : 'person-outline'} size={22} color={theme.onAccent} />
                            </View>
                            <Avatar uri={other.profileImage} name={other.displayName} size={64} verified={other.licenseVerified} ring />
                            <Text weight="semibold" style={{ color: theme.text, fontSize: 16, textAlign: 'center' }}>
                                {renter
                                    ? `How was the ${booking.car?.brand} ${booking.car?.model} and ${other.displayName}?`
                                    : `How was ${other.displayName} as a renter?`}
                            </Text>
                            <StarInput value={rating} onChange={setRating} size={38} />
                            {rating ? (
                                <Animated.View key={rating} entering={ZoomIn.springify().damping(12)}>
                                    <Text weight="bold" style={{ color: theme.accentDeep, fontSize: 15 }}>{MOODS[rating]}</Text>
                                </Animated.View>
                            ) : <Text style={{ color: theme.muted, fontSize: 13 }}>Tap a star to rate</Text>}
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={{ backgroundColor: theme.canvas, borderRadius: 32, padding: 20, gap: 10 }}>
                            <Text weight="semibold" style={{ color: theme.textSoft, fontSize: 13 }}>Share additional details</Text>
                            <TextInput
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                maxLength={1000}
                                placeholder={renter ? 'Condition of the car, the hand-over, the owner…' : 'Punctuality, care of the car, communication…'}
                                placeholderTextColor={theme.muted}
                                selectionColor={theme.accentDeep}
                                style={{ backgroundColor: theme.paper, borderRadius: 22, padding: 16, minHeight: 120, textAlignVertical: 'top', color: theme.text, fontFamily: fonts.medium, fontSize: 15 }}
                            />
                            <Text style={{ color: theme.muted, fontSize: 12, alignSelf: 'flex-end' }}>{comment.length}/1000</Text>
                        </Animated.View>

                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 4 }}>
                            <Ionicons name="lock-closed" size={14} color={theme.muted} />
                            <Text style={{ color: theme.muted, fontSize: 12, flex: 1 }}>Reviews are public and can only be left after a completed trip.</Text>
                        </View>
                    </KeyboardScroll>
                    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 14 }}>
                        <Button title="Submit" size="lg" disabled={!rating} loading={sending} onPress={submit} />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
