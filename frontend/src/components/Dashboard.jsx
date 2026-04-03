import { motion } from "framer-motion";
import { Euro, TrendingDown, Leaf, ArrowRight } from "lucide-react";
import DPEGauge from "./DPEGauge";

function StatCard({ icon: Icon, label, value, unit, tone }) {
  const tones = {
    conso: "from-amber-50 to-amber-100/30 text-amber-900 border-amber-200/70",
    co2: "from-indigo-50 to-indigo-100/30 text-indigo-900 border-indigo-200/70",
    cost: "from-emerald-50 to-emerald-100/30 text-emerald-900 border-emerald-200/70",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 bg-gradient-to-br ${tones[tone]}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="opacity-70" />
        <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</span>
      </div>
      <p className="kpi-value">
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        <span className="text-base font-medium ml-1 opacity-65">{unit}</span>
      </p>
    </motion.div>
  );
}

function ComparisonBar({ label, current, improved, unit, color }) {
  const maxVal = Math.max(current, improved, 1);
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(current / maxVal) * 100}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${color}`}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Actuel : {current} {unit}</p>
        </div>
        <ArrowRight size={14} className="text-slate-300 shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(improved / maxVal) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full rounded-full bg-eco-400"
            />
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Après travaux : {improved} {unit}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ result }) {
  if (!result) return null;
  const { diagnostic, recommandations } = result;

  const bestConso = recommandations.length > 0
    ? Math.min(...recommandations.map((r) => r.nouvelle_conso_kwh_m2))
    : diagnostic.consommation_kwh_m2_an;

  const bestCost = recommandations.length > 0
    ? Math.min(
        ...recommandations.map((r) =>
          typeof r.nouveau_cout_annuel === "number"
            ? r.nouveau_cout_annuel
            : Math.max(0, diagnostic.cout_annuel_euros - (r.economie_annuelle_euros || 0))
        )
      )
    : diagnostic.cout_annuel_euros;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingDown}
          label="Consommation"
          value={diagnostic.consommation_kwh_m2_an}
          unit="kWh/m²/an"
          tone="conso"
        />
        <StatCard
          icon={Leaf}
          label="Émissions CO₂"
          value={diagnostic.emission_co2_kg_m2_an}
          unit="kg CO₂/m²/an"
          tone="co2"
        />
        <StatCard
          icon={Euro}
          label="Coût annuel"
          value={diagnostic.cout_annuel_euros}
          unit="€/an"
          tone="cost"
        />
      </div>

      {/* DPE / GES Gauges */}
      <div className="premium-card p-6">
        <h3 className="section-title mb-4">
          Étiquettes énergie & climat
        </h3>
        <DPEGauge diagnostic={diagnostic} />
      </div>

      {/* Comparison */}
      {recommandations.length > 0 && (
        <div className="premium-card p-6 space-y-4">
          <h3 className="section-title">
            Avant / Après travaux
          </h3>
          <ComparisonBar
            label="Consommation énergétique"
            current={diagnostic.consommation_kwh_m2_an}
            improved={bestConso}
            unit="kWh/m²/an"
            color="bg-amber-400"
          />
          <ComparisonBar
            label="Coût annuel"
            current={diagnostic.cout_annuel_euros}
            improved={bestCost}
            unit="€"
            color="bg-rose-400"
          />
        </div>
      )}
    </motion.div>
  );
}
