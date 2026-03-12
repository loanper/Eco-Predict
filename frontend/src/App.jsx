import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, AlertTriangle } from "lucide-react";
import StepForm from "./components/StepForm";
import Dashboard from "./components/Dashboard";
import RecommandationCard from "./components/RecommandationCard";
import ChatWidget from "./components/ChatWidget";
import { postPredict } from "./api";
import { DEFAULT_HOME } from "./constants";

export default function App() {
  const [formData, setFormData] = useState({ ...DEFAULT_HOME });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-eco-50">
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
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Caractéristiques du logement
          </h2>
          <StepForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
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
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Résultat du diagnostic
                </h2>
                <Dashboard result={result} />
              </section>

              {/* Recommendations */}
              {result.recommandations?.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Travaux recommandés
                  </h2>
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
