import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Leaf, ArrowRight, Eye, EyeOff, Home, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/lib/api';
import { cn } from '@/lib/utils';

type LogementType = 'maison' | 'appartement';

export default function Register() {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [typeLogement, setTypeLogement] = useState<LogementType>('maison');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nom.trim() || !email.trim() || !password.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const user = await registerUser(nom.trim(), email.trim(), password, typeLogement);
            setCurrentUser(user);
            navigate('/logement');
        } catch (err: any) {
            setError(err.userMessage || "Erreur lors de la création du compte.");
        } finally {
            setLoading(false);
        }
    };

    const isValid = nom.trim().length > 0 && email.trim().length > 0 && password.trim().length >= 4;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 pb-0 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <Leaf className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
                        <p className="text-muted-foreground text-sm">
                            Inscrivez-vous pour suivre vos diagnostics
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom complet</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="nom"
                                    type="text"
                                    placeholder="Jean Dupont"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    className="h-12 pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reg-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="reg-email"
                                    type="email"
                                    placeholder="votre@email.fr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reg-password">Mot de passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="reg-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimum 4 caractères"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Type de logement</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTypeLogement('maison')}
                                    className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                        typeLogement === 'maison'
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-border hover:border-muted-foreground"
                                    )}
                                >
                                    <Home className={cn("h-5 w-5", typeLogement === 'maison' ? "text-blue-600" : "text-muted-foreground")} />
                                    <span className="font-medium text-sm">Maison</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTypeLogement('appartement')}
                                    className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                        typeLogement === 'appartement'
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-border hover:border-muted-foreground"
                                    )}
                                >
                                    <Building2 className={cn("h-5 w-5", typeLogement === 'appartement' ? "text-blue-600" : "text-muted-foreground")} />
                                    <span className="font-medium text-sm">Appartement</span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full h-12 rounded-xl gap-2"
                            disabled={!isValid || loading}
                        >
                            {loading ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    Créer mon compte
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-muted-foreground hover:text-foreground transition"
                            >
                                Déjà un compte ? <span className="font-medium text-primary">Se connecter</span>
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
