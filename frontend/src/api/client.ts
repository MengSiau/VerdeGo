import { supabase } from '@/src/auth/supabase';
import Constants from 'expo-constants';

function getDefaultApiUrl() {
    const hostUri = Constants.expoConfig?.hostUri;

    if (!hostUri) {
        throw new Error('Unable to determine Expo development host');
    }

    const host = hostUri.split(':')[0];

    return `http://${host}:5001`;
}

const API_URL =
    process.env.EXPO_PUBLIC_API_URL?.trim() || getDefaultApiUrl();

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const headers = new Headers(options.headers);

    headers.set('Content-Type', 'application/json');

    if (session?.access_token) {
        headers.set(
            'Authorization',
            `Bearer ${session.access_token}`
        );
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        const body = await response.text();

        try {
            const error = JSON.parse(body);
            message = error.error ?? message;
        } catch {
            // Response wasn't JSON
        }

        throw new Error(message);
    }

    // Some requests may return 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}
