import { useState, useCallback, useMemo } from 'react';

export interface UseFormOptions<T> {
    initialValues: T;
    requiredFields?: (keyof T)[];
}

export function useForm<T extends Record<string, any>>({ initialValues, requiredFields = [] }: UseFormOptions<T>) {
    const [values, setValues] = useState<T>(initialValues);
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const handleInputChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
    ) => {
        const { name, value } = e.target as any;
        const type = e.target && 'type' in e.target ? (e.target as any).type : undefined;
        
        let parsedValue: any = value;
        if (type === 'checkbox') {
            parsedValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            parsedValue = value === '' ? '' : Number(value);
        }

        setValues((prev) => ({
            ...prev,
            [name]: parsedValue,
        }));
        
        if (!touched[name as keyof T]) {
            setTouched((prev) => ({ ...prev, [name]: true }));
        }
    }, [touched]);

    const setValue = useCallback((name: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        if (!touched[name]) {
            setTouched((prev) => ({ ...prev, [name]: true }));
        }
    }, [touched]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setTouched({});
    }, [initialValues]);

    const isFormValid = useMemo(() => {
        for (const field of requiredFields) {
            const val = values[field];
            if (val === null || val === undefined || val === '') {
                return false;
            }
            if (Array.isArray(val) && val.length === 0) {
                return false; // For multi-selects
            }
        }
        return true;
    }, [values, requiredFields]);

    return {
        form: values,      // Alias for compatibility
        values,
        setValues,
        setValue,
        handleChange: handleInputChange, // Alias for compatibility
        handleInputChange,
        resetForm,
        isFormValid,
        touched,
    };
}
