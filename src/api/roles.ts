import { api } from './axiosInstance';

export interface Role {
    id: number;
    name: string;
    description: string | null;
    permissions: any; // Using any for JSON type temporarily
    users?: any[];
}

export const rolesService = {
    getRoles: async (): Promise<Role[]> => {
        const response = await api.get('/masters/roles');
        return response.data;
    },

    getRole: async (roleId: number): Promise<Role> => {
        const response = await api.get(`/masters/roles/${roleId}`);
        return response.data;
    },

    createRole: async (roleData: any): Promise<Role> => {
        const response = await api.post('/masters/roles', roleData);
        return response.data;
    },

    updateRole: async (roleId: number, roleData: any): Promise<Role> => {
        const response = await api.put(`/masters/roles/${roleId}`, roleData);
        return response.data;
    },

    deleteRole: async (roleId: number): Promise<void> => {
        await api.delete(`/masters/roles/${roleId}`);
    },
};
