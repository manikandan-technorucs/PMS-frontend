/**
 * Date and time helper functions using strict TypeScript
 */

/**
 * Calculates the number of days left until a given target date.
 * If the target date is today or in the past, it returns 0.
 *
 * @param endDate - The target date string (e.g., 'YYYY-MM-DD') or Date object.
 * @returns The number of days remaining.
 */
export function getDaysLeft(endDate: string | Date | null | undefined): number {
    if (!endDate) return 0;

    const end = new Date(endDate);
    const today = new Date();

    // Strip time portion for accurate day calculation
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
}

/**
 * Formats a given date to a readable string format (e.g., "Oct 12, 2024")
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return 'N/A';

    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}
