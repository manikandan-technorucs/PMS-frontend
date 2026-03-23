import React from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormFieldProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    control: Control<TFieldValues>;
    label?: string;
    required?: boolean;
    className?: string;
    render: (field: any) => React.ReactElement;
}

export function FormField<T extends FieldValues>({
    name,
    control,
    label,
    required,
    className = '',
    render
}: FormFieldProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState: { error } }) => (
                <div className={className}>
                    {label && (
                        <label className="block text-sm font-medium mb-2">
                            {label} {required && <span className="text-red-600">*</span>}
                        </label>
                    )}

                    {render(field)}

                    {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
                </div>
            )}
        />
    );
}
