import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRightLeft, Zap, Leaf, Euro, Info, Trophy, Home,
  CheckCircle2, XCircle, MinusCircle, Wrench, Sparkles, Bot, Loader2, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHistoryEntry, postCompareInterpret } from '@/lib/api';

// ── DPE rank helper ──
const DPE_RANK: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7 };
function betterDPE(a: string, b: string): 'a' | 'b' | 'tie' {
  const ra = DPE_RANK[a] ?? 8, rb = DPE_RANK[b] ?? 8;
  if (ra < rb) return 'a';
  if (rb < ra) return 'b';
  return 'tie';
}

// ── Criteria definitions ──
interface CriterionResult {
  id: string;
  label: string;
  icon: any;
  valueA: string;
  valueB: string;
  winner: 'a' | 'b' | 'tie';
}

function buildCriteria(a: any, b: any): CriterionResult[] {
  const da = a.diagnostic, db = b.diagnostic;
  const recsA = a.recommandations || [], recsB = b.recommandations || [];

  return [
    {
      id: 'dpe',
      label: 'Classe DPE',
      icon: Award,
      valueA: da.classe_dpe,
      valueB: db.classe_dpe,
      winner: betterDPE(da.classe_dpe, db.classe_dpe),
    },
    {
      id: 'conso',
      label: 'Consommation',
      icon: Zap,
      valueA: `${Math.round(da.consommation_kwh_m2_an)} kWh/m²`,
      valueB: `${Math.round(db.consommation_kwh_m2_an)} kWh/m²`,
      winner: da.consommation_kwh_m2_an < db.consommation_kwh_m2_an ? 'a' : da.consommation_kwh_m2_an > db.consommation_kwh_m2_an ? 'b' : 'tie',
    },
    {
      id: 'cost',
      label: 'Facture annuelle',
      icon: Euro,
      valueA: `${Math.round(da.cout_annuel_euros).toLocaleString('fr-FR')} €`,
      valueB: `${Math.round(db.cout_annuel_euros).toLocaleString('fr-FR')} €`,
      winner: da.cout_annuel_euros < db.cout_annuel_euros ? 'a' : da.cout_annuel_euros > db.cout_annuel_euros ? 'b' : 'tie',
    },
    {
      id: 'co2',
      label: 'Émissions CO₂',
      icon: Leaf,
      valueA: `${Math.round(da.emission_co2_kg_m2_an)} kg/m²`,
      valueB: `${Math.round(db.emission_co2_kg_m2_an)} kg/m²`,
      winner: da.emission_co2_kg_m2_an < db.emission_co2_kg_m2_an ? 'a' : da.emission_co2_kg_m2_an > db.emission_co2_kg_m2_an ? 'b' : 'tie',
    },
    {
      id: 'works',
      label: 'Travaux nécessaires',
      icon: Wrench,
      valueA: `${recsA.length} travaux`,
      valueB: `${recsB.length} travaux`,
      winner: recsA.length < recsB.length ? 'a' : recsA.length > recsB.length ? 'b' : 'tie',
    },
  ];
}

