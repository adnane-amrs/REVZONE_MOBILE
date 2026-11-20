import { create } from 'zustand';

let nextId = 1;

/** Small in-app messages ("Listing published", "Request sent"...). */
export const useToastStore = create((set) => ({
    toasts: [],
    show: (message, type = 'success') => {
        const id = nextId++;
        set(state => ({ toasts: [...state.toasts.slice(-2), { id, message, type }] }));
        setTimeout(() => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })), 2800);
    },
    dismiss: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

export const toast = {
    success: (message) => useToastStore.getState().show(message, 'success'),
    error: (message) => useToastStore.getState().show(message, 'error'),
    info: (message) => useToastStore.getState().show(message, 'info'),
};
