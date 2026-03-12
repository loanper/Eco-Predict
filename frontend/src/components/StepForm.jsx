import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Shield, Flame, Settings, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { STEPS, STEP_FIELDS } from "../constants";

const ICONS = { Home, Shield, Flame, Settings };

export default function StepForm({ formData, setFormData, onSubmit, loading }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const fields = STEP_FIELDS[current.id];
  const Icon = ICONS[current.icon];

  const handleChange = (key, value, type) => {
    setFormData((prev) => ({
      ...prev,
      [key]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Stepper */}
      <div className="flex border-b border-gray-100">
        {STEPS.map((s, i) => {
          const StepIcon = ICONS[s.icon];
          const active = i === step;
          const done = i < step;
          return (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all
                ${active ? "bg-eco-50 text-eco-700 border-b-2 border-eco-500" : ""}
                ${done ? "text-eco-600" : ""}
                ${!active && !done ? "text-gray-400 hover:text-gray-600" : ""}
              `}
            >
              <StepIcon size={16} />
              <span className="hidden sm:inline">{s.label}</span>
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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-eco-100 flex items-center justify-center">
              <Icon size={20} className="text-eco-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Étape {step + 1} — {current.label}
              </h3>
              <p className="text-xs text-gray-400">
                {fields.length} champs · {step + 1}/{STEPS.length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {f.label}
                </label>
                {f.type === "select" ? (
                  <select
                    value={formData[f.key] ?? ""}
                    onChange={(e) => handleChange(f.key, e.target.value, "select")}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm
                               focus:border-eco-400 focus:ring-2 focus:ring-eco-100 outline-none transition"
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
                               focus:border-eco-400 focus:ring-2 focus:ring-eco-100 outline-none transition"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
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
            className="flex items-center gap-1 px-5 py-2 bg-eco-600 text-white text-sm font-medium
                       rounded-lg hover:bg-eco-700 transition shadow-sm"
          >
            Suivant <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-eco-600 text-white text-sm font-medium
                       rounded-lg hover:bg-eco-700 transition shadow-sm disabled:opacity-60"
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