export default function ScenarioCompare() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ids] = useState<string[]>(location.state?.ids || []);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (ids.length !== 2) { setLoading(false); return; }
    async function fetchData() {
      try {
        const results = await Promise.all(ids.map(id => getHistoryEntry(id)));
        setData(results);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [ids]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  // ── Empty State ──
  if (data.length !== 2) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="eco-card p-12 text-center border-2 border-dashed border-muted-foreground/20"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ArrowRightLeft className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black mb-4">Prêt pour la comparaison ?</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
            Le comparateur vous permet d'analyser côte à côte deux projets de rénovation pour choisir la solution la plus rentable.
          </p>
          <div className="bg-muted/50 rounded-2xl p-6 mb-10 text-left max-w-md mx-auto space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <Info size={16} className="text-primary" /> Comment faire ?
            </h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              {['Rendez-vous dans votre Profil', 'Sélectionnez deux diagnostics', 'Cliquez sur "Comparer maintenant"'].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Button size="xl" variant="hero" onClick={() => navigate('/profile')} className="px-10 rounded-2xl shadow-lg shadow-primary/20">
            Aller au Profil <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
          </Button>
        </motion.div>
      </div>
    );
  }

  const [a, b] = data;
  const criteria = buildCriteria(a, b);
  const scoreA = criteria.filter(c => c.winner === 'a').length;
  const scoreB = criteria.filter(c => c.winner === 'b').length;
  const overallWinner = scoreA > scoreB ? 'a' : scoreB > scoreA ? 'b' : 'tie';

  const handleAiVerdict = async () => {
    setAiLoading(true);
    try {
      const res = await postCompareInterpret(
        a.diagnostic, b.diagnostic,
        a.recommandations || [], b.recommandations || [],
        a.homeData || {}, b.homeData || {},
      );
      setAiVerdict(res.verdict);
    } catch (err) {
      console.error(err);
      setAiVerdict("Impossible de contacter l'expert IA. Vérifiez que la clé API est configurée.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Build works comparison ──
  const recsA = (a.recommandations || []) as any[];
  const recsB = (b.recommandations || []) as any[];
  const recsAIds = new Set(recsA.map((r: any) => r.id || r.nom));
  const recsBIds = new Set(recsB.map((r: any) => r.id || r.nom));
  const commonIds = [...recsAIds].filter(id => recsBIds.has(id));
  const onlyA = recsA.filter((r: any) => !recsBIds.has(r.id || r.nom));
  const onlyB = recsB.filter((r: any) => !recsAIds.has(r.id || r.nom));

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/profile')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold text-sm">
          <ArrowRightLeft className="h-4 w-4" /> Comparateur
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Face à Face</h1>
        <p className="text-muted-foreground font-medium text-lg">Analyse multi-critères de vos deux diagnostics.</p>
      </div>

      {/* ═══ SCORE GLOBAL ═══ */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03]"><Trophy size={200} /></div>
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Score A */}
            <div className={`text-center transition-all ${overallWinner === 'a' ? 'scale-110' : 'opacity-70'}`}>
              <div className={`text-6xl font-black mb-2 ${overallWinner === 'a' ? 'text-emerald-500' : 'text-muted-foreground'}`}>{scoreA}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scénario 1</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {new Date(a.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-full flex items-center justify-center text-white font-black text-lg italic shadow-xl ring-4 ring-background">
                VS
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                sur {criteria.length} critères
              </div>
            </div>

            {/* Score B */}
            <div className={`text-center transition-all ${overallWinner === 'b' ? 'scale-110' : 'opacity-70'}`}>
              <div className={`text-6xl font-black mb-2 ${overallWinner === 'b' ? 'text-emerald-500' : 'text-muted-foreground'}`}>{scoreB}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scénario 2</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {new Date(b.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </div>
            </div>
          </div>

          {overallWinner !== 'tie' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                <Trophy size={16} />
                {overallWinner === 'a' ? 'Scénario 1' : 'Scénario 2'} remporte la comparaison
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ═══ TABLEAU MULTI-CRITÈRES ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1.2fr_auto_1.2fr] items-center px-8 py-5 bg-muted/50 border-b border-border">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Critère</div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Scénario 1</div>
            <div className="w-16" />
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Scénario 2</div>
          </div>

          {/* Table Rows */}
          {criteria.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                className={`grid grid-cols-[1fr_1.2fr_auto_1.2fr] items-center px-8 py-5 ${i < criteria.length - 1 ? 'border-b border-border/50' : ''} hover:bg-muted/30 transition-colors`}
              >
                {/* Criterion label */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="font-bold text-sm">{c.label}</span>
                </div>

                {/* Value A */}
                <div className={`text-center font-bold text-lg ${c.winner === 'a' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                  {c.valueA}
                </div>

                {/* Winner badge */}
                <div className="w-16 flex justify-center">
                  {c.winner === 'a' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-500" /></div>
                  ) : c.winner === 'b' ? (
                    <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center"><XCircle size={18} className="text-rose-400" /></div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><MinusCircle size={18} className="text-muted-foreground" /></div>
                  )}
                </div>

                {/* Value B */}
                <div className={`text-center font-bold text-lg ${c.winner === 'b' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                  {c.valueB}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ COMPARAISON DES TRAVAUX ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="bg-card border border-border rounded-3xl p-8 shadow-lg">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Wrench size={20} className="text-amber-600" />
            </div>
            Comparaison des travaux recommandés
          </h3>

          {/* Common works */}
          {commonIds.length > 0 && (
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <ArrowRightLeft size={12} /> Travaux communs aux deux scénarios
              </div>
              <div className="space-y-3">
                {commonIds.map(id => {
                  const rA = recsA.find((r: any) => (r.id || r.nom) === id)!;
                  const rB = recsB.find((r: any) => (r.id || r.nom) === id)!;
                  const betterEco = rA.economie_annuelle_euros > rB.economie_annuelle_euros ? 'a' : rA.economie_annuelle_euros < rB.economie_annuelle_euros ? 'b' : 'tie';
                  return (
                    <div key={id as string} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 rounded-2xl bg-muted/30 border border-border/50">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${betterEco === 'a' ? 'text-emerald-600' : ''}`}>{Math.round(rA.economie_annuelle_euros)} €/an</div>
                        <div className="text-[10px] text-muted-foreground">Coût: {Math.round(rA.cout_travaux_euros).toLocaleString('fr-FR')} €</div>
                      </div>
                      <div className="text-center px-3">
                        <div className="text-xs font-bold text-foreground truncate max-w-[180px]">{rA.nom}</div>
                        <div className="text-[10px] text-muted-foreground">ROI: {rA.roi_annees}a vs {rB.roi_annees}a</div>
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-bold ${betterEco === 'b' ? 'text-emerald-600' : ''}`}>{Math.round(rB.economie_annuelle_euros)} €/an</div>
                        <div className="text-[10px] text-muted-foreground">Coût: {Math.round(rB.cout_travaux_euros).toLocaleString('fr-FR')} €</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exclusive works */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onlyA.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <Home size={12} /> Uniquement Scénario 1
                </div>
                <div className="space-y-2">
                  {onlyA.map((r: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex justify-between items-center">
                      <span className="text-sm font-medium truncate pr-2">{r.nom}</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{Math.round(r.economie_annuelle_euros)} €/an</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {onlyB.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <Home size={12} /> Uniquement Scénario 2
                </div>
                <div className="space-y-2">
                  {onlyB.map((r: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
                      <span className="text-sm font-medium truncate pr-2">{r.nom}</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{Math.round(r.economie_annuelle_euros)} €/an</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {onlyA.length === 0 && onlyB.length === 0 && commonIds.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-6">
              Aucun travail recommandé dans ces scénarios.
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══ CONFIGURATION HABITAT ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HabitatCard diag={a} label="Scénario 1" variant="blue" />
          <HabitatCard diag={b} label="Scénario 2" variant="emerald" />
        </div>
      </motion.div>

      {/* ═══ VERDICT IA ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <div className="bg-card border border-border rounded-3xl p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Bot size={200} /></div>
          <div className="relative">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500">
                <Sparkles size={20} className="text-white" />
              </div>
              Avis de l'Expert IA
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Demandez à notre intelligence artificielle de synthétiser la comparaison et de vous donner un conseil stratégique.
            </p>

            <AnimatePresence mode="wait">
              {aiVerdict ? (
                <motion.div key="verdict"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-emerald-500/5 border border-primary/10 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                        <Bot size={16} className="text-primary" />
                      </div>
                      <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{aiVerdict}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setAiVerdict(null); }} className="text-xs">
                    Relancer l'analyse
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button
                    variant="hero" size="lg"
                    onClick={handleAiVerdict}
                    disabled={aiLoading}
                    className="gap-3 rounded-2xl px-8 shadow-lg shadow-primary/20"
                  >
                    {aiLoading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Analyse en cours...</>
                    ) : (
                      <><Sparkles className="h-5 w-5" /> Obtenir le verdict de l'expert</>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Sub-components ──

function HabitatCard({ diag, label, variant }: { diag: any; label: string; variant: 'blue' | 'emerald' }) {
  const colors = variant === 'blue'
    ? 'from-blue-500/5 to-slate-500/5 border-blue-500/10'
    : 'from-emerald-500/5 to-blue-500/5 border-emerald-500/10';

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${colors} p-6`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 rounded-xl ${variant === 'blue' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
          <Home size={16} className={variant === 'blue' ? 'text-blue-600' : 'text-emerald-600'} />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="text-[10px] text-muted-foreground">
            {new Date(diag.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        {[
          { label: 'Surface', value: `${diag.homeData?.surface_habitable_logement || '—'} m²` },
          { label: 'Année', value: diag.homeData?.annee_construction_dpe || '—' },
          { label: 'Chauffage', value: diag.homeData?.type_energie_chauffage || '—' },
          { label: 'Zone', value: diag.homeData?.zone_climatique || '—' },
        ].map(item => (
          <div key={item.label}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</div>
            <div className="text-sm font-bold truncate">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
