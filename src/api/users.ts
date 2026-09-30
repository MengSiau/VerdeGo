import { apiFetch } from './client';

export interface User {
    user_id: string;
    name: string;
    created_at: string;
}

export function getCurrentUser(): Promise<User> {
    return apiFetch<User>('/api/users/me');
}

export function updateCurrentUser(name: string): Promise<User> {
    return apiFetch<User>('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name }),
    });
}