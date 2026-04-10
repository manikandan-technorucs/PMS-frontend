

export interface TemplateTask {
    id: number;
    title: string;
    description?: string | null;
    estimated_hours?: number | null;
    priority_id?: number | null;
    order_index: number;
}

export interface ProjectTemplate {
    id: number;
    name: string;
    description?: string | null;
    tasks: TemplateTask[];
}

export interface ProjectTemplateCreate {
    name: string;
    description?: string;
    tasks: Omit<TemplateTask, 'id'>[];
}
