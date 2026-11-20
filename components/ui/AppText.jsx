import { Text as RNText } from 'react-native';
import { fonts } from '../../constants/theme';

/**
 * Text with the app font. Use `weight` instead of font-bold classes:
 *   <Text weight="bold" className="text-ink text-xl">Title</Text>
 */
export default function Text({ weight = 'regular', style, ...props }) {
    return <RNText {...props} style={[{ fontFamily: fonts[weight] || fonts.regular }, style]} />;
}
