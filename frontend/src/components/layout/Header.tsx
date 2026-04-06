import { Link, useLocation } from 'react-router-dom';
import { Leaf, Home, BarChart3, User, LogOut, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/logement', label: 'Diagnostic', icon: BarChart3 },
    ...(currentUser ? [{ path: '/analyses', label: 'Analyses', icon: TrendingDown }] : []),
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero shadow-soft group-hover:shadow-md transition-shadow">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Eco<span className="text-gradient">Predict</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === '/profile'
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/50 text-foreground hover:bg-muted"
                )}
              >
                <User className="h-4 w-4" />
                <span>{currentUser.nom}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/login">
                <User className="h-4 w-4" />
                Se connecter
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
