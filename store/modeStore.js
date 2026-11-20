import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'appMode';

// The two sides of the app and the tabs each one shows
export const MODES = {
    renter: { home: '/explore', tabs: ['explore', 'trips', 'inbox', 'profile'], label: 'Renter' },
    owner: { home: '/host', tabs: ['host', 'cars', 'requests', 'inbox', 'profile'], label: 'Owner' },
};

/** Which side of the app the user is on: renting cars or hosting their own. Remembered between launches. */
export const useModeStore = create((set) => ({
    mode: 'renter',
    switching: null, // mode being switched to, while the transition plays
    load: async () => {
        try {
            const saved = await AsyncStorage.getItem(KEY);
            if (saved === 'owner' || saved === 'renter') set({ mode: saved });
        } catch {
            // default to renter
        }
    },
    setMode: async (mode) => {
        set({ mode, switching: mode });
        await AsyncStorage.setItem(KEY, mode).catch(() => {});
        setTimeout(() => set({ switching: null }), 900);
    },
}));
