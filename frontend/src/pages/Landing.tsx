import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Zap, Shield, BarChart3, TrendingDown, Leaf, ClipboardCheck, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRef, useEffect, useState } from 'react';

/* ─── Animated Counter ─── */
function AnimCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Inline SVG: House Illustration ─── */
function HouseSvg({ className = '', variant = 'normal' }: { className?: string; variant?: 'normal' | 'eco' | 'smart' }) {
  const roofColor = variant === 'eco' ? '#10b981' : variant === 'smart' ? '#3b82f6' : '#94a3b8';
  const wallColor = variant === 'eco' ? '#d1fae5' : variant === 'smart' ? '#dbeafe' : '#f1f5f9';
  const windowColor = variant === 'eco' ? '#6ee7b7' : variant === 'smart' ? '#93c5fd' : '#cbd5e1';
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Roof */}
      <polygon points="60,10 10,55 110,55" fill={roofColor} />
      {variant === 'eco' && <polygon points="75,18 80,10 85,18 85,30 75,30" fill="#065f46" />}
      {variant === 'smart' && <circle cx="90" cy="25" r="8" fill="#fbbf24" opacity="0.8" />}
      {/* Walls */}
      <rect x="20" y="55" width="80" height="55" fill={wallColor} rx="2" />
      {/* Door */}
      <rect x="48" y="80" width="24" height="30" rx="3" fill={roofColor} />
      <circle cx="67" cy="97" r="2" fill="white" />
      {/* Windows */}
      <rect x="28" y="62" width="16" height="14" rx="2" fill={windowColor} stroke={roofColor} strokeWidth="1.5" />
      <line x1="36" y1="62" x2="36" y2="76" stroke={roofColor} strokeWidth="1" />
      <line x1="28" y1="69" x2="44" y2="69" stroke={roofColor} strokeWidth="1" />
      <rect x="76" y="62" width="16" height="14" rx="2" fill={windowColor} stroke={roofColor} strokeWidth="1.5" />
      <line x1="84" y1="62" x2="84" y2="76" stroke={roofColor} strokeWidth="1" />
      <line x1="76" y1="69" x2="92" y2="69" stroke={roofColor} strokeWidth="1" />
      {/* Chimney */}
      {variant === 'normal' && (
        <>
          <rect x="80" y="20" width="12" height="35" fill="#64748b" rx="1" />
          <motion.ellipse cx="86" cy="15" rx="6" ry="4" fill="#94a3b8" opacity="0.5"
            animate={{ y: [-5, -15], opacity: [0.5, 0], scale: [1, 1.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
          />
        </>
      )}
      {/* Solar panels for eco */}
      {variant === 'eco' && (
        <g>
          <rect x="25" y="28" width="22" height="14" rx="1" fill="#047857" transform="rotate(-25 36 35)" />
          <line x1="30" y1="30" x2="30" y2="42" stroke="#065f46" strokeWidth="0.5" transform="rotate(-25 36 35)" />
          <line x1="36" y1="30" x2="36" y2="42" stroke="#065f46" strokeWidth="0.5" transform="rotate(-25 36 35)" />
          <line x1="42" y1="30" x2="42" y2="42" stroke="#065f46" strokeWidth="0.5" transform="rotate(-25 36 35)" />
        </g>
      )}
      {/* Wifi waves for smart */}
      {variant === 'smart' && (
        <g opacity="0.6">
          <path d="M55 45 Q60 40 65 45" stroke="#3b82f6" strokeWidth="2" fill="none" />
          <path d="M52 40 Q60 32 68 40" stroke="#3b82f6" strokeWidth="2" fill="none" />
        </g>
      )}
    </svg>
  );
}

/* ─── Chart SVG ─── */
function ChartSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className={className}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 0 80 Q 30 75 50 60 T 100 40 T 150 25 T 200 15"
        stroke="#10b981" strokeWidth="3" fill="none"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <path d="M 0 80 Q 30 75 50 60 T 100 40 T 150 25 T 200 15 L 200 100 L 0 100 Z" fill="url(#chartGrad)" />
      {/* Bars behind */}
      {[20, 50, 80, 110, 140, 170].map((x, i) => (
        <motion.rect key={i} x={x} width="12" rx="2" fill="#3b82f6" opacity="0.15"
          initial={{ y: 100, height: 0 }}
          whileInView={{ y: 100 - (30 + i * 10), height: 30 + i * 10 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
        />
      ))}
    </svg>
  );
}

/* ─── Features ─── */
const features = [
  { icon: Zap, title: 'Prédiction instantanée', desc: 'Estimation précise de votre consommation énergétique en quelques secondes grâce à notre intelligence de calcul.' },
  { icon: TrendingDown, title: 'Réduction des coûts', desc: 'Identifiez les postes de dépense et optimisez votre consommation pour économiser jusqu\'à 45%.' },
  { icon: Shield, title: 'Conseils personnalisés', desc: 'Recommandations de travaux classées par retour sur investissement, adaptées à votre logement.' },
  { icon: MessageCircle, title: 'Conseiller IA intégré', desc: 'Posez vos questions à notre IA spécialisée en rénovation énergétique et aides financières.' },
];

/* ─── Steps ─── */
const steps = [
  { num: '01', title: 'Décrivez votre logement', desc: 'Remplissez un formulaire intelligent en 2 minutes. Les champs avancés sont masqués par défaut.', houseVariant: 'normal' as const },
  { num: '02', title: 'Obtenez votre diagnostic', desc: 'Une analyse complète de votre habitat pour estimer vos dépenses et votre impact écologique.', houseVariant: 'smart' as const },
  { num: '03', title: 'Passez à l\'action', desc: 'Découvrez les travaux les plus rentables et laissez notre IA vous guider pour les aides financières.', houseVariant: 'eco' as const },
];

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleStart = () => navigate(currentUser ? '/logement' : '/login');

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
            
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Diagnostic énergétique nouvelle génération
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08]">
                Votre logement,<br />
                <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  optimisé pour demain.
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                EcoPredict analyse plus de 40 caractéristiques de votre habitat pour prédire votre consommation, 
                calculer votre DPE et vous recommander les travaux les plus rentables.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" variant="hero" className="gap-2 h-14 px-8 text-lg rounded-xl" onClick={handleStart}>
                  <ClipboardCheck className="h-5 w-5" />
                  Lancer mon diagnostic
                </Button>
                {!currentUser && (
                  <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-lg rounded-xl" asChild>
                    <Link to="/login">
                      Choisir un profil
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Right - Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-lg">
                {/* Glow behind */}
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-emerald-500/10 to-transparent blur-3xl rounded-3xl" />
                
                {/* Dashboard card */}
                <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  {/* Title bar */}
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-muted-foreground font-medium">EcoPredict Dashboard</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* DPE Row */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                      <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Classe DPE actuelle</div>
                        <div className="flex gap-1">
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l) => (
                            <div key={l} className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${
                              l === 'D' ? 'bg-yellow-400 text-yellow-900 scale-110 ring-2 ring-yellow-400/50' : 'bg-muted text-muted-foreground'
                            }`}>{l}</div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">218</div>
                        <div className="text-xs text-muted-foreground">kWh/m2/an</div>
                      </div>
                    </div>
                    
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                        <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">-45%</div>
                        <div className="text-xs text-muted-foreground">Réduction CO2</div>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-300">850 €</div>
                        <div className="text-xs text-muted-foreground">Économies / an</div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="text-xs text-muted-foreground font-medium mb-2">Évolution de la consommation</div>
                      <ChartSvg className="w-full h-16" />
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Rentabilité travaux</span>
                        <span className="font-medium">8.5 ans</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '70%' }} transition={{ delay: 0.8, duration: 1.2 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -right-6 top-16 bg-card border border-border rounded-2xl shadow-lg p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">DPE Certifié</div>
                    <div className="text-xs text-muted-foreground">Analysé par IA</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="py-14 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: 40, suffix: '+', label: 'Points de contrôle' },
              { val: 98, suffix: '%', label: 'Précision des résultats' },
              { val: 2, suffix: ' min', label: 'Pour un diagnostic' },
              { val: 25, suffix: '%', label: "d'économies moyennes" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  <AnimCounter target={s.val} suffix={s.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trois étapes simples pour transformer les performances énergétiques de votre habitat.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center group"
              >
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                
                <div className="relative inline-block mb-6">
                  <HouseSvg variant={s.houseVariant} className="w-28 h-28 mx-auto group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {s.num}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une plateforme complète pour comprendre et maîtriser votre consommation énergétique.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ BEFORE / AFTER ═══════════ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                De la classe E à la classe B,<br />
                <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  en un diagnostic.
                </span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Notre moteur de simulation teste 9 scénarios de travaux et vous présente les plus rentables.
                Isolation, chauffage, ventilation, vitrage : chaque recommandation est chiffrée avec un coût, 
                une économie annuelle et un retour sur investissement précis.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Isolation murs ITE', saving: '320 €/an', roi: '7.2 ans' },
                  { label: 'PAC Air/Eau', saving: '580 €/an', roi: '9.1 ans' },
                  { label: 'Triple vitrage', saving: '180 €/an', roi: '11 ans' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                    <span className="font-medium">{r.label}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{r.saving}</span>
                      <span className="text-muted-foreground">ROI {r.roi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-center gap-8">
              <div className="text-center">
                <HouseSvg variant="normal" className="w-36 h-36 mb-4" />
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-bold text-sm">
                  DPE E
                </div>
                <div className="text-sm text-muted-foreground mt-2">Avant travaux</div>
              </div>
              <div className="flex items-center">
                <ArrowRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <HouseSvg variant="eco" className="w-36 h-36 mb-4" />
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  DPE B
                </div>
                <div className="text-sm text-muted-foreground mt-2">Après travaux</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-emerald-600/5 pointer-events-none" />
        <div className="container relative mx-auto px-4 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-card border border-border rounded-3xl p-10 md:p-14 shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Prêt à réduire votre empreinte ?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Créez votre profil, lancez votre premier diagnostic et découvrez comment diviser vos factures énergétiques.
            </p>
            <Button variant="hero" size="xl" className="px-10 h-16 text-lg rounded-xl" onClick={handleStart}>
              Commencer maintenant
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">EcoPredict</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 EcoPredict. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
