import { motion } from 'framer-motion';
import {
    Wrench, Euro, Clock, Leaf, BadgeCheck, Trophy, Award, Medal, Bot, ArrowDown,
    ShieldCheck, Thermometer, DoorOpen, Wind, Sun, Droplets, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Recommandation } from '@/lib/api';

const RANK_STYLES = [
    { Icon: Trophy, gradient: "from-amber-400/20 to-yellow-400/10", border: "border-amber-300 dark:border-amber-700", badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300", iconColor: "text-amber-500" },
    { Icon: Award, gradient: "from-slate-300/20 to-slate-200/10", border: "border-slate-300 dark:border-slate-600", badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", iconColor: "text-slate-400" },
    { Icon: Medal, gradient: "from-orange-300/20 to-amber-200/10", border: "border-orange-300 dark:border-orange-700", badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300", iconColor: "text-orange-600" },
];

const DEFAULT_STYLE = {
    Icon: Wrench, gradient: "from-muted to-muted/50", border: "border-border", badge: "bg-muted text-muted-foreground", iconColor: "text-muted-foreground",
};

// ── Helpers : Catégorisation ──
const CATEGORIES = [
  { keywords: ['isolation', 'combles', 'mur', 'plancher', 'toit'], label: 'Isolation', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { keywords: ['chauffage', 'pompe', 'chaudiere', 'pac', 'radiateur'], label: 'Chauffage', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { keywords: ['fenetre', 'porte', 'menuiserie', 'vitrage', 'baie'], label: 'Menuiserie', icon: DoorOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { keywords: ['vmc', 'ventilation', 'flux'], label: 'Ventilation', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { keywords: ['solaire', 'photovoltaique', 'pv'], label: 'Solaire', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { keywords: ['ecs', 'eau', 'ballon'], label: 'Eau Chaude', icon: Droplets, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
];

function getCategory(name: string) {
  const n = name.toLowerCase();
  return CATEGORIES.find(c => c.keywords.some(k => n.includes(k))) || { label: 'Rénovation', icon: Wrench, color: 'text-muted-foreground', bg: 'bg-muted' };
}

function roiLabel(roi: number) {
    if (roi <= 4) return { text: "Excellent", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" };
    if (roi <= 8) return { text: "Bon", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" };
    if (roi <= 12) return { text: "Moyen", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" };
    return { text: "Long", color: "text-muted-foreground", bg: "bg-muted" };
}

interface Props {
    rec: Recommandation;
    rank: number;
    onAskChat?: (msg: string) => void;
}

export default function RecommandationCard({ rec, rank, onAskChat }: Props) {
    const style = RANK_STYLES[rank] || DEFAULT_STYLE;
    const cat = getCategory(rec.nom);
    const CatIcon = cat.icon;
    const RankIcon = style.Icon;
    const roi = roiLabel(rec.roi_annees);

    // Progress stats
    const roiProgress = Math.min(rec.roi_annees / 15, 1) * 100;
    const reductionPercent = Math.min((rec.reduction_conso_kwh_m2 / Math.max(rec.nouvelle_conso_kwh_m2 + rec.reduction_conso_kwh_m2, 1)) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: rank * 0.08, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`group relative rounded-3xl border ${style.border} bg-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5`}
        >
            {/* Background Gradient Blurs */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.gradient} opacity-40 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
            
            {/* Top Rank Badge */}
            {rank < 3 && (
              <div className={cn("absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm font-bold text-xs backdrop-blur-md border border-white/20", style.badge)}>
                <RankIcon size={14} className={style.iconColor} />
              </div>
            )}

            <div className="p-6 space-y-5 relative z-10">
                {/* Category & Badge */}
                <div className="flex items-center gap-2">
                  <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", cat.bg, cat.color)}>
                    <CatIcon size={12} />
                    {cat.label}
                  </div>
                  <div className="flex-1 h-px bg-border group-hover:bg-primary/20 transition-colors" />
                </div>

                {/* Title */}
                <div>
                   <h4 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">{rec.nom}</h4>
                </div>

                {/* Main KPIs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border group-hover:border-primary/10 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-background text-muted-foreground">
                               <Wrench size={12} />
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Investissement</span>
                        </div>
                        <p className="text-lg font-black text-foreground">{rec.cout_travaux_euros.toLocaleString("fr-FR")} €</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-background text-emerald-500">
                               <Euro size={12} />
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">Gain Annuel</span>
                        </div>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{rec.economie_annuelle_euros.toLocaleString("fr-FR")} €</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="space-y-4 pt-1">
                    {/* ROI Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Clock size={14} className="text-primary/70" />
                                <span>Remboursement</span>
                            </div>
                            <span className={cn("text-xs font-black px-2 py-0.5 rounded-md", roi.bg, roi.color)}>
                                {rec.roi_annees} ans ({roi.text})
                            </span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - roiProgress}%` }}
                                transition={{ duration: 1, delay: rank * 0.1 + 0.3 }}
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Impact Bar */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-background to-muted/30 border border-border">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                            <ArrowDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                <span className="text-muted-foreground">Efficacité Énergétique</span>
                                <span className="text-primary">-{rec.reduction_conso_kwh_m2} kWh/m²</span>
                            </div>
                            <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${reductionPercent}%` }}
                                    transition={{ duration: 0.8, delay: rank * 0.1 + 0.5 }}
                                    className="h-full rounded-full bg-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Footer */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/50 border border-border text-[10px] font-bold">
                        <BadgeCheck size={12} className="text-emerald-500" />
                        <span>Classe {rec.nouvelle_classe_dpe}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/50 border border-border text-[10px] font-bold">
                        <Leaf size={12} className="text-emerald-500" />
                        <span>-{rec.reduction_co2_kg_m2} kg CO2</span>
                    </div>
                </div>

                {/* AI Button - Premium Style */}
                {onAskChat && (
                    <Button
                        variant="hero"
                        size="sm"
                        className="w-full h-10 rounded-xl text-[11px] font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20"
                        onClick={() => onAskChat(`Explique-moi les avantages de : ${rec.nom}`)}
                    >
                        <Bot size={14} className="mr-2" />
                        Conseils IA Personnalisés
                    </Button>
                )}
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}
