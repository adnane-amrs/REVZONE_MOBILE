import { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Text from '../ui/AppText';
import IconButton from '../ui/IconButton';
import { theme } from '../../constants/theme';
import { MONTHS_LONG, WEEKDAYS, monthGrid, todayKey, addDays, eachDayKey, daysBetween } from '../../lib/dates';

/**
 * Month calendar with two modes:
 *  - mode="range":    pick a start and an end day ({ start, end })
 *  - mode="multiple": toggle individual days (array of keys), used by owners to block dates
 * Disabled days (past, booked, blocked) cannot be picked, and a range cannot jump over them.
 */
export default function DateRangeCalendar({
    mode = 'range', value, onChange, disabledKeys, maxDays = 30, minKey = todayKey(), monthsAhead = 12,
}) {
    const disabled = useMemo(() => disabledKeys || new Set(), [disabledKeys]);
    const initial = (mode === 'range' ? value?.start : value?.[0]) || minKey;
    const [cursor, setCursor] = useState(() => {
        const [y, m] = initial.split('-').map(Number);
        return { year: y, month: m - 1, dir: 0 };
    });
    const [width, setWidth] = useState(0);

    const [minY, minM] = minKey.split('-').map(Number);
    const monthIndex = cursor.year * 12 + cursor.month;
    const minIndex = minY * 12 + (minM - 1);
    const canPrev = monthIndex > minIndex;
    const canNext = monthIndex < minIndex + monthsAhead - 1;

    const move = (delta) => {
        const idx = monthIndex + delta;
        setCursor({ year: Math.floor(idx / 12), month: idx % 12, dir: delta });
    };

    const weeks = monthGrid(cursor.year, cursor.month);
    const cell = width ? Math.floor(width / 7) : 0;
    const today = todayKey();
    const maxKey = addDays(minKey, monthsAhead * 31);
    const selectedSet = mode === 'multiple' ? new Set(value || []) : null;

    const isDisabled = (key) => key < minKey || key > maxKey || disabled.has(key);

    const onDayPress = (key) => {
        Haptics.selectionAsync().catch(() => {});
        if (mode === 'multiple') {
            const next = new Set(selectedSet);
            if (next.has(key)) next.delete(key); else next.add(key);
            onChange([...next].sort());
            return;
        }
        const { start, end } = value || {};
        if (!start || end || key < start) {
            onChange({ start: key, end: null });
            return;
        }
        // Second tap: the range must not include unavailable days or exceed the maximum length
        const crossesDisabled = eachDayKey(start, key).some(k => disabled.has(k));
        if (crossesDisabled) {
            onChange({ start: key, end: null });
            return;
        }
        if (daysBetween(start, key) > maxDays) {
            onChange({ start, end: addDays(start, maxDays - 1) });
            return;
        }
        onChange({ start, end: key });
    };

    const entering = cursor.dir > 0 ? FadeInRight.duration(260) : cursor.dir < 0 ? FadeInLeft.duration(260) : FadeIn;

    return (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <IconButton icon="chevron-back" variant="dark" size={40} onPress={() => canPrev && move(-1)} style={{ opacity: canPrev ? 1 : 0.3 }} accessibilityLabel="Previous month" />
                <Text weight="bold" style={{ color: theme.text, fontSize: 17 }}>{MONTHS_LONG[cursor.month]} {cursor.year}</Text>
                <IconButton icon="chevron-forward" variant="dark" size={40} onPress={() => canNext && move(1)} style={{ opacity: canNext ? 1 : 0.3 }} accessibilityLabel="Next month" />
            </View>

            <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                    {WEEKDAYS.map(d => (
                        <View key={d} style={{ width: cell, alignItems: 'center' }}>
                            <Text weight="semibold" style={{ color: theme.muted, fontSize: 12 }}>{d}</Text>
                        </View>
                    ))}
                </View>

                {cell > 0 ? (
                    <Animated.View key={`${cursor.year}-${cursor.month}`} entering={entering}>
                        {weeks.map((week, wi) => (
                            <View key={wi} style={{ flexDirection: 'row' }}>
                                {week.map((key, di) => {
                                    if (!key) return <View key={di} style={{ width: cell, height: cell }} />;
                                    const off = isDisabled(key);
                                    const booked = disabled.has(key);
                                    let isStart = false, isEnd = false, inRange = false, picked = false;
                                    if (mode === 'range') {
                                        const { start, end } = value || {};
                                        isStart = key === start;
                                        isEnd = key === end;
                                        inRange = !!(start && end && key > start && key < end);
                                        picked = isStart || isEnd;
                                    } else {
                                        picked = selectedSet.has(key);
                                    }
                                    const bandLeft = mode === 'range' && (inRange || (isEnd && value?.start));
                                    const bandRight = mode === 'range' && (inRange || (isStart && value?.end));
                                    const textColor = picked ? theme.onAccent : off ? theme.faint : theme.text;

                                    return (
                                        <Pressable
                                            key={key}
                                            disabled={off}
                                            onPress={() => onDayPress(key)}
                                            accessibilityLabel={key}
                                            style={{ width: cell, height: cell, alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            {bandLeft ? <View style={{ position: 'absolute', left: 0, width: cell / 2, top: 5, bottom: 5, backgroundColor: theme.accentSoft }} /> : null}
                                            {bandRight ? <View style={{ position: 'absolute', right: 0, width: cell / 2, top: 5, bottom: 5, backgroundColor: theme.accentSoft }} /> : null}
                                            <View style={{
                                                width: cell - 8, height: cell - 8, borderRadius: cell,
                                                alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: picked ? theme.accent : 'transparent',
                                                borderWidth: key === today && !picked ? 1 : 0, borderColor: theme.surface3,
                                            }}>
                                                <Text weight={picked ? 'extrabold' : 'semibold'} style={{
                                                    color: mode === 'multiple' && picked ? theme.onAccent : textColor, fontSize: 14,
                                                    textDecorationLine: booked ? 'line-through' : 'none',
                                                }}>
                                                    {Number(key.slice(8))}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ))}
                    </Animated.View>
                ) : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 16, marginTop: 10, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent }} />
                    <Text style={{ color: theme.muted, fontSize: 12 }}>{mode === 'multiple' ? 'Blocked' : 'Selected'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="remove" size={14} color={theme.faint} />
                    <Text style={{ color: theme.muted, fontSize: 12 }}>{mode === 'multiple' ? 'Booked by a renter' : 'Unavailable'}</Text>
                </View>
            </View>
        </View>
    );
}
