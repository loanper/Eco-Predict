export interface Coefficient {
  chauffage: Record<string, number>;
  isolation: Record<string, number>;
  zone_climatique: Record<string, number>;
  prix_kwh: number;
}

export interface SeuilsConsommation {
  faible: number;
  moyenne: number;
}

export interface Conseil {
  id: string;
  texte: string;
  raison: string;
}

export interface Prediction {
  conso_kwh: number;
  conso_euros: number;
  categorie: 'faible' | 'moyenne' | 'elevee';
}

export interface SimulationInput {
  surface_m2: number;
  type_logement: 'maison' | 'appartement';
  annee_construction: number;
  niveau_isolation: 'faible' | 'moyen' | 'bon';
  type_chauffage: 'electrique' | 'gaz' | 'PAC' | 'bois';
  zone_climatique: 'A' | 'B' | 'C';
  nombre_occupants: number;
}

export interface Simulation {
  simulation_id: string;
  date: string;
  input: SimulationInput;
  prediction: Prediction;
  conseils: Conseil[];
}

export interface Logement {
  logement_id: string;
  nom: string;
  surface_m2: number;
  type_logement: 'maison' | 'appartement';
  annee_construction: number;
  niveau_isolation: 'faible' | 'moyen' | 'bon';
  type_chauffage: 'electrique' | 'gaz' | 'PAC' | 'bois';
  zone_climatique: 'A' | 'B' | 'C';
  nombre_occupants: number;
  simulations: Simulation[];
}

export interface Utilisateur {
  id: string;
  nom: string;
  logements: Logement[];
}

export interface RegleConseil {
  id: string;
  condition: string;
  conseil: string;
  raison: string;
  priorite: number;
}

export interface MockData {
  coefficients: Coefficient;
  seuils_consommation: SeuilsConsommation;
  utilisateurs: Utilisateur[];
  regles_conseils: RegleConseil[];
}

export interface VariableImportance {
  variable: string;
  label: string;
  importance: number;
}
