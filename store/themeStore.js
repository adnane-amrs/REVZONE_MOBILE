import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyPalette } from '../constants/theme';

const KEY = 'colorScheme';
export const THEME_OPTIONS = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
];

const resolve = (preference) => {
    if (preference === 'light' || preference === 'dark') return preference;
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
};

/**
 * Light or dark version of the app. `preference` is what the user picked (system / light / dark),
 * `scheme` is the version actually shown. Changing `scheme` re-mounts the screens (see app/_layout.jsx),
 * and `returnTo` brings the user back to the screen they were on.
 */
export const useThemeStore = create((set, get) => ({
    preference: 'system',
    scheme: 'light',
    returnTo: null,
    load: async () => {
        let preference = 'system';
        try {
            const saved = await AsyncStorage.getItem(KEY);
            if (saved === 'light' || saved === 'dark' || saved === 'system') preference = saved;
        } catch {
            // keep following the system
        }
        const scheme = resolve(preference);
        applyPalette(scheme);
        set({ preference, scheme });
    },
    setPreference: (preference, returnTo = null) => {
        AsyncStorage.setItem(KEY, preference).catch(() => {});
        const scheme = resolve(preference);
        applyPalette(scheme);
        set({ preference, scheme, returnTo: scheme !== get().scheme ? returnTo : null });
    },
    /** Called when the phone switches between light and dark. */
    syncWithSystem: () => {
        const { preference, scheme } = get();
        if (preference !== 'system') return;
        const next = resolve('system');
        if (next !== scheme) {
            applyPalette(next);
            set({ scheme: next });
        }
    },
    takeReturnTo: () => {
        const path = get().returnTo;
        if (path) set({ returnTo: null });
        return path;
    },
}));
