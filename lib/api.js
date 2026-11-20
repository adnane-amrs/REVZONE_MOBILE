import { API_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

/**
 * Calls the RevZone API with the stored JWT.
 * - Throws ApiError with the server's message on failure
 * - Logs the user out when the token is rejected (401) or the account is blocked (403 on auth)
 */
export async function api(path, { method = 'GET', body, auth = true } = {}) {
    const token = useAuthStore.getState().token;
    const headers = { 'Content-Type': 'application/json' };
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError('Cannot reach the server. Check your connection.', 0, null);
    }

    let data = null;
    const text = await response.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }

    if (auth && response.status === 401) {
        await useAuthStore.getState().logout();
    }

    if (!response.ok) {
        throw new ApiError(data?.message || `Request failed (${response.status})`, response.status, data);
    }
    return data;
}

/** Builds a query string, skipping empty values. */
export const qs = (params) => {
    const parts = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return parts.length ? `?${parts.join('&')}` : '';
};
