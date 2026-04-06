import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecommandationCard from '@/components/RecommandationCard';
import { getHistory, postInterpret } from '@/lib/api';
import type { PredictResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// ── Skeleton Loader ──
function InterpretSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-500/20 flex items-center justify-center">
          <Bot className="h-5 w-5 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div>
          <div className="h-4 w-48 bg-muted rounded-md" />
          <div className="h-3 w-32 bg-muted rounded-md mt-1.5" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full bg-muted rounded-md" />
        <div className="h-3 w-[92%] bg-muted rounded-md" />
        <div className="h-3 w-[85%] bg-muted rounded-md" />
        <div className="h-3 w-full bg-muted rounded-md" />
        <div className="h-3 w-[78%] bg-muted rounded-md" />
        <div className="h-3 w-[90%] bg-muted rounded-md" />
        <div className="h-3 w-[65%] bg-muted rounded-md" />
      </div>
      <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
        />
        Analyse stratégique par l'IA en cours...
      </div>
    </div>
  );
}

// ── Helper ──
function loadDiagnosticState(
  locationState: any,
): { result: PredictResponse; formData: Record<string, unknown> } | null {
  if (locationState?.result) return locationState;
  try {
    const saved = localStorage.getItem("ecopredict_last_diagnostic");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.result) return parsed;
    }
  } catch {}
  return null;
}

export default function Conseils() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [state, setState] = useState<{ result: PredictResponse; formData: Record<string, unknown> } | null>(
    loadDiagnosticState(location.state)
  );
  const [pageLoading, setPageLoading] = useState(!state?.result);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [interpretError, setInterpretError] = useState<string | null>(null);

  // Charger le diagnostic et l'interprétation existante
  useEffect(() => {
    if (!currentUser) {
      if (state?.result) setPageLoading(false);
      return;
    }

    async function loadFromHistory() {
      try {
        const history = await getHistory(currentUser!.id);
        if (history.length > 0) {
          history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const latest = history[0];
          const loaded = {
            result: {
              diagnostic: latest.diagnostic,
              recommandations: latest.recommandations,
              history_id: latest.id,
            } as PredictResponse,
            formData: latest.homeData || {},
          };
          setState(loaded);
          if (latest.interpretation) {
            setInterpretation(latest.interpretation);
          }
          localStorage.setItem("ecopredict_last_diagnostic", JSON.stringify(loaded));
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setPageLoading(false);
      }
    }
    loadFromHistory();
  }, [currentUser]); // On synchronise dès que le user change

  const handleInterpret = async () => {
    if (!state) return;
    setInterpretLoading(true);
    setInterpretError(null);
    try {
      const data = await postInterpret(
        state.result.history_id || null,
        state.result.diagnostic,
        state.result.recommandations,
        currentUser?.id || null,
      );
      setInterpretation(data.interpretation);
      // Optionnel : on pourrait aussi mettre à jour le cache local s'il y en avait un
    } catch (err: any) {
      setInterpretError(err.userMessage || "Impossible de contacter l'IA.");
    } finally {
      setInterpretLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!state?.result) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Aucune recommandation disponible</p>
        <Button onClick={() => navigate('/logement')}>Lancer un diagnostic</Button>
      </div>
    );
  }

  const { result } = state;
  const { recommandations } = result;

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/prediction')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour au diagnostic
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Lightbulb className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Plan d'Action Énergétique</h1>
              <p className="text-muted-foreground font-medium">
                Optimisez votre logement avec {recommandations.length} recommandation(s) ciblée(s).
              </p>
            </div>
          </div>

          {/* AI Synthesis Section - TOP POSITION */}
          <section className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-[2rem] -m-1 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative rounded-[2rem] border-2 border-dashed border-primary/30 bg-card/50 backdrop-blur-sm p-8 shadow-sm">
              <AnimatePresence mode="wait">
                {interpretation ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-md">
                          <Bot className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Synthèse de l'Expert IA</h3>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Plan Stratégique Personnalisé</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setInterpretation(null)} className="text-[10px] uppercase font-bold tracking-widest opacity-50 hover:opacity-100">
                        Ré-analyser
                      </Button>
                    </div>
                    <div className="text-sm md:text-base leading-relaxed text-foreground/90 whitespace-pre-wrap bg-background/50 rounded-2xl p-6 border border-primary/10 shadow-inner">
                      {interpretation}
                    </div>
                  </motion.div>
                ) : interpretLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <InterpretSkeleton />
                  </motion.div>
                ) : (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30 relative">
                      <Sparkles className="h-10 w-10 text-white animate-pulse" />
                      <div className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                      </div>
                    </div>
                    <h3 className="font-bold text-2xl mb-3">Besoin d'un éclairage stratégique ?</h3>
                    <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
                      Demandez à notre IA d'analyser l'intégralité de votre plan d'action. Obtenez une vision claire sur l'ordre de priorité, les aides financières mobilisables et le retour sur investissement global.
                    </p>
                    <Button
                      variant="hero"
                      size="xl"
                      className="gap-3 rounded-2xl h-14 px-10 text-lg shadow-xl shadow-primary/20"
                      onClick={handleInterpret}
                    >
                      <Bot className="h-6 w-6" />
                      Générer ma Synthèse Expert
                    </Button>
                    {interpretError && (
                      <p className="text-destructive font-bold text-sm mt-4">{interpretError}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Cards Grid */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 px-2">
              <span className="h-6 w-1 rounded-full bg-primary" />
              Détail des recommandations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommandations.length === 0 ? (
                <div className="col-span-full p-12 text-center border-2 border-dashed border-border rounded-3xl">
                  <p className="text-muted-foreground font-medium">Aucun travail spécifique n'est requis pour améliorer votre logement.</p>
                </div>
              ) : (
                recommandations.sort((a, b) => a.roi_annees - b.roi_annees).map((rec, i) => (
                  <RecommandationCard
                    key={rec.nom}
                    rec={rec}
                    rank={i}
                  />
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
