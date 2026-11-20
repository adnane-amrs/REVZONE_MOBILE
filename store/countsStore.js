import { create } from 'zustand';
import { api } from '../lib/api';

/** Badge counts shown on the tab bar and the bell icon. Refreshed every few seconds while the app is open. */
export const useCountsStore = create((set) => ({
    notifications: 0,
    messages: 0,
    requests: 0,
    refresh: async () => {
        try {
            const counts = await api('/notifications/counts');
            set(counts);
        } catch {
            // Badges are not critical: ignore network errors
        }
    },
    reset: () => set({ notifications: 0, messages: 0, requests: 0 }),
}));
