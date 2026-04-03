import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, AlertTriangle, Wallet, Hammer, MessageCircle, CheckCircle2 } from "lucide-react";
import StepForm from "./components/StepForm";
import Dashboard from "./components/Dashboard";
import RecommandationCard from "./components/RecommandationCard";
import ChatWidget from "./components/ChatWidget";
import { postPredict } from "./api";
import { DEFAULT_HOME, ENERGY_TARIFF_SUGGESTIONS } from "./constants";

export default function App() {
  const [formData, setFormData] = useState({ ...DEFAULT_HOME });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevEnergyRef = useRef(DEFAULT_HOME.type_energie_chauffage);
  const tariffManuallyEditedRef = useRef(false);

  const handleFieldChange = (key, value) => {
    if (key === "tarif_energie_eur_kwh") {
      const currentEnergy = formData.type_energie_chauffage;
      const suggested = ENERGY_TARIFF_SUGGESTIONS[currentEnergy];
      const numericValue = Number(value);

      // Si la valeur diverge du tarif suggere, on considere que l'utilisateur personnalise.
      tariffManuallyEditedRef.current =
        typeof suggested === "number" &&
        Number.isFinite(numericValue) &&
        Math.abs(numericValue - suggested) >= 1e-9;
    }
  };

  useEffect(() => {
    const currentEnergy = formData.type_energie_chauffage;
    const nextSuggested = ENERGY_TARIFF_SUGGESTIONS[currentEnergy];

    if (!nextSuggested) {
      prevEnergyRef.current = currentEnergy;
      return;
    }

    // Auto-suggestion seulement si l'utilisateur n'a pas force un tarif custom.
    if (!tariffManuallyEditedRef.current) {
      setFormData((prev) => ({ ...prev, tarif_energie_eur_kwh: nextSuggested }));
    }

    prevEnergyRef.current = currentEnergy;
  }, [formData.type_energie_chauffage]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postPredict(formData);
      setResult(data);
    } catch (err) {
      setError(err.userMessage || "Erreur lors du diagnostic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_0%,#ecfdf5_0%,#f8fafc_38%,#f7faf9_100%)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-eco-600 flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">EcoPredict</h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">Diagnostic & Rénovation Énergétique</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline">v3 · PPE ING4</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="premium-card p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="section-title mb-2">Simulation guidée</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight max-w-2xl">
                Estimez votre facture annuelle et vos travaux rentables en quelques minutes
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                Nous affichons d'abord les champs essentiels. Les paramètres avancés sont disponibles si vous voulez affiner.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 lg:min-w-[420px]">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                <Wallet size={16} className="text-emerald-700 mb-1" />
                <p className="text-xs text-slate-500">Objectif 1</p>
                <p className="text-sm font-semibold text-slate-800">Coût annuel clair</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                <Hammer size={16} className="text-emerald-700 mb-1" />
                <p className="text-xs text-slate-500">Objectif 2</p>
                <p className="text-sm font-semibold text-slate-800">ROI des travaux</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                <MessageCircle size={16} className="text-emerald-700 mb-1" />
                <p className="text-xs text-slate-500">Objectif 3</p>
                <p className="text-sm font-semibold text-slate-800">Conseils actionnables</p>
              </div>
            </div>
          </div>
        </section>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              <AlertTriangle size={16} />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs font-medium">
                Fermer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</span>
            <h2 className="section-title">Saisie du logement</h2>
          </div>
          <StepForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
            onFieldChange={handleFieldChange}
          />
        </section>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Dashboard */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">2</span>
                  <h2 className="section-title">Diagnostic</h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                    <CheckCircle2 size={12} /> Calcul terminé
                  </span>
                </div>
                <Dashboard result={result} />
              </section>

              {/* Recommendations */}
              {result.recommandations?.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">3</span>
                    <h2 className="section-title">Travaux recommandés</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {result.recommandations.map((rec, i) => (
                      <RecommandationCard key={rec.nom} rec={rec} rank={i} />
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chat */}
      <ChatWidget formData={formData} />
    </div>
  );
}
