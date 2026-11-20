import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import TextField from '../ui/TextField';
import Text from '../ui/AppText';
import { theme } from '../../constants/theme';
import { TRANSMISSIONS, FUEL_TYPES, SORTS, CURRENCY } from '../../constants/app';
import { EMPTY_FILTERS } from '../../store/searchStore';

const Section = ({ title, children }) => (
    <View style={{ gap: 12 }}>
        <Text weight="bold" style={{ color: theme.text, fontSize: 15 }}>{title}</Text>
        {children}
    </View>
);

const Row = ({ children }) => <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>;

/** Price, transmission, fuel, seats, brand and sort filters. */
export default function FilterSheet({ visible, onClose, initial, facets, onApply }) {
    const [f, setF] = useState(initial);

    useEffect(() => {
        if (visible) setF(initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const toggle = (key, value) => setF(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
    const numeric = (v) => v.replace(/[^0-9]/g, '').slice(0, 6);

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title="Filters"
            footer={(
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Button title="Reset" variant="outline" onPress={() => setF({ ...EMPTY_FILTERS })} />
                    </View>
                    <View style={{ flex: 2 }}>
                        <Button title="Show cars" icon="checkmark" onPress={() => onApply(f)} />
                    </View>
                </View>
            )}
        >
            <ScrollView contentContainerStyle={{ padding: 20, gap: 26 }} keyboardShouldPersistTaps="handled">
                <Section title="Sort by">
                    <Row>{SORTS.map(s => <Chip key={s.value} label={s.label} selected={f.sort === s.value} onPress={() => setF(p => ({ ...p, sort: s.value }))} />)}</Row>
                </Section>

                <Section title={`Price per day (${CURRENCY})`}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TextField style={{ flex: 1 }} placeholder={facets?.minPrice ? `Min ${facets.minPrice}` : 'Min'} keyboardType="number-pad"
                            value={String(f.minPrice)} onChangeText={(v) => setF(p => ({ ...p, minPrice: numeric(v) }))} />
                        <TextField style={{ flex: 1 }} placeholder={facets?.maxPrice ? `Max ${facets.maxPrice}` : 'Max'} keyboardType="number-pad"
                            value={String(f.maxPrice)} onChangeText={(v) => setF(p => ({ ...p, maxPrice: numeric(v) }))} />
                    </View>
                </Section>

                <Section title="Transmission">
                    <Row>{TRANSMISSIONS.map(t => <Chip key={t.value} label={t.label} icon={t.icon} selected={f.transmission === t.value} onPress={() => toggle('transmission', t.value)} />)}</Row>
                </Section>

                <Section title="Fuel type">
                    <Row>{FUEL_TYPES.map(t => <Chip key={t.value} label={t.label} icon={t.icon} selected={f.fuelType === t.value} onPress={() => toggle('fuelType', t.value)} />)}</Row>
                </Section>

                <Section title="Seats (at least)">
                    <Row>{['2', '4', '5', '7'].map(s => <Chip key={s} label={`${s}+`} icon="people-outline" selected={String(f.seats) === s} onPress={() => toggle('seats', s)} />)}</Row>
                </Section>

                {facets?.brands?.length ? (
                    <Section title="Brand">
                        <Row>{facets.brands.map(b => <Chip key={b} label={b} selected={f.brand === b} onPress={() => toggle('brand', b)} />)}</Row>
                    </Section>
                ) : null}
            </ScrollView>
        </BottomSheet>
    );
}
