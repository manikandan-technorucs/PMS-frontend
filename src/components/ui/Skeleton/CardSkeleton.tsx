import React from 'react';

interface CardSkeletonProps {
    count?: number;
}

export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white border rounded-[8px] p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-[#E5E7EB] rounded-full w-3/4" />
                            <div className="h-3 bg-[#F3F4F6] rounded-full w-1/2" />
                        </div>
                        <div className="h-6 w-16 bg-[#F3F4F6] rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-[#F3F4F6] rounded-full w-full" />
                        <div className="h-3 bg-[#F3F4F6] rounded-full w-2/3" />
                    </div>
                    <div className="h-1.5 bg-[#F3F4F6] rounded-full w-full" />
                    <div className="flex justify-between pt-3 border-t border-[#F3F4F6]">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="w-7 h-7 rounded-full bg-[#F3F4F6] border-2 border-white" />
                            ))}
                        </div>
                        <div className="h-4 w-14 bg-[#F3F4F6] rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
