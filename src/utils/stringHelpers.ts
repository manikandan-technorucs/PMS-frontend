/**
 * Formats a SNAKE_CASE string into Title Case.
 * Example: 'PROJECT_CREATED' -> 'Project Created'
 */
export const formatSnakeCase = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
