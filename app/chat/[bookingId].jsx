import { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, AppState } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import IconButton from '../../components/ui/IconButton';
import PressableScale from '../../components/ui/PressableScale';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import { api } from '../../lib/api';
import { clockTime, rangeLabel, shortDate, keyOf } from '../../lib/dates';
import { toast } from '../../store/toastStore';
import { theme, fonts, statusBarStyle } from '../../constants/theme';

const POLL_MS = 4000;

const dayLabel = (iso) => {
    const key = keyOf(new Date(iso));
    const today = keyOf(new Date());
    const yesterday = keyOf(new Date(Date.now() - 86400000));
    return key === today ? 'Today' : key === yesterday ? 'Yesterday' : shortDate(key);
};

export default function Chat() {
    const { bookingId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [booking, setBooking] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const listRef = useRef(null);
    const lastAt = useRef(null);

    const merge = (incoming) => {
        if (!incoming.length) return;
        lastAt.current = incoming[incoming.length - 1].createdAt;
        setMessages(prev => {
            const ids = new Set(prev.map(m => m._id));
            return [...prev, ...incoming.filter(m => !ids.has(m._id))];
        });
    };

    const poll = useCallback(async () => {
        try {
            const after = lastAt.current ? `?after=${encodeURIComponent(lastAt.current)}` : '';
            const data = await api(`/messages/${bookingId}${after}`);
            setBooking(data.booking);
            merge(data.messages);
        } catch (e) {
            if (!lastAt.current) setError(e.message);
        }
    }, [bookingId]);

    // Poll for new messages while the screen is open and the app is in the foreground
    useEffect(() => {
        poll();
        let timer = setInterval(poll, POLL_MS);
        const sub = AppState.addEventListener('change', (state) => {
            clearInterval(timer);
            if (state === 'active') {
                poll();
                timer = setInterval(poll, POLL_MS);
            }
        });
        return () => {
            clearInterval(timer);
            sub.remove();
        };
    }, [poll]);

    const send = async () => {
        const value = text.trim();
        if (!value || sending) return;
        setSending(true);
        setText('');
        // Optimistic bubble, replaced by the server copy
        const tempId = `temp-${Date.now()}`;
        setMessages(prev => [...prev, { _id: tempId, text: value, mine: true, createdAt: new Date().toISOString(), pending: true }]);
        try {
            const saved = await api(`/messages/${bookingId}`, { method: 'POST', body: { text: value } });
            // A poll may already have fetched this message: never show it twice
            setMessages(prev => (prev.some(m => m._id === saved._id)
                ? prev.filter(m => m._id !== tempId)
                : prev.map(m => (m._id === tempId ? saved : m))));
            if (!lastAt.current || saved.createdAt > lastAt.current) lastAt.current = saved.createdAt;
        } catch (e) {
            setMessages(prev => prev.filter(m => m._id !== tempId));
            setText(value);
            toast.error(e.message);
        } finally {
            setSending(false);
        }
    };

    const closed = booking && ['declined', 'cancelled'].includes(booking.status);
    const other = booking?.otherParty;

    const renderItem = ({ item, index }) => {
        const prev = messages[index - 1];
        const showDay = !prev || dayLabel(prev.createdAt) !== dayLabel(item.createdAt);
        const mine = item.mine;
        return (
            <View>
                {showDay ? (
                    <View style={{ alignItems: 'center', marginVertical: 12 }}>
                        <Text weight="semibold" style={{ color: theme.muted, fontSize: 11, backgroundColor: theme.surface2, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' }}>{dayLabel(item.createdAt)}</Text>
                    </View>
                ) : null}
                <Animated.View entering={FadeInUp.duration(250)} style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                    <View style={{
                        maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 11,
                        backgroundColor: mine ? theme.accent : theme.paper,
                        borderWidth: mine ? 0 : 1, borderColor: theme.line,
                        borderRadius: 22, borderBottomRightRadius: mine ? 6 : 22, borderBottomLeftRadius: mine ? 22 : 6,
                        opacity: item.pending ? 0.6 : 1,
                    }}>
                        <Text style={{ color: mine ? theme.onAccent : theme.text, fontSize: 15, lineHeight: 21 }}>{item.text}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 3 }}>
                            <Text style={{ color: mine ? theme.onAccentMuted : theme.muted, fontSize: 10 }}>{clockTime(item.createdAt)}</Text>
                            {mine ? <Ionicons name={item.pending ? 'time-outline' : item.readAt ? 'checkmark-done' : 'checkmark'} size={12} color={theme.onAccentMuted} /> : null}
                        </View>
                    </View>
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas }}>
            <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: theme.paper, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: theme.ink, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
                <StatusBar style={statusBarStyle()} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <IconButton icon="arrow-back" onPress={() => router.back()} accessibilityLabel="Back" />
                    {booking ? (
                        <PressableScale onPress={() => router.push(`/booking/${bookingId}`)} scaleTo={0.98}
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.canvas, borderRadius: 999, padding: 6, paddingRight: 14 }}>
                            <Avatar uri={other?.profileImage} name={other?.displayName} size={40} verified={other?.licenseVerified} />
                            <View style={{ flex: 1 }}>
                                <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 15 }}>{other?.displayName}</Text>
                                <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 12 }}>{booking.car.brand} {booking.car.model} · {rangeLabel(booking.startDate, booking.endDate)}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                        </PressableScale>
                    ) : <View style={{ flex: 1 }} />}
                </View>
            </View>

            {/* Android draws edge-to-edge: "padding" lifts the message bar above the keyboard on both platforms */}
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                {!booking && !error ? (
                    <ActivityIndicator color={theme.accentDeep} style={{ marginTop: 40 }} />
                ) : error ? (
                    <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>{error}</Text>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={(m) => m._id}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16, paddingBottom: 8, flexGrow: 1 }}
                        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                        ListHeaderComponent={(
                            <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <StatusPill status={booking.status} />
                                <Text style={{ color: theme.muted, fontSize: 12, textAlign: 'center' }}>
                                    Keep payments and personal details inside RevZone.
                                </Text>
                            </Animated.View>
                        )}
                        ListEmptyComponent={(
                            <View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}>
                                <Ionicons name="chatbubbles-outline" size={36} color={theme.surface3} />
                                <Text style={{ color: theme.muted }}>No messages yet. Say hello!</Text>
                            </View>
                        )}
                    />
                )}

                {closed ? (
                    <View style={{ padding: 16, paddingBottom: insets.bottom + 16, alignItems: 'center' }}>
                        <Text style={{ color: theme.muted, fontSize: 13 }}>This booking is {booking.status}. The conversation is closed.</Text>
                    </View>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 10 }}>
                        <View style={{ flex: 1, backgroundColor: theme.paper, borderRadius: 26, borderWidth: 1, borderColor: theme.line, paddingHorizontal: 18, paddingVertical: Platform.OS === 'ios' ? 14 : 6, maxHeight: 130 }}>
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder="Write a message…"
                                placeholderTextColor={theme.muted}
                                selectionColor={theme.accentDeep}
                                multiline
                                maxLength={1000}
                                style={{ color: theme.text, fontFamily: fonts.medium, fontSize: 15 }}
                            />
                        </View>
                        <IconButton icon="arrow-up" variant={text.trim() ? 'accent' : 'dark'} size={52} onPress={send} accessibilityLabel="Send" />
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}
