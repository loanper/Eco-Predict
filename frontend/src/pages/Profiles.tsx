import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Home, Building2, Plus, ChevronRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/context/AuthContext';
import { getUsers, getHistory } from '@/lib/api';

export default function Profiles() {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (err) {
                console.error("Failed to load users", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleSelectProfile = (user: any) => {
        setCurrentUser(user);
        navigate(`/profile`); // Go to user dashboard/history
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Profils utilisateurs</h1>
                        <p className="text-muted-foreground">
                            Selectionnez un profil existant ou creez-en un nouveau
                        </p>
                    </div>
                    <Button asChild variant="hero" size="lg">
                        <Link to="/profiles/new">
                            <Plus className="h-5 w-5" />
                            Nouveau profil
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {users.map((user, userIndex) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: userIndex * 0.1 }}
                                className="eco-card overflow-hidden"
                            >
                                <button
                                    onClick={() => handleSelectProfile(user)}
                                    className="w-full text-left group transition-all"
                                >
                                    <div className="p-6 border-b border-border bg-muted/30 group-hover:bg-muted/50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center">
                                                <User className="h-7 w-7 text-primary-foreground" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{user.nom}</h2>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                    {user.type_logement === 'maison' ? <Home size={14} /> : <Building2 size={14} />}
                                                    <span className="capitalize">{user.type_logement}</span>
                                                    <span>•</span>
                                                    <span>Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            </motion.div>
                        ))}

                        {users.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="eco-card p-12 text-center"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Aucun profil</h3>
                                <p className="text-muted-foreground mb-6">
                                    Creez votre premier profil pour commencer l'analyse
                                </p>
                                <Button asChild variant="hero">
                                    <Link to="/profiles/new">
                                        <Plus className="h-5 w-5" />
                                        Creer un profil
                                    </Link>
                                </Button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
