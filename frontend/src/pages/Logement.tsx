import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Zap, SlidersHorizontal, Sparkles, Info, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { STEPS, STEP_FIELDS, STEP_META, ESSENTIAL_FIELDS, DEFAULT_HOME, ENERGY_TARIFF_SUGGESTIONS, type StepId } from '@/lib/constants';
import { postPredict } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Logement() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({ ...DEFAULT_HOME });
  const [advancedByStep, setAdvancedByStep] = useState<Record<StepId, boolean>>({
    general: false, enveloppe: false, systemes: false, details: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = STEPS[step];
  const fields = STEP_FIELDS[current.id];
  const essentials = ESSENTIAL_FIELDS[current.id];
  const showAdvanced = advancedByStep[current.id];
  const Icon = current.icon;

  const visibleFields = useMemo(() => {
    if (showAdvanced) return fields;
    return fields.filter((f) => essentials.includes(f.key));
  }, [fields, essentials, showAdvanced]);

  const hiddenCount = Math.max(0, fields.length - visibleFields.length);
  const stepProgress = Math.round(((step + 1) / STEPS.length) * 100);

  // Auto tariff suggestion
  useEffect(() => {
    const currentEnergy = formData.type_energie_chauffage as string;
    const suggested = ENERGY_TARIFF_SUGGESTIONS[currentEnergy];
    if (typeof suggested !== 'number') return;
    setFormData((prev) => ({ ...prev, tarif_energie_eur_kwh: suggested }));
  }, [formData.type_energie_chauffage]);

  // Keep internal department coherent for the ML model while exposing only climate regions in UI.
  useEffect(() => {
    const zone = String(formData.zone_climatique ?? 'H2');
    const deptByZone: Record<string, string> = { H1: '59', H2: '75', H3: '13' };
    const fallbackDept = deptByZone[zone] ?? '75';
    setFormData((prev) => {
      if (String(prev.code_departement ?? '') === fallbackDept) return prev;
      return { ...prev, code_departement: fallbackDept };
    });
  }, [formData.zone_climatique]);

  const handleChange = (key: string, value: string, type: string) => {
    const parsed = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [key]: parsed }));
  };

  const toggleAdvanced = () => {
    setAdvancedByStep((prev) => ({ ...prev, [current.id]: !prev[current.id] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Nettoyer le payload : convertir "" en null, supprimer les valeurs invalides
      const cleaned: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(formData)) {
        if (v === "" || v === undefined) {
          cleaned[k] = null;
        } else {
          cleaned[k] = v;
        }
      }
      const payload = cleaned;
      const userPayload = currentUser ? { user_id: currentUser.id, ...payload } : payload;
      const data = await postPredict(userPayload);
      // Sauvegarder dans localStorage pour persistance entre pages
      localStorage.setItem("ecopredict_last_diagnostic", JSON.stringify({ result: data, formData: payload }));
      navigate('/prediction', { state: { result: data, formData: payload } });
    } catch (err: any) {
      setError(err.userMessage || "Erreur lors du diagnostic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="eco-card">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Diagnostic energetique</h1>
                  <p className="text-muted-foreground text-sm">Completez l'essentiel, ajoutez l'avance si necessaire.</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Progression</p>
                <p className="text-lg font-bold text-gradient">{stepProgress}%</p>
              </div>
            </div>
            <Progress value={stepProgress} className="h-2" />
          </div>

          {/* Stepper */}
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const active = i === step;
                const done = i < step;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(i)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                      active && "bg-background shadow-soft border border-border text-foreground",
                      done && !active && "text-secondary",
                      !active && !done && "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {done ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </span>
                    ) : (
                      <StepIcon size={16} className={active ? "text-primary" : "text-muted-foreground"} />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
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
                <div>
                  <h3 className="font-bold text-foreground">
                    Etape {step + 1} : {current.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">{STEP_META[current.id]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {visibleFields.length}/{fields.length} champs
                  </span>
                  {(hiddenCount > 0 || showAdvanced) && (
                    <Button variant="ghost" size="sm" onClick={toggleAdvanced} className="text-xs gap-1.5">
                      {showAdvanced ? <Sparkles size={14} /> : <SlidersHorizontal size={14} />}
                      {showAdvanced ? "Mode simple" : `+ ${hiddenCount} avances`}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleFields.map((f) => (
                  <div key={f.key} className="space-y-2 p-4 rounded-xl border border-border bg-background/50">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
                      {f.label}
                      {f.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={13} className="text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[260px]">
                            <p className="text-xs">{f.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </Label>
                    {f.type === "select" ? (
                      <select
                        value={String(formData[f.key] ?? "")}
                        onChange={(e) => handleChange(f.key, e.target.value, "select")}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {f.options?.map((o) => {
                          const value = typeof o === 'string' ? o : o.value;
                          const label = typeof o === 'string' ? o : o.label;
                          return <option key={value} value={value}>{label}</option>;
                        })}
                      </select>
                    ) : (
                      <Input
                        type="number"
                        value={String(formData[f.key] ?? "")}
                        min={f.min}
                        max={f.max}
                        step={f.step || 1}
                        onChange={(e) => handleChange(f.key, e.target.value, "number")}
                        className="h-10"
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="gap-1"
            >
              <ArrowLeft size={16} /> Precedent
            </Button>

            {step < STEPS.length - 1 ? (
              <Button variant="hero" onClick={() => setStep((s) => s + 1)} className="gap-2">
                Suivant <ArrowRight size={16} />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Zap size={16} />
                )}
                Diagnostiquer
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
