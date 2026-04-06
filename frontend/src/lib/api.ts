import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    timeout: 120000,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (!err.response) {
            err.userMessage = "Serveur EcoPredict injoignable. Verifiez que le backend est lance.";
        } else if (err.response.status === 503) {
            err.userMessage = err.response.data?.detail || "Service temporairement indisponible.";
        } else {
            err.userMessage = err.response.data?.detail || "Une erreur est survenue.";
        }
        return Promise.reject(err);
    }
);

export interface DiagnosticResult {
    consommation_kwh_m2_an: number;
    emission_co2_kg_m2_an: number;
    cout_annuel_euros: number;
    classe_dpe: string;
    classe_ges: string;
    zone_climatique: string;
}

export interface Recommandation {
    nom: string;
    cout_travaux_euros: number;
    economie_annuelle_euros: number;
    roi_annees: number;
    reduction_conso_kwh_m2: number;
    nouvelle_conso_kwh_m2: number;
    nouvelle_classe_dpe: string;
    reduction_co2_kg_m2: number;
    nouveau_cout_annuel?: number;
}

export interface PredictResponse {
    diagnostic: DiagnosticResult;
    recommandations: Recommandation[];
    history_id?: string | null;
}

export interface ChatResponse {
    response: string;
    model: string;
}

export interface InterpretResponse {
    interpretation: string;
    cached: boolean;
}

export async function postPredict(homeData: Record<string, unknown>): Promise<PredictResponse> {
    const { data } = await api.post<PredictResponse>("/predict", homeData);
    return data;
}

export async function postChat(homeData: Record<string, unknown>, message: string): Promise<ChatResponse> {
    const { data } = await api.post<ChatResponse>("/chat", { home: homeData, message });
    return data;
}

export async function postInterpret(
    historyId: string | null,
    diagnostic: DiagnosticResult,
    recommandations: Recommandation[],
    userId?: string | null,
): Promise<InterpretResponse> {
    const { data } = await api.post<InterpretResponse>("/interpret", {
        history_id: historyId,
        user_id: userId,
        diagnostic,
        recommandations,
    });
    return data;
}

export async function loginUser(email: string, password: string): Promise<any> {
    const { data } = await api.post<any>("/login", { email, password });
    return data;
}

export async function registerUser(nom: string, email: string, password: string, type_logement: string): Promise<any> {
    const { data } = await api.post<any>("/register", { nom, email, password, type_logement });
    return data;
}

export async function getHistory(user_id: string): Promise<any[]> {
    const { data } = await api.get<any[]>(`/history/${user_id}`);
    return data;
}

export async function getHistoryEntry(id: string): Promise<any> {
    const { data } = await api.get<any>(`/history/entry/${id}`);
    return data;
}

export async function deleteHistoryEntry(id: string): Promise<any> {
    const { data } = await api.delete<any>(`/history/entry/${id}`);
    return data;
}

export async function postCompareInterpret(
    diagA: any, diagB: any, recsA: any[], recsB: any[], homeA: any, homeB: any
): Promise<{ verdict: string }> {
    const { data } = await api.post<{ verdict: string }>("/compare-interpret", {
        diag_a: diagA, diag_b: diagB, recs_a: recsA, recs_b: recsB, home_a: homeA, home_b: homeB,
    });
    return data;
}

export default api;
