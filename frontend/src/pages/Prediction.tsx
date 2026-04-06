import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Lightbulb, Zap, Euro, Leaf,
  FileText, ArrowRight, Download, Share2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DPEGauge from '@/components/DPEGauge';
import { getHistory } from '@/lib/api';
import type { PredictResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { pdf } from '@react-pdf/renderer';
import { ReportPDF } from '@/components/ReportPDF';

function StatCard({ icon: Icon, label, value, unit, bg, delay = 0 }: {
  icon: any; label: string; value: number; unit: string; bg: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`p-6 rounded-xl border ${bg}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold text-foreground">
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        <span className="text-lg font-normal text-muted-foreground ml-1">{unit}</span>
      </div>
    </motion.div>
  );
}

function ComparisonBar({ label, current, improved, unit, color }: {
  label: string; current: number; improved: number; unit: string; color: string;
}) {
  const maxVal = Math.max(current, improved, 1);
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-4 bg-muted rounded-full overflow-hidden border border-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(current / maxVal) * 100}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${color}`}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Actuel : {current.toLocaleString("fr-FR")} {unit}</p>
        </div>
        <ArrowRight size={14} className="text-muted-foreground shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-muted rounded-full overflow-hidden border border-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(improved / maxVal) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full rounded-full bg-secondary"
            />
          </div>
          <p className="text-xs text-secondary mt-1">Après travaux : {improved.toLocaleString("fr-FR")} {unit}</p>
        </div>
      </div>
    </div>
  );
}

// ── Helper : charger le dernier diagnostic ──
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

export default function Prediction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [state, setState] = useState<{ result: PredictResponse; formData: Record<string, unknown> } | null>(
    loadDiagnosticState(location.state)
  );
  const [pageLoading, setPageLoading] = useState(!state?.result);
  const [exportLoading, setExportLoading] = useState(false);
  const isSharing = useRef(false);

  // Si pas de state, charger le dernier diagnostic depuis l'historique backend
  useEffect(() => {
    if (state?.result) {
      setPageLoading(false);
      return;
    }
    if (!currentUser) {
      setPageLoading(false);
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
          localStorage.setItem("ecopredict_last_diagnostic", JSON.stringify(loaded));
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setPageLoading(false);
      }
    }
    loadFromHistory();
  }, [currentUser, state?.result]);

  const handleDownloadPDF = async () => {
    setExportLoading(true);
    
    try {
      const blob = await pdf(
        <ReportPDF 
          diagnostic={state!.result.diagnostic} 
          recommandations={state!.result.recommandations} 
          user={currentUser} 
          homeData={state!.formData} 
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EcoPredict-Audit-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Votre rapport PDF a été généré et téléchargé.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF.",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleShare = async () => {
    if (isSharing.current) return;
    isSharing.current = true;

    const shareData = {
      title: 'Mon Diagnostic EcoPredict',
      text: `J'ai obtenu une estimation DPE ${state?.result.diagnostic.classe_dpe} (non officielle) avec EcoPredict. Découvrez mes conseils rénovation.`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: "Lien copié",
          description: "Le lien de l'application a été copié dans votre presse-papier.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        isSharing.current = false;
      }, 500);
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
        <p className="text-muted-foreground mb-4">Aucun diagnostic en cours</p>
        <Button onClick={() => navigate('/logement')}>Lancer un diagnostic</Button>
      </div>
    );
  }

  const { result, formData } = state;
  const { diagnostic, recommandations } = result;

  const bestConso = recommandations.length > 0
    ? Math.min(...recommandations.map((r) => r.nouvelle_conso_kwh_m2))
    : diagnostic.consommation_kwh_m2_an;

  const bestCost = recommandations.length > 0
    ? Math.min(...recommandations.map((r) =>
      typeof r.nouveau_cout_annuel === "number"
        ? r.nouveau_cout_annuel
        : Math.max(0, diagnostic.cout_annuel_euros - (r.economie_annuelle_euros || 0))
    ))
    : diagnostic.cout_annuel_euros;

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => navigate('/logement')} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Modifier le logement
            </Button>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadPDF} 
                    disabled={exportLoading}
                    className="gap-2 rounded-xl"
                >
                    {exportLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 text-primary" />
                    )}
                    {exportLoading ? 'Génération...' : 'Télécharger PDF'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 rounded-xl">
                    <Share2 className="h-4 w-4 text-emerald-500" />
                    Partager
                </Button>
            </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="eco-card overflow-hidden">
          <div className="p-8 border-b border-border bg-gradient-to-r from-blue-600/5 to-emerald-500/5">
            <h1 className="text-3xl font-black mb-1">Audit de Performance</h1>
            <p className="text-muted-foreground font-medium">
              Simulation temps réel pour votre habitat.
            </p>
          </div>

          <div className="p-8 space-y-10">
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 flex items-start gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-[15px] text-foreground leading-relaxed font-medium">
                Consommation actuelle de <strong>{diagnostic.consommation_kwh_m2_an} kWh/m²/an</strong> (classe DPE <strong>{diagnostic.classe_dpe}</strong> <em>(non officielle)</em>) pour un coût annuel estimé à <strong>{diagnostic.cout_annuel_euros.toLocaleString("fr-FR")} EUR</strong>.
                {recommandations.length > 0 && (
                    <span className="block mt-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        Votre potentiel d'économie est de {Math.round(diagnostic.cout_annuel_euros - bestCost).toLocaleString("fr-FR")} € par an.
                    </span>
                )}
              </p>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatCard icon={Zap} label="Consommation" value={diagnostic.consommation_kwh_m2_an} unit="kWh/m²/an" bg="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300" delay={0.15} />
              <StatCard icon={Leaf} label="Emissions CO2" value={diagnostic.emission_co2_kg_m2_an} unit="kg CO₂/m²/an" bg="bg-card border-border text-foreground" delay={0.25} />
              <StatCard icon={Euro} label="Budget Annuel" value={diagnostic.cout_annuel_euros} unit="EUR/an" bg="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300" delay={0.35} />
            </div>

            {/* DPE / GES */}
            <div className="rounded-[2.5rem] border-2 border-border p-8 bg-card shadow-sm">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Etiquettes Energie & Climat</h3>
              <DPEGauge diagnostic={diagnostic} />
            </div>

            {/* Comparison */}
            {recommandations.length > 0 && (
              <div className="rounded-[2.5rem] border-2 border-border p-8 bg-card shadow-sm space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tight">Potentiel de Rénovation</h3>
                <ComparisonBar label="Performance Energétique" current={diagnostic.consommation_kwh_m2_an} improved={bestConso} unit="kWh/m²/an" color="bg-amber-400" />
                <ComparisonBar label="Budget Énergétique" current={diagnostic.cout_annuel_euros} improved={bestCost} unit="EUR" color="bg-rose-400" />
              </div>
            )}
          </div>

          {/* Actions */}
          {recommandations.length > 0 && (
            <div className="p-8 border-t border-border bg-muted/30 flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate('/conseils')} className="h-16 px-10 rounded-2xl shadow-lg shadow-primary/20">
                <Lightbulb className="h-6 w-6" />
                Détail du Plan d'Action
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

