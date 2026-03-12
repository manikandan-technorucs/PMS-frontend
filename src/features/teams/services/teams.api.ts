import { api } from '@/shared/lib/api';

export interface Team {
    id: number;
    public_id: string;
    name: string;
    team_email: string;
    budget_allocation: number;
    description: string | null;
    team_type: string | null;
    max_team_size: number | null;
    primary_communication_channel: string | null;
    channel_id: string | null;
    lead_id: number | null;
    lead?: { first_name: string; last_name: string; };
    dept_id: number | null;
    department?: { id: number; name: string; };
    location_id: number | null;
    created_at: string;
    updated_at: string;
    members?: any[];
    members_count: number;
}

export const teamsService = {
    getTeams: async (skip: number = 0, limit: number = 100): Promise<Team[]> => {
        const response = await api.get('/teams/', { params: { skip, limit } });
        return response.data;
    },

    getTeam: async (teamId: number): Promise<Team> => {
        const response = await api.get(`/teams/${teamId}`);
        return response.data;
    },

    createTeam: async (teamData: any): Promise<Team> => {
        const response = await api.post('/teams/', teamData);
        return response.data;
    },

    updateTeam: async (teamId: number, teamData: any): Promise<Team> => {
        const response = await api.put(`/teams/${teamId}`, teamData);
        return response.data;
    },

    deleteTeam: async (teamId: number): Promise<void> => {
        await api.delete(`/teams/${teamId}`);
    },
};
