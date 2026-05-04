export const formatLocalDate = (dateVal: Date | string | null | undefined): string | null => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const calculateDaysLeft = (endDateVal: Date | string | null | undefined): number | null => {
    if (!endDateVal) return null;
    const endDate = new Date(endDateVal);
    if (isNaN(endDate.getTime())) return null;

    const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    const today = new Date();
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = normalizedEndDate.getTime() - normalizedToday.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDaysLeftText = (daysLeft: number | null): string => {
    if (daysLeft === null) return 'No due date';
    if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
};
