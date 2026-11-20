import { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ScreenCapture from 'expo-screen-capture';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Header from '../../components/ui/Header';
import SegmentedControl from '../../components/ui/SegmentedControl';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { useAdminStore } from '../../store/adminStore';
import { toast } from '../../store/toastStore';
import { timeAgo } from '../../lib/dates';
import { theme } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

const REJECT_REASONS = ['The photo is not readable', 'The license is expired', 'The name does not match the account'];

/** Admin review queue for driver licenses (images come as signed, private URLs). */
export default function LicenseQueue() {
    const insets = useSafeAreaInsets();
    const { licenses, getLicenses, reviewLicense } = useAdminStore();
    const [tab, setTab] = useState('pending');
    const [loaded, setLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [busy, setBusy] = useState(null);

    const load = useCallback(async (status) => {
        await getLicenses(status);
        setLoaded(true);
    }, [getLicenses]);

    useFocusEffect(useCallback(() => {
        load(tab);
        // Identity documents on screen: block screenshots
        ScreenCapture.preventScreenCaptureAsync().catch(() => {});
        return () => { ScreenCapture.allowScreenCaptureAsync().catch(() => {}); };
    }, [load, tab]));

    const decide = async (item, decision, reason = '') => {
        setBusy(item._id + decision);
        const res = await reviewLicense(item._id, decision, reason);
        setBusy(null);
        if (res.success) toast.success(decision === 'approve' ? `${item.username} is now verified` : 'License rejected');
        else dialog.alert('Error', res.error);
    };

    const reject = (item) => {
        dialog.alert('Reject license', 'Choose a reason (the user will see it)', [
            ...REJECT_REASONS.map(r => ({ text: r, onPress: () => decide(item, 'reject', r) })),
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const renderItem = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 60).duration(350)} exiting={FadeOutLeft} layout={LinearTransition} style={{ marginBottom: 14 }}>
            <View style={{ backgroundColor: theme.canvas, borderRadius: 28, padding: 12, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar uri={item.profileImage} name={item.fullName || item.username} size={44} />
                    <View style={{ flex: 1 }}>
                        <Text weight="bold" style={{ color: theme.text, fontSize: 15 }}>{item.fullName || item.username}</Text>
                        <Text style={{ color: theme.muted, fontSize: 12 }}>{item.email} · {timeAgo(item.submittedAt)}</Text>
                    </View>
                </View>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 190, borderRadius: 20, backgroundColor: theme.surface2 }} contentFit="contain" />
                ) : null}
                {item.status === 'rejected' && item.rejectionReason ? <Text style={{ color: theme.danger, fontSize: 12 }}>Rejected: {item.rejectionReason}</Text> : null}
                {item.status === 'pending' ? (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}><Button title="Reject" variant="danger" size="sm" loading={busy === item._id + 'reject'} onPress={() => reject(item)} /></View>
                        <View style={{ flex: 1 }}><Button title="Approve" icon="checkmark" size="sm" loading={busy === item._id + 'approve'} onPress={() => decide(item, 'approve')} /></View>
                    </View>
                ) : null}
            </View>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker="Admin" title="Driver licenses" icon="id-card" />
            <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                <View style={{ padding: 20, paddingBottom: 8 }}>
                    <SegmentedControl value={tab} onChange={(v) => { setTab(v); setLoaded(false); }}
                        options={[{ value: 'pending', label: 'To review' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
                </View>
                <FlatList
                    data={loaded ? licenses : []}
                    keyExtractor={(l) => l._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: insets.bottom + 30 }}
                    ListEmptyComponent={!loaded ? <View>{[0, 1].map(i => <RowSkeleton key={i} />)}</View> : (
                        <EmptyState icon="shield-checkmark-outline" title={tab === 'pending' ? 'Nothing to review' : 'No licenses here'} message={tab === 'pending' ? 'New uploads will appear here.' : undefined} />
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.accentDeep} onRefresh={async () => { setRefreshing(true); await load(tab); setRefreshing(false); }} />}
                />
            </View>
        </View>
    );
}
