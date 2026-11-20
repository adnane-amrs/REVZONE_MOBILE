import { create } from 'zustand';

/** The dialog currently shown by components/ui/DialogHost (one at a time). */
export const useDialogStore = create((set) => ({
    current: null,
    show: (current) => set({ current }),
    hide: () => set({ current: null }),
}));

/**
 * Themed replacement for React Native's Alert.alert, same arguments:
 *   dialog.alert('Log out', 'Are you sure?', [
 *       { text: 'Cancel', style: 'cancel' },
 *       { text: 'Log out', style: 'destructive', onPress: logout },
 *   ]);
 * Buttons default to a single "OK". `options.icon` overrides the icon (Ionicons name).
 */
export const dialog = {
    alert: (title, message, buttons, options = {}) => {
        useDialogStore.getState().show({
            title,
            message,
            buttons: buttons?.length ? buttons : [{ text: 'OK' }],
            icon: options.icon,
            key: Date.now(),
        });
    },
};
