import { create } from 'zustand';
import { api, qs } from '../lib/api';

const run = async (set, fn) => {
    set({ isLoading: true, error: null });
    try {
        const data = await fn();
        set({ isLoading: false });
        return { success: true, data };
    } catch (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
    }
};

/** Admin data: users, listings, driver licenses and statistics. */
export const useAdminStore = create((set) => ({
    users: [],
    pagination: {},
    userStats: {},
    listings: [],
    listingPagination: {},
    listingStats: {},
    licenses: [],
    isLoading: false,
    error: null,

    // ----- Users -----
    getUsers: (page = 1, limit = 10, search = "", status = "", role = "") => run(set, async () => {
        const data = await api(`/admin/users${qs({ page, limit, search, status, role })}`);
        set({ users: data.users, pagination: data.pagination });
        return data;
    }),

    getUserStats: () => run(set, async () => {
        const data = await api('/admin/users/stats');
        set({ userStats: data });
        return data;
    }),

    updateUserStatus: (userId, status, suspendedUntil = null, suspensionReason = "") => run(set, async () => {
        const data = await api(`/admin/users/${userId}/status`, { method: 'PATCH', body: { status, suspendedUntil, suspensionReason } });
        set(state => ({ users: state.users.map(u => (u._id === userId ? { ...u, status } : u)) }));
        return data;
    }),

    updateUserRole: (userId, role) => run(set, async () => {
        const data = await api(`/admin/users/${userId}/role`, { method: 'PATCH', body: { role } });
        set(state => ({ users: state.users.map(u => (u._id === userId ? { ...u, role } : u)) }));
        return data;
    }),

    // ----- Listings -----
    getListings: (page = 1, limit = 10, search = "", status = "") => run(set, async () => {
        const data = await api(`/admin/listings${qs({ page, limit, search, status })}`);
        set({ listings: data.listings, listingPagination: data.pagination });
        return data;
    }),

    getListingStats: () => run(set, async () => {
        const data = await api('/admin/listings/stats');
        set({ listingStats: data });
        return data;
    }),

    setListingVisibility: (id, moderationStatus) => run(set, async () => {
        const data = await api(`/admin/listings/${id}/visibility`, { method: 'PATCH', body: { moderationStatus } });
        set(state => ({ listings: state.listings.map(l => (l._id === id ? { ...l, moderationStatus } : l)) }));
        return data;
    }),

    deleteListing: (id) => run(set, async () => {
        const data = await api(`/admin/listings/${id}`, { method: 'DELETE' });
        set(state => ({ listings: state.listings.filter(l => l._id !== id) }));
        return data;
    }),

    // ----- Driver licenses -----
    getLicenses: (status = 'pending') => run(set, async () => {
        const data = await api(`/admin/licenses${qs({ status })}`);
        set({ licenses: data });
        return data;
    }),

    reviewLicense: (userId, decision, reason = "") => run(set, async () => {
        const data = await api(`/admin/licenses/${userId}`, { method: 'PATCH', body: { decision, reason } });
        set(state => ({ licenses: state.licenses.filter(l => l._id !== userId) }));
        return data;
    }),
}));
