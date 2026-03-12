import { motion } from "framer-motion";
import { Wrench, Euro, Clock, TrendingDown, Leaf } from "lucide-react";

const RANK_STYLES = [
  "ring-2 ring-yellow-400 bg-yellow-50",
  "ring-2 ring-gray-300 bg-gray-50",
  "ring-2 ring-orange-300 bg-orange-50",
];

export default function RecommandationCard({ rec, rank }) {
  const ringClass = RANK_STYLES[rank] || "bg-white";
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition ${ringClass}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{medals[rank] || "🔧"}</span>
          <h4 className="font-semibold text-gray-800 text-sm">{rec.nom}</h4>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-eco-100 text-eco-700">
          DPE {rec.nouvelle_classe_dpe}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Wrench size={14} className="text-gray-400" />
          <div>
            <p className="text-[10px] text-gray-400">Coût travaux</p>
            <p className="font-semibold">{rec.cout_travaux_euros.toLocaleString("fr-FR")} €</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-700">
          <Euro size={14} className="text-emerald-400" />
          <div>
            <p className="text-[10px] text-gray-400">Économie / an</p>
            <p className="font-semibold">{rec.economie_annuelle_euros.toLocaleString("fr-FR")} €</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={14} className="text-gray-400" />
          <div>
            <p className="text-[10px] text-gray-400">ROI</p>
            <p className="font-semibold">{rec.roi_annees} ans</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-blue-700">
          <Leaf size={14} className="text-blue-400" />
          <div>
            <p className="text-[10px] text-gray-400">CO₂ évité</p>
            <p className="font-semibold">−{rec.reduction_co2_kg_m2} kg/m²</p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
        <TrendingDown size={14} className="text-eco-500" />
        <span className="text-xs text-gray-500">
          Conso : −{rec.reduction_conso_kwh_m2} kWh/m²/an → <b>{rec.nouvelle_conso_kwh_m2}</b> kWh/m²/an
        </span>
      </div>
    </motion.div>
  );
}
