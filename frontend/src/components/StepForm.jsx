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
    <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/80 to-white">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-xs tracking-wider uppercase text-emerald-700 font-semibold">Parcours guidé</p>
            <p className="text-sm text-gray-600">Complétez l'essentiel d'abord, ajoutez l'avancé si nécessaire.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Progression</p>
            <p className="text-lg font-bold text-emerald-700">{stepProgress}%</p>
          </div>
        </div>
        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stepProgress}%` }}
            className="h-full bg-emerald-500"
          />
        </div>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-100">
        {STEPS.map((s, i) => {
          const StepIcon = ICONS[s.icon];
          const active = i === step;
          const done = i < step;
          return (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`px-3 py-4 text-sm font-medium transition-all border-b-2
                ${active ? "bg-emerald-50 text-emerald-700 border-emerald-500" : "border-transparent"}
                ${done ? "text-emerald-700" : ""}
                ${!active && !done ? "text-gray-400 hover:text-gray-600" : ""}
              `}
            >
              <span className="flex items-center justify-center gap-2">
                <StepIcon size={16} />
                <span>{s.label}</span>
              </span>
            </button>
          );
        })}
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
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Icon size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
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
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  {showAdvanced ? <Sparkles size={14} /> : <SlidersHorizontal size={14} />}
                  {showAdvanced ? "Mode simple" : `Afficher ${hiddenCount} champs avancés`}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleFields.map((f) => (
              <div key={f.key} className="rounded-xl border border-gray-100 p-3 bg-white">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {f.label}
                </label>
                {f.type === "select" ? (
                  <select
                    value={formData[f.key] ?? ""}
                    onChange={(e) => handleChange(f.key, e.target.value, "select")}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm
                               focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
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
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm
                               focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                  />
                )}
                {f.key === "tarif_energie_eur_kwh" && (
                  <p className="mt-1 text-[11px] text-gray-400">
                    Astuce: ce tarif se met à jour automatiquement selon l'énergie choisie.
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/70">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 transition"
        >
          <ChevronLeft size={16} /> Précédent
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1 px-5 py-2 bg-emerald-600 text-white text-sm font-medium
                       rounded-lg hover:bg-emerald-700 transition shadow-sm"
          >
            Suivant <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white text-sm font-medium
                       rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-60"
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
