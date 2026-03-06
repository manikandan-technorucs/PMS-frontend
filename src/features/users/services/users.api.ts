import { api } from '@/shared/lib/api';
import { MasterResponse } from '@/shared/services/masters.api';

export interface User {
    id: number;
    public_id: string;
    email: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    job_title: string | null;
    join_date: string | null;
    department_id: number | null;
    location_id: number | null;
    role_id: number | null;
    status_id: number | null;
    role?: MasterResponse;
    department?: MasterResponse;
    location?: MasterResponse;
    manager?: { first_name: string; last_name: string; };
    status?: MasterResponse;
    skills?: MasterResponse[];
}

export const usersService = {
    getUsers: async (skip: number = 0, limit: number = 100): Promise<User[]> => {
        const response = await api.get('/users/', { params: { skip, limit } });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/users/me');
        return response.data;
    },

    getUser: async (userId: number): Promise<User> => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    createUser: async (userData: any): Promise<User> => {
        const response = await api.post('/users/', userData);
        return response.data;
    },

    updateUser: async (userId: number, userData: any): Promise<User> => {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await api.delete(`/users/${userId}`);
    },
};
