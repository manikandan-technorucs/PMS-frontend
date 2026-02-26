import { api } from '../lib/api';
import { MasterResponse } from './masters';

export interface User {
    id: number;
    public_id: string;
    email: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    is_active: boolean;
    phone: string | null;
    job_title: string | null;
    join_date: string | null;
    department_id: number | null;
    location_id: number | null;
    role_id: number | null;
    created_at: string;
    updated_at: string;
    role?: MasterResponse;
    department?: MasterResponse;
    location?: MasterResponse;
    skills?: MasterResponse[];
}

export const usersService = {
    getUsers: async (skip: number = 0, limit: number = 100): Promise<User[]> => {
        const response = await api.get('/users/', { params: { skip, limit } });
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
};
