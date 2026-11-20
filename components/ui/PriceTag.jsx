import { View } from 'react-native';
import Text from './AppText';
import { theme } from '../../constants/theme';
import { formatMoney } from '../../constants/app';

const SIZES = {
    sm: { font: 13, unit: 10, px: 10, py: 4 },
    md: { font: 15, unit: 11, px: 12, py: 6 },
    lg: { font: 20, unit: 12, px: 14, py: 7 },
};

/** Price in a lime pill with black text (reads well on both light and dark backgrounds). */
export default function PriceTag({ amount, unit, size = 'md', style }) {
    const s = SIZES[size] || SIZES.md;
    return (
        <View style={[{
            flexDirection: 'row', alignItems: 'baseline', gap: 3, alignSelf: 'flex-start',
            backgroundColor: theme.accent, borderRadius: 999, paddingHorizontal: s.px, paddingVertical: s.py,
        }, style]}>
            <Text weight="extrabold" style={{ color: theme.onAccent, fontSize: s.font }}>{formatMoney(amount)}</Text>
            {unit ? <Text weight="semibold" style={{ color: theme.onAccentMuted, fontSize: s.unit }}>{unit}</Text> : null}
        </View>
    );
}
