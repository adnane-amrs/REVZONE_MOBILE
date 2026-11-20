import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import TextField from '../ui/TextField';
import Text from '../ui/AppText';
import DateRangeCalendar from '../booking/DateRangeCalendar';
import { theme } from '../../constants/theme';
import { CITIES } from '../../constants/app';
import { rangeLabel, daysBetween } from '../../lib/dates';

/** "Where & when" sheet: city + optional date range. */
export default function SearchSheet({ visible, onClose, initial, cities = [], onApply }) {
    const [city, setCity] = useState(initial.city || '');
    const [range, setRange] = useState({ start: initial.start, end: initial.end });

    useEffect(() => {
        if (visible) {
            setCity(initial.city || '');
            setRange({ start: initial.start, end: initial.end });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const suggestions = [...new Set([...cities, ...CITIES])].slice(0, 10);
    const complete = range.start && range.end;

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title="Where & when"
            footer={(
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Button title="Clear" variant="outline" onPress={() => { setCity(''); setRange({ start: null, end: null }); }} />
                    </View>
                    <View style={{ flex: 2 }}>
                        <Button
                            title={complete ? `Search · ${daysBetween(range.start, range.end)} days` : 'Search'}
                            icon="search"
                            onPress={() => onApply({ city: city.trim(), start: complete ? range.start : null, end: complete ? range.end : null })}
                        />
                    </View>
                </View>
            )}
        >
            <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
                <TextField icon="location-outline" placeholder="Any city" value={city} onChangeText={setCity} autoCapitalize="words" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {suggestions.map(c => (
                        <Chip key={c} label={c} selected={city.toLowerCase() === c.toLowerCase()} onPress={() => setCity(city === c ? '' : c)} />
                    ))}
                </ScrollView>

                <View style={{ backgroundColor: theme.surface, borderRadius: 28, padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text weight="bold" style={{ color: theme.text, fontSize: 15 }}>Trip dates</Text>
                        <Text weight="semibold" style={{ color: range.start ? theme.accentDeep : theme.muted, fontSize: 14 }}>
                            {range.start ? rangeLabel(range.start, range.end) : 'Any dates'}
                        </Text>
                    </View>
                    <DateRangeCalendar value={range} onChange={setRange} />
                </View>
            </ScrollView>
        </BottomSheet>
    );
}
