import { create } from 'zustand';

export const EMPTY_FILTERS = {
    minPrice: '',
    maxPrice: '',
    transmission: '',
    fuelType: '',
    seats: '',
    brand: '',
    sort: 'newest',
};

/** Search and filters shared by Explore and its filter sheets. */
export const useSearchStore = create((set) => ({
    city: '',
    start: null,
    end: null,
    filters: { ...EMPTY_FILTERS },
    setWhereWhen: ({ city, start, end }) => set({ city: city ?? '', start: start ?? null, end: end ?? null }),
    setFilters: (filters) => set({ filters: { ...EMPTY_FILTERS, ...filters } }),
    patchFilters: (patch) => set(state => ({ filters: { ...state.filters, ...patch } })),
    resetAll: () => set({ city: '', start: null, end: null, filters: { ...EMPTY_FILTERS } }),
}));

/** Number of active filters (for the badge on the filter button). */
export const countActiveFilters = (f) =>
    ['minPrice', 'maxPrice', 'transmission', 'fuelType', 'seats', 'brand'].filter(k => f[k] !== '' && f[k] !== null).length
    + (f.sort && f.sort !== 'newest' ? 1 : 0);
