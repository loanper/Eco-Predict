import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Building2, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/context/AuthContext';
import { createUser } from '@/lib/api';
import { cn } from '@/lib/utils';

type LogementType = 'maison' | 'appartement';

export default function NewProfile() {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const [nom, setNom] = useState('');
    const [typeLogement, setTypeLogement] = useState<LogementType | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nom.trim() || !typeLogement) return;

        setLoading(true);
        try {
            const newUser = await createUser(nom.trim(), typeLogement);
            setCurrentUser(newUser);
            navigate(`/logement`); // Go straight to diagnostic
        } catch (err) {
            console.error("Creation failed", err);
        } finally {
            setLoading(false);
        }
    };

    const isValid = nom.trim().length > 0 && typeLogement !== null;

    return (
        <PageContainer>
            <div className="max-w-xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/profiles')}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux profils
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="eco-card p-8"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4">
                            <User className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Creer un nouveau profil</h1>
                        <p className="text-muted-foreground">
                            Renseignez vos informations pour commencer l'analyse
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Votre nom</Label>
                            <Input
                                id="nom"
                                type="text"
                                placeholder="Ex: Jean Dupont"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Type de logement principal</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTypeLogement('maison')}
                                    className={cn(
                                        "p-6 rounded-xl border-2 transition-all duration-200 text-left",
                                        typeLogement === 'maison'
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                                        typeLogement === 'maison' ? "gradient-hero" : "bg-muted"
                                    )}>
                                        <Home className={cn(
                                            "h-6 w-6",
                                            typeLogement === 'maison' ? "text-primary-foreground" : "text-muted-foreground"
                                        )} />
                                    </div>
                                    <h3 className="font-semibold mb-1">Maison</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Maison individuelle ou mitoyenne
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTypeLogement('appartement')}
                                    className={cn(
                                        "p-6 rounded-xl border-2 transition-all duration-200 text-left",
                                        typeLogement === 'appartement'
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                                        typeLogement === 'appartement' ? "gradient-hero" : "bg-muted"
                                    )}>
                                        <Building2 className={cn(
                                            "h-6 w-6",
                                            typeLogement === 'appartement' ? "text-primary-foreground" : "text-muted-foreground"
                                        )} />
                                    </div>
                                    <h3 className="font-semibold mb-1">Appartement</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Appartement en immeuble
                                    </p>
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={!isValid || loading}
                        >
                            {loading ? "Création..." : "Continuer"}
                            {!loading && <ArrowRight className="h-5 w-5" />}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </PageContainer>
    );
}
