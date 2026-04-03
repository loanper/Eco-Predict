import { motion } from "framer-motion";
import { Wrench, Euro, Clock, TrendingDown, Leaf, BadgeCheck } from "lucide-react";

const RANK_STYLES = [
  "ring-1 ring-brand-emerald-300/70 bg-white/70",
  "ring-1 ring-brand-blue-200/70 bg-white/70",
  "ring-1 ring-amber-300/70 bg-white/70",
];

function roiBadgeClass(roi) {
  if (roi <= 4) return "bg-emerald-100 text-emerald-800";
  if (roi <= 8) return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export default function RecommandationCard({ rec, rank }) {
  const ringClass = RANK_STYLES[rank] || "bg-white";
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`relative overflow-hidden rounded-3xl border border-slate-200/60 p-5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition ${ringClass}
                  before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-brand-gradient`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{medals[rank] || "🔧"}</span>
          <h4 className="font-extrabold text-slate-900 text-sm leading-snug tracking-tight">{rec.nom}</h4>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
            DPE {rec.nouvelle_classe_dpe}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roiBadgeClass(rec.roi_annees)}`}>
            ROI {rec.roi_annees} ans
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Wrench size={14} className="text-gray-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Coût travaux</p>
            <p className="font-semibold text-slate-800">{rec.cout_travaux_euros.toLocaleString("fr-FR")} €</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-700">
          <Euro size={14} className="text-emerald-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Économie / an</p>
            <p className="font-semibold text-emerald-800">{rec.economie_annuelle_euros.toLocaleString("fr-FR")} €</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={14} className="text-gray-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Retour</p>
            <p className="font-semibold text-slate-800">{rec.roi_annees} ans</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-brand-blue-800">
          <Leaf size={14} className="text-brand-blue-500" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">CO₂ évité</p>
            <p className="font-semibold text-brand-blue-800">−{rec.reduction_co2_kg_m2} kg/m²</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-gradient-soft border border-slate-200/60 p-3 flex items-center gap-2">
        <BadgeCheck size={14} className="text-brand-emerald-700 shrink-0" />
        <span className="text-xs text-slate-700">
          Gain conso: <b className="text-brand-emerald-900">−{rec.reduction_conso_kwh_m2} kWh/m²/an</b>
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center gap-2">
        <TrendingDown size={14} className="text-brand-emerald-600" />
        <span className="text-xs text-slate-500">
          Conso : −{rec.reduction_conso_kwh_m2} kWh/m²/an → <b>{rec.nouvelle_conso_kwh_m2}</b> kWh/m²/an
        </span>
      </div>
    </motion.div>
  );
}
