import { Home, Shield, Flame, Settings } from "lucide-react";

export const STEPS = [
    { id: "general" as const, label: "General", icon: Home },
    { id: "enveloppe" as const, label: "Enveloppe", icon: Shield },
    { id: "systemes" as const, label: "Systemes", icon: Flame },
    { id: "details" as const, label: "Details", icon: Settings },
];

export type StepId = (typeof STEPS)[number]["id"];

export const ENERGY_TARIFF_SUGGESTIONS: Record<string, number> = {
    electricite: 0.2516,
    gaz: 0.121,
    fioul: 0.124,
    bois: 0.085,
    charbon: 0.11,
    gpl: 0.182,
    reseau: 0.11,
};

export const DEFAULT_HOME: Record<string, unknown> = {
    surface_habitable_logement: 85,
    annee_construction_dpe: 1975,
    nombre_niveau_logement: 1,
    nombre_niveau_immeuble: 4,
    surface_habitable_immeuble: 340,
    type_batiment_dpe: "appartement",
    zone_climatique: "H2",
    code_departement: "75",
    periode_construction_dpe: "1975-1977",
    surface_mur_totale: 120,
    surface_mur_exterieur: 90,
    surface_mur_deperditif: 90,
    u_mur_exterieur: 2.5,
    surface_plancher_bas_totale: 85,
    surface_plancher_bas_deperditif: 85,
    surface_plancher_haut_totale: 0,
    surface_plancher_haut_deperditif: 0,
    u_baie_vitree: 3.3,
    facteur_solaire_baie_vitree: 0.65,
    surface_vitree_nord: 3,
    surface_vitree_sud: 5,
    surface_vitree_ouest: 2,
    surface_vitree_est: 2,
    type_isolation_mur_exterieur: "non isole",
    type_isolation_plancher_bas: "non isole",
    type_isolation_plancher_haut: "inconnu",
    materiaux_structure_mur_exterieur: "beton",
    type_vitrage: "simple vitrage",
    type_materiaux_menuiserie: "bois",
    type_gaz_lame: "inconnu",
    type_energie_chauffage: "gaz",
    tarif_energie_eur_kwh: 0.121,
    type_installation_chauffage: "collectif",
    type_generateur_chauffage: "chaudiere classique gaz",
    type_energie_ecs: "gaz",
    type_generateur_ecs: "chaudiere classique gaz",
    type_installation_ecs: "collectif",
    type_ventilation: "Ventilation naturelle",
    chauffage_solaire: "0",
    ecs_solaire: "0",
    traversant: "inconnu",
    presence_balcon: "1",
    classe_inertie: "lourde",
};

export interface FieldDef {
    key: string;
    label: string;
    type: "number" | "select";
    options?: Array<string | { label: string; value: string }>;
    min?: number;
    max?: number;
    step?: number;
    tooltip?: string;
}

export const ESSENTIAL_FIELDS: Record<StepId, string[]> = {
    general: [
        "type_batiment_dpe",
        "surface_habitable_logement",
        "annee_construction_dpe",
        "zone_climatique",
    ],
    enveloppe: [
        "type_isolation_mur_exterieur",
        "type_vitrage",
        "type_isolation_plancher_haut",
        "type_isolation_plancher_bas",
    ],
    systemes: [
        "type_energie_chauffage",
        "tarif_energie_eur_kwh",
        "type_generateur_chauffage",
        "type_energie_ecs",
        "type_generateur_ecs",
        "type_ventilation",
    ],
    details: [
        "nombre_niveau_logement",
        "traversant",
        "classe_inertie",
    ],
};

