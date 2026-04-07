import React from 'react';

interface MetaItem {
    icon: React.ReactNode;
    label: string;
    pill?: boolean;
}

interface StatItem {
    label: string;
    display: React.ReactNode;
}

interface DetailHeroProps {
    icon: React.ReactNode;
    title: string;
    id?: string;
    meta?: MetaItem[];
    stat?: StatItem;
}

export function DetailHero({ icon, title, id, meta = [], stat }: DetailHeroProps) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl shadow-lg px-7 py-6"
            style={{
                background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)',
                boxShadow: '0 12px 40px -8px rgba(12, 209, 195, 0.40)',
            }}
        >
            {/* Ambient light overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.18) 0%, transparent 60%)',
                }}
            />
            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
            />

            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-5">
                {/* Left — icon + title + meta */}
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black/5 border border-black/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-md">
                        {icon}
                    </div>
                    <div className="min-w-0">
                        {id && (
                            <p className="text-[11px] font-bold text-slate-700/80 uppercase tracking-[0.12em] mb-1">
                                {id}
                            </p>
                        )}
                        <h1 className="text-[22px] md:text-[26px] font-black text-slate-900 leading-tight tracking-tight truncate">
                            {title}
                        </h1>
                        {meta.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                {meta.map((m, i) => (
                                    <span
                                        key={i}
                                        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-800 ${
                                            m.pill
                                                ? 'bg-black/5 backdrop-blur-sm border border-black/10 px-2.5 py-0.5 rounded-full'
                                                : ''
                                        }`}
                                    >
                                        <span className="opacity-70 flex-shrink-0">{m.icon}</span>
                                        {m.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — stat */}
                {stat && (
                    <div className="flex-shrink-0 flex flex-col items-end justify-center">
                        <p className="text-[10px] font-black text-slate-700/80 uppercase tracking-[0.12em] mb-1">
                            {stat.label}
                        </p>
                        {stat.display}
                    </div>
                )}
            </div>
        </div>
    );
}
