import type { DiagnosticResult } from '@/lib/api';

const DPE_CLASSES = [
    { letter: "A", range: "≤ 70", color: "bg-[#319834]" },
    { letter: "B", range: "71-110", color: "bg-[#33a357]" },
    { letter: "C", range: "111-180", color: "bg-[#cbdb2a]" },
    { letter: "D", range: "181-250", color: "bg-[#f0e50a]" },
    { letter: "E", range: "251-330", color: "bg-[#f0b40a]" },
    { letter: "F", range: "331-420", color: "bg-[#ef6e19]" },
    { letter: "G", range: "> 420", color: "bg-[#e52528]" },
];

const GES_CLASSES = [
    { letter: "A", range: "≤ 6", color: "bg-[#f2e6ff]" },
    { letter: "B", range: "7-11", color: "bg-[#dfc0f7]" },
    { letter: "C", range: "12-30", color: "bg-[#cd9cf0]" },
    { letter: "D", range: "31-50", color: "bg-[#b878e8]" },
    { letter: "E", range: "51-70", color: "bg-[#a352dd]" },
    { letter: "F", range: "71-100", color: "bg-[#8a2cc0]" },
    { letter: "G", range: "> 100", color: "bg-[#6b0f9e]" },
];

function GaugeRow({ classes, activeClass, label }: {
    classes: typeof DPE_CLASSES; activeClass: string; label: string;
}) {
    return (
        <div>
            <p className="text-sm font-semibold mb-2">{label}</p>
            <div className="flex gap-1.5 items-center">
                {classes.map((cls) => {
                    const isActive = cls.letter === activeClass.toUpperCase();
                    return (
                        <div
                            key={cls.letter}
                            className={`
                relative flex items-center justify-center rounded-lg transition-all
                ${cls.color}
                ${isActive
                                    ? "h-12 w-14 ring-2 ring-foreground/40 shadow-lg scale-110 z-10"
                                    : "h-10 w-10 opacity-60"
                                }
              `}
                        >
                            <span className={`font-bold ${isActive ? "text-lg text-white drop-shadow" : "text-sm text-white/90"}`}>
                                {cls.letter}
                            </span>
                            {isActive && (
                                <span className="absolute -bottom-5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                    {cls.range}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function DPEGauge({ diagnostic }: { diagnostic: DiagnosticResult }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-4">
            <GaugeRow classes={DPE_CLASSES} activeClass={diagnostic.classe_dpe} label="DPE (kWh/m²/an)" />
            <GaugeRow classes={GES_CLASSES} activeClass={diagnostic.classe_ges} label="GES (kg CO₂/m²/an)" />
        </div>
    );
}
