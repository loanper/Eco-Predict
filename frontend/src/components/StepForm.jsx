import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Shield,
  Flame,
  Settings,
  ChevronRight,
  ChevronLeft,
  Zap,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { STEPS, STEP_FIELDS } from "../constants";

const ICONS = { Home, Shield, Flame, Settings };

const STEP_META = {
  general: "Informations de base pour estimer rapidement votre profil énergétique.",
  enveloppe: "Isolation et vitrages: ce sont les plus gros leviers de consommation.",
  systemes: "Chauffage, ECS et ventilation pour affiner le coût annuel.",
  details: "Paramètres avancés pour une estimation plus fine.",
};

const ESSENTIAL_FIELDS = {
  general: [
    "type_batiment_dpe",
    "surface_habitable_logement",
    "annee_construction_dpe",
    "zone_climatique",
    "code_departement",
  ],
  enveloppe: [
    "u_mur_exterieur",
    "type_isolation_mur_exterieur",
    "type_vitrage",
    "u_baie_vitree",
    "surface_plancher_bas_totale",
    "type_isolation_plancher_bas",
  ],
  systemes: [
    "type_energie_chauffage",
    "tarif_energie_eur_kwh",
    "type_generateur_chauffage",
    "type_energie_ecs",
    "type_ventilation",
  ],
  details: [
    "facteur_solaire_baie_vitree",
    "presence_balcon",
    "classe_inertie",
  ],
};

export default function StepForm({ formData, setFormData, onSubmit, loading, onFieldChange }) {
  const [step, setStep] = useState(0);
  const [advancedByStep, setAdvancedByStep] = useState({
    general: false,
    enveloppe: false,
    systemes: false,
    details: false,
  });

  const current = STEPS[step];
  const fields = STEP_FIELDS[current.id];
  const Icon = ICONS[current.icon];
  const essentials = ESSENTIAL_FIELDS[current.id] || [];
  const showAdvanced = advancedByStep[current.id];

  const visibleFields = useMemo(() => {
    if (showAdvanced) return fields;
    return fields.filter((f) => essentials.includes(f.key));
  }, [fields, essentials, showAdvanced]);

  const hiddenCount = Math.max(0, fields.length - visibleFields.length);
  const stepProgress = Math.round(((step + 1) / STEPS.length) * 100);

  const handleChange = (key, value, type) => {
    const parsedValue = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev) => ({
      ...prev,
      [key]: parsedValue,
    }));
    if (onFieldChange) {
      onFieldChange(key, parsedValue, type);
    }
  };

  const toggleAdvanced = () => {
    setAdvancedByStep((prev) => ({
      ...prev,
      [current.id]: !prev[current.id],
    }));
  };

  return (
    <div className="premium-card overflow-hidden shadow-lift border border-slate-200/60">
      <div className="px-6 pt-6 pb-5 border-b border-slate-200/60 bg-brand-gradient-soft">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-xs tracking-wider uppercase text-slate-800 font-extrabold">Parcours guidé</p>
            <p className="text-sm text-slate-600">Complétez l'essentiel d'abord, ajoutez l'avancé si nécessaire.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Progression</p>
            <p className="text-lg font-extrabold text-gradient-brand">{stepProgress}%</p>
          </div>
        </div>
        <div className="h-2 bg-white/70 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stepProgress}%` }}
            className="h-full bg-brand-gradient"
          />
        </div>
      </div>

      {/* Stepper */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200/60 bg-white/60">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-slate-100/70 p-2 border border-slate-200/60">
        {STEPS.map((s, i) => {
          const StepIcon = ICONS[s.icon];
          const active = i === step;
          const done = i < step;
          return (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`px-3 py-3 rounded-xl text-sm font-semibold transition-all
                ${active ? "bg-white text-slate-900 shadow-soft border border-slate-200/70" : "border border-transparent"}
                ${done && !active ? "text-brand-emerald-700" : ""}
                ${!active && !done ? "text-slate-500 hover:text-slate-800" : ""}
              `}
            >
              <span className="flex items-center justify-center gap-2">
                <StepIcon size={16} className={active ? "text-brand-blue-700" : done ? "text-brand-emerald-700" : "text-slate-400"} />
                <span>{s.label}</span>
              </span>
            </button>
          );
        })}
        </div>
      </div>

      {/* Fields */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-gradient-soft flex items-center justify-center border border-slate-200/60">
                <Icon size={20} className="text-brand-blue-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 tracking-tight">
                  Étape {step + 1} - {current.label}
                </h3>
                <p className="text-xs text-gray-500">{STEP_META[current.id]}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {visibleFields.length}/{fields.length} champs affichés
              </span>
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={toggleAdvanced}
                  className="inline-flex items-center gap-2 px-3 py-1.5 btn-ghost text-xs font-semibold"
                >
                  {showAdvanced ? <Sparkles size={14} /> : <SlidersHorizontal size={14} />}
                  {showAdvanced ? "Mode simple" : `Afficher ${hiddenCount} champs avancés`}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleFields.map((f) => (
              <div key={f.key} className="rounded-2xl border border-slate-200/60 p-4 bg-white/70 shadow-soft">
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wide mb-2">
                  {f.label}
                </label>
                {f.type === "select" ? (
                  <select
                    value={formData[f.key] ?? ""}
                    onChange={(e) => handleChange(f.key, e.target.value, "select")}
                    className="w-full control px-3 py-2.5 text-sm text-slate-900"
                  >
                    {f.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={formData[f.key] ?? ""}
                    min={f.min}
                    max={f.max}
                    step={f.step || 1}
                    onChange={(e) => handleChange(f.key, e.target.value, "number")}
                    className="w-full control px-3 py-2.5 text-sm text-slate-900"
                  />
                )}
                {f.key === "tarif_energie_eur_kwh" && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Astuce: ce tarif se met à jour automatiquement selon l'énergie choisie.
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-5 border-t border-slate-200/60 bg-white/60">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition"
        >
          <ChevronLeft size={16} /> Précédent
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-2 px-6 py-2.5 btn-brand text-sm font-semibold"
          >
            Suivant <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 btn-brand text-sm font-semibold disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Zap size={16} />
            )}
            Diagnostiquer
          </button>
        )}
      </div>
    </div>
  );
}
