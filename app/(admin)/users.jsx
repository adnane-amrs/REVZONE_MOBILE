import { useEffect, useState } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Text from '../../components/ui/AppText';
import Header from '../../components/ui/Header';
import TextField from '../../components/ui/TextField';
import Chip from '../../components/ui/Chip';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import PressableScale from '../../components/ui/PressableScale';
import EmptyState from '../../components/ui/EmptyState';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { useAdminStore } from '../../store/adminStore';
import { toast } from '../../store/toastStore';
import { theme } from '../../constants/theme';
import { dialog } from '../../store/dialogStore';

const STATUS_COLORS = { active: theme.success, suspended: theme.warning, banned: theme.danger };

const SmallAction = ({ icon, color, onPress, label }) => (
    <PressableScale onPress={onPress} haptic accessibilityLabel={label}
        style={{ flex: 1, height: 42, borderRadius: 21, backgroundColor: `${color}22`, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color={color} />
    </PressableScale>
);

export default function UserManagement() {
    const insets = useSafeAreaInsets();
    const { users, pagination, getUsers, updateUserStatus, updateUserRole, isLoading } = useAdminStore();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { getUsers(page, 10, search, status).then(() => setLoaded(true)); }, 300);
        return () => clearTimeout(t);
    }, [page, search, status, getUsers]);

    const changeStatus = (u, next) => {
        const labels = { active: 'Activate', suspended: 'Suspend', banned: 'Ban' };
        dialog.alert(`${labels[next]} user`, `${labels[next]} ${u.username}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: labels[next], style: next === 'active' ? 'default' : 'destructive', onPress: async () => {
                    const res = await updateUserStatus(u._id, next, null, next === 'suspended' ? 'Suspended by an administrator' : '');
                    if (res.success) toast.success(`${u.username} is now ${next}`); else dialog.alert('Error', res.error);
                },
            },
        ]);
    };

    const toggleModerator = (u) => {
        const next = u.role === 'moderator' ? 'user' : 'moderator';
        dialog.alert('Change role', `Make ${u.username} a ${next}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm', onPress: async () => {
                    const res = await updateUserRole(u._id, next);
                    if (res.success) toast.success(`${u.username} is now a ${next}`); else dialog.alert('Error', res.error);
                },
            },
        ]);
    };

    const renderItem = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 40).duration(350)} style={{ marginBottom: 12 }}>
            <View style={{ backgroundColor: theme.canvas, borderRadius: 26, padding: 14, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar uri={item.profileImage} name={item.fullName || item.username} size={46} verified={item.driverLicense?.status === 'approved'} />
                    <View style={{ flex: 1 }}>
                        <Text weight="bold" numberOfLines={1} style={{ color: theme.text, fontSize: 15 }}>{item.fullName || item.username}</Text>
                        <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 12 }}>{item.email}</Text>
                        <Text style={{ color: theme.muted, fontSize: 11 }}>{item.postCount || 0} car{item.postCount === 1 ? '' : 's'} · joined {new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <View style={{ backgroundColor: `${STATUS_COLORS[item.status || 'active']}22`, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
                            <Text weight="bold" style={{ color: STATUS_COLORS[item.status || 'active'], fontSize: 11 }}>{item.status || 'active'}</Text>
                        </View>
                        <Text weight="semibold" style={{ color: item.role === 'user' ? theme.muted : theme.accentDeep, fontSize: 11 }}>{item.role}</Text>
                    </View>
                </View>
                {item.role !== 'admin' ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <SmallAction icon="checkmark-circle-outline" color={theme.success} label="Activate" onPress={() => changeStatus(item, 'active')} />
                        <SmallAction icon="pause-circle-outline" color={theme.warning} label="Suspend" onPress={() => changeStatus(item, 'suspended')} />
                        <SmallAction icon="close-circle-outline" color={theme.danger} label="Ban" onPress={() => changeStatus(item, 'banned')} />
                        <SmallAction icon="shield-half-outline" color={theme.info} label="Toggle moderator" onPress={() => toggleModerator(item)} />
                    </View>
                ) : null}
            </View>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker="Admin" title="Users" icon="people" />
            <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6 }}>
                <View style={{ padding: 20, paddingBottom: 8, gap: 12 }}>
                    <TextField icon="search" placeholder="Search name or email" value={search} onChangeText={(v) => { setSearch(v); setPage(1); }} autoCapitalize="none" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {[['', 'All'], ['active', 'Active'], ['suspended', 'Suspended'], ['banned', 'Banned']].map(([v, l]) => (
                            <Chip key={l} label={l} selected={status === v} onPress={() => { setStatus(v); setPage(1); }} />
                        ))}
                    </ScrollView>
                </View>
                <FlatList
                    data={users}
                    keyExtractor={(u) => u._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: insets.bottom + 30 }}
                    ListEmptyComponent={!loaded || isLoading ? <View>{[0, 1, 2].map(i => <RowSkeleton key={i} />)}</View> : <EmptyState icon="people-outline" title="No users found" />}
                    ListFooterComponent={pagination.totalPages > 1 ? (
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 6 }}>
                            <View style={{ flex: 1 }}><Button title="Previous" size="sm" variant="dark" disabled={page <= 1} onPress={() => setPage(p => p - 1)} /></View>
                            <Text style={{ color: theme.muted }}>{page}/{pagination.totalPages}</Text>
                            <View style={{ flex: 1 }}><Button title="Next" size="sm" variant="dark" disabled={page >= pagination.totalPages} onPress={() => setPage(p => p + 1)} /></View>
                        </View>
                    ) : null}
                />
            </View>
        </View>
    );
}
