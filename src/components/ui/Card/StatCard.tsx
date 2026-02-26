import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    accent?: boolean;
}

export function StatCard({ label, value, icon, accent = true }: StatCardProps) {
    return (
        <div
            className={`rounded-[6px] p-4 hover:shadow-md transition-shadow stat-card-base ${accent ? 'border-t-[3px] border-t-[#059669]' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[12px] mb-1 uppercase tracking-wider font-medium stat-card-label">{label}</p>
                    <p className="text-[24px] font-bold stat-card-value">{value}</p>
                </div>
                {icon && (
                    <div className="w-10 h-10 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
