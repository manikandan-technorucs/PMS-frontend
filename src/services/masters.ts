import { api } from '../lib/api';

export interface MasterResponse {
    id: number;
    name: string;
}

export const mastersService = {
    getRoles: async (): Promise<MasterResponse[]> => {
        const response = await api.get('/masters/roles');
        return response.data;
    },
    getSkills: async (): Promise<MasterResponse[]> => {
        const response = await api.get('/masters/skills');
        return response.data;
    },
    getDepartments: async (): Promise<MasterResponse[]> => {
        const response = await api.get('/masters/departments');
        return response.data;
    },
    getLocations: async (): Promise<MasterResponse[]> => {
        const response = await api.get('/masters/locations');
        return response.data;
    },
    getStatuses: async (): Promise<MasterResponse[]> => {
        const response = await api.get('/masters/statuses');
        return response.data;
    },
};