export const STEP_FIELDS: Record<StepId, FieldDef[]> = {
    general: [
        { key: "type_batiment_dpe", label: "Type de batiment", type: "select", options: ["maison", "appartement", "immeuble"], tooltip: "Type de logement. Maison = habitat individuel, appartement = logement en immeuble, immeuble = batiment entier." },
        { key: "surface_habitable_logement", label: "Surface habitable (m\u00b2)", type: "number", min: 9, max: 500, tooltip: "Surface interieure chauffee du logement. N'inclut pas garage, cave, balcon." },
        { key: "annee_construction_dpe", label: "Annee de construction", type: "number", min: 1800, max: 2026, tooltip: "Annee principale de construction. Si renove lourdement, vous pouvez garder l'annee d'origine." },
        {
            key: "zone_climatique",
            label: "Region climatique",
            type: "select",
            options: [
                { value: "H1", label: "Nord et Est (froid)" },
                { value: "H2", label: "Ouest et Centre (tempere)" },
                { value: "H3", label: "Sud et Mediterranee (chaud)" },
            ],
            tooltip: "Selectionnez la grande region climatique de votre logement en France (H1 froid, H2 tempere, H3 chaud).",
        },
        { key: "periode_construction_dpe", label: "Periode de construction", type: "select", options: ["avant 1948", "1948-1974", "1975-1977", "1978-1982", "1983-1988", "1989-2000", "2001-2005", "2006-2012", "2013-2021", "apres 2021"], tooltip: "Option plus precise que l'annee seule pour representer les normes thermiques de l'epoque." },
    ],
    enveloppe: [
        { key: "type_isolation_mur_exterieur", label: "Isolation des murs", type: "select", options: ["non isole", "ITI", "ITE", "ITI+ITE"], tooltip: "ITI = isolation thermique par l'interieur, ITE = isolation thermique par l'exterieur, ITI+ITE = combinaison des deux." },
        { key: "type_vitrage", label: "Type de vitrage", type: "select", options: ["simple vitrage", "double vitrage", "triple vitrage"], tooltip: "Simple = ancien, double = standard actuel, triple = tres performant." },
        { key: "type_isolation_plancher_haut", label: "Isolation plancher haut", type: "select", options: ["non isole", "isole", "inconnu"], tooltip: "Isolation sous toiture ou combles. Impact important sur les pertes de chaleur." },
        { key: "type_isolation_plancher_bas", label: "Isolation plancher bas", type: "select", options: ["non isole", "isole", "inconnu"], tooltip: "Isolation du sol au-dessus d'un sous-sol, vide sanitaire ou local non chauffe." },
        { key: "materiaux_structure_mur_exterieur", label: "Materiaux murs", type: "select", options: ["beton", "pierre", "brique", "bois", "inconnu"], tooltip: "Materiau principal des murs exterieurs. Sert a affiner l'inertie et les pertes." },
    ],
    systemes: [
        { key: "type_energie_chauffage", label: "Energie de chauffage", type: "select", options: ["gaz", "electricite", "fioul", "bois", "gpl", "reseau", "charbon"], tooltip: "Energie principale utilisee pour chauffer le logement." },
        { key: "tarif_energie_eur_kwh", label: "Tarif energie (EUR/kWh)", type: "number", min: 0.01, max: 5, step: 0.0001, tooltip: "Valeur par defaut proposee selon l'energie selectionnee, modifiable librement." },
        { key: "type_installation_chauffage", label: "Installation chauffage", type: "select", options: ["individuel", "collectif"], tooltip: "Individuel = chaudiere propre au logement. Collectif = chauffage partage." },
        { key: "type_generateur_chauffage", label: "Generateur chauffage", type: "select", options: ["chaudiere classique gaz", "chaudiere condensation gaz", "chaudiere classique fioul", "pac air/eau", "pac air/air", "radiateur electrique", "poele bois", "inconnu"], tooltip: "Appareil qui produit la chaleur: chaudiere, PAC, radiateurs, poele..." },
        { key: "type_energie_ecs", label: "Energie eau chaude (ECS)", type: "select", options: ["gaz", "electricite", "fioul", "bois", "inconnu"], tooltip: "ECS signifie eau chaude sanitaire: douche, bain, robinets." },
        { key: "type_generateur_ecs", label: "Generateur eau chaude (ECS)", type: "select", options: ["chaudiere classique gaz", "ballon electrique", "chauffe-eau thermodynamique", "inconnu"], tooltip: "Equipement qui produit l'eau chaude sanitaire." },
        { key: "type_installation_ecs", label: "Installation eau chaude (ECS)", type: "select", options: ["individuel", "collectif"], tooltip: "Individuel = production dans le logement, collectif = production centralisee pour l'immeuble." },
        { key: "type_ventilation", label: "Ventilation", type: "select", options: ["Ventilation naturelle", "Ventilation mecanique auto reglable", "Ventilation mecanique par insufflation", "Ventilation mecanique hygroreglable", "inconnu"], tooltip: "Renouvellement de l'air du logement. La VMC est une ventilation mecanique." },
        { key: "chauffage_solaire", label: "Chauffage solaire", type: "select", options: [{ value: "0", label: "Non" }, { value: "1", label: "Oui" }], tooltip: "Indique s'il existe un appoint solaire pour le chauffage." },
        { key: "ecs_solaire", label: "Eau chaude solaire", type: "select", options: [{ value: "0", label: "Non" }, { value: "1", label: "Oui" }], tooltip: "Indique si l'eau chaude sanitaire est produite en partie par le solaire." },
    ],
    details: [
        { key: "nombre_niveau_logement", label: "Nombre de niveaux", type: "number", min: 1, max: 20, tooltip: "Nombre d'etages occupes par le logement (ex: duplex = 2)." },
        { key: "traversant", label: "Logement traversant", type: "select", options: ["oui", "non", "inconnu"], tooltip: "Oui si le logement a des ouvertures sur deux facades opposees." },
        { key: "classe_inertie", label: "Classe d'inertie", type: "select", options: ["legere", "moyenne", "lourde", "tres lourde", "inconnu"], tooltip: "Capacite du bati a stocker la chaleur. Lourde = temperature plus stable." },
        { key: "type_materiaux_menuiserie", label: "Menuiserie", type: "select", options: ["bois", "pvc", "aluminium", "mixte", "inconnu"], tooltip: "Materiau des cadres de fenetres. Le bois et le PVC isolent souvent mieux que l'aluminium non coupe." },
        { key: "type_gaz_lame", label: "Gaz lame vitrage", type: "select", options: ["air", "argon", "inconnu"], tooltip: "Gaz entre les vitres: argon = meilleure isolation que l'air." },
        { key: "presence_balcon", label: "Presence balcon", type: "select", options: [{ value: "0", label: "Non" }, { value: "1", label: "Oui" }], tooltip: "Presence d'un balcon. Information secondaire de contexte." },
    ],
};

export const STEP_META: Record<StepId, string> = {
    general: "Informations de base pour estimer votre profil energetique.",
    enveloppe: "Isolation et vitrages : les plus gros leviers de consommation.",
    systemes: "Chauffage, ECS et ventilation pour affiner le cout annuel.",
    details: "Parametres avances pour une estimation plus fine.",
};
