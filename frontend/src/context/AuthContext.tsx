import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getHistory } from "@/lib/api";

export interface User {
    id: string;
    nom: string;
    email: string;
    type_logement: string;
    created_at: string;
}

export interface HistoriqueEntry {
    id: string;
    user_id: string;
    timestamp: string;
    homeData: Record<string, unknown>;
    diagnostic: Record<string, unknown>;
    recommandations: any[];
}

interface AuthContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("ecopredict_user");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("ecopredict_user", JSON.stringify(currentUser));
        } else {
            localStorage.removeItem("ecopredict_user");
        }
    }, [currentUser]);

    const logout = () => setCurrentUser(null);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
