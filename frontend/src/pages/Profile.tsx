import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getHistory, postInterpret, deleteHistoryEntry } from '@/lib/api';
import { HistoriqueEntry } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Calendar, ArrowRight, History, Play, Bot, ChevronDown, ChevronUp, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileDashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [historyItems, setHistoryItems] = useState<HistoriqueEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [interpretingId, setInterpretingId] = useState<string | null>(null);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        async function loadHistory() {
            try {
                const items = await getHistory(currentUser!.id);
                items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setHistoryItems(items);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadHistory();
    }, [currentUser, navigate]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : (prev.length < 2 ? [...prev, id] : [prev[1], id])
        );
    };

    const handleCompare = () => {
        if (selectedIds.length === 2) {
            navigate('/compare', { state: { ids: selectedIds } });
        }
    };

    const handleRequestInterpretation = async (item: HistoriqueEntry) => {
        setInterpretingId(item.id);
        try {
            const data = await postInterpret(
                item.id,
                item.diagnostic as any,
                item.recommandations,
                currentUser?.id || null,
            );
            // Update local state
            setHistoryItems((prev) =>
                prev.map((h) =>
                    h.id === item.id ? { ...h, interpretation: data.interpretation } : h
                )
            );
            setExpandedItem(item.id);
        } catch (err) {
            console.error(err);
        } finally {
            setInterpretingId(null);
        }
    };

    const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce diagnostic ?")) return;

        try {
            await deleteHistoryEntry(id);
            setHistoryItems(prev => prev.filter(item => item.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="relative pb-24">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Bonjour, {currentUser.nom}</h1>
                        <p className="text-muted-foreground font-medium">Gérez vos diagnostics et comparez vos projets de rénovation.</p>
                    </div>
                    <Button variant="hero" onClick={() => navigate('/logement')}>
                        <Play className="h-4 w-4 mr-2" />
                        Nouveau diagnostic
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : historyItems.length === 0 ? (
                    <div className="eco-card p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                            <History className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Aucun diagnostic</h2>
                        <p className="text-muted-foreground mb-6">Vous n'avez pas encore réalisé de diagnostic.</p>
                        <Button onClick={() => navigate('/logement')}>Lancer un diagnostic maintenant</Button>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {historyItems.map((item, index) => {
                            const diag = item.diagnostic as any;
                            const hasInterpretation = !!(item as any).interpretation;
                            const isExpanded = expandedItem === item.id;
                            const isInterpreting = interpretingId === item.id;
                            const isSelected = selectedIds.includes(item.id);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg ${
                                        isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border bg-card'
                                    }`}
                                >
                                    <div className="p-6 md:p-8 flex gap-6">
                                        {/* Selection Checkbox */}
                                        <div className="hidden sm:flex shrink-0 items-center justify-center">
                                            <button 
                                                onClick={() => toggleSelect(item.id)}
                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                                                    isSelected ? 'bg-primary border-primary text-white' : 'border-muted-foreground/30'
                                                }`}
                                            >
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </button>
                                        </div>

                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-sm font-semibold flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-primary" />
                                                        {new Date(item.timestamp).toLocaleDateString('fr-FR', {
                                                            year: 'numeric', month: 'long', day: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        variant={isSelected ? 'secondary' : 'ghost'} 
                                                        size="sm" 
                                                        onClick={() => toggleSelect(item.id)}
                                                        className="sm:hidden text-xs"
                                                    >
                                                        {isSelected ? 'Sélectionné' : 'Comparer'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const navState = {
                                                                result: { diagnostic: diag, recommandations: item.recommandations, history_id: item.id },
                                                                formData: item.homeData
                                                            };
                                                            localStorage.setItem("ecopredict_last_diagnostic", JSON.stringify(navState));
                                                            navigate('/prediction', { state: navState });
                                                        }}
                                                        className="shrink-0 group rounded-xl border-border"
                                                    >
                                                        <BarChart3 className="h-4 w-4 mr-2" />
                                                        Détails
                                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => handleDeleteItem(e, item.id)}
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-3 rounded-2xl bg-background/50 border border-border/50 text-center flex flex-col items-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Classe DPE</span>
                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-xl text-white bg-gradient-to-br from-blue-600 to-emerald-500 shadow-sm">
                                                        {diag.classe_dpe}
                                                    </span>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-background/50 border border-border/50 text-center flex flex-col items-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Impact CO₂</span>
                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-xl text-white bg-blue-600/80 shadow-sm">
                                                        {diag.classe_ges}
                                                    </span>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-background/50 border border-border/50 text-center flex flex-col justify-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Conso</span>
                                                    <div className="text-lg font-black">{Math.round(diag.consommation_kwh_m2_an)} <span className="text-[10px] lowercase font-medium text-muted-foreground">kWh/m²</span></div>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-background/50 border border-border/50 text-center flex flex-col justify-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Budget Énergie</span>
                                                    <div className="text-lg font-black">{Math.round(diag.cout_annuel_euros)} <span className="text-[10px] font-medium text-muted-foreground">€/an</span></div>
                                                </div>
                                            </div>

                                            {/* Interpretation Section */}
                                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                                {hasInterpretation ? (
                                                    <div className="w-full">
                                                        <button
                                                            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                                            className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
                                                        >
                                                            <div className="p-1.5 rounded-lg bg-primary/10">
                                                                <Bot size={16} />
                                                            </div>
                                                            Analyse de l'expert disponible
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="mt-3 p-5 rounded-2xl bg-background/80 border border-primary/10 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                                        {(item as any).interpretation}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2 rounded-xl text-[11px] font-bold uppercase tracking-wider"
                                                        onClick={() => handleRequestInterpretation(item)}
                                                        disabled={isInterpreting}
                                                    >
                                                        {isInterpreting ? (
                                                            <>
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                                    className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full"
                                                                />
                                                                Interprétation...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles size={14} className="text-blue-500" />
                                                                Analyse Stratégique par IA
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Selection Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl"
                    >
                        <div className="bg-card/80 backdrop-blur-xl border border-primary/30 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                    {selectedIds.length}
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Sélection en cours</div>
                                    <div className="text-xs text-muted-foreground">
                                        {selectedIds.length === 1 ? 'Choisissez un autre élément' : 'Prêt pour la comparaison'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="rounded-xl">
                                    Annuler
                                </Button>
                                <Button 
                                    variant="hero" 
                                    size="sm" 
                                    disabled={selectedIds.length < 2}
                                    onClick={handleCompare}
                                    className="rounded-xl px-6"
                                >
                                    Comparer maintenant
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
