/* Constantes partagées pour les steps du formulaire */

export const STEPS = [
  { id: "general",   label: "Général",   icon: "Home" },
  { id: "enveloppe", label: "Enveloppe", icon: "Shield" },
  { id: "systemes",  label: "Systèmes",  icon: "Flame" },
  { id: "details",   label: "Détails",   icon: "Settings" },
];

export const ENERGY_TARIFF_SUGGESTIONS = {
  electricite: 0.2516,
  gaz: 0.1284,
  fioul: 0.119,
  bois: 0.07,
  charbon: 0.09,
  gpl: 0.155,
  reseau: 0.105,
};

export const DEFAULT_HOME = {
  // Step 1 — Général
  surface_habitable_logement: 85,
  annee_construction_dpe: 1975,
  nombre_niveau_logement: 1,
  nombre_niveau_immeuble: 4,
  surface_habitable_immeuble: 340,
  type_batiment_dpe: "appartement",
  zone_climatique: "H2",
  code_departement: "75",
  periode_construction_dpe: "1975-1977",

  // Step 2 — Enveloppe
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

  // Step 3 — Systèmes
  type_energie_chauffage: "gaz",
  tarif_energie_eur_kwh: 0.1284,
  type_installation_chauffage: "collectif",
  type_generateur_chauffage: "chaudiere classique gaz",
  type_energie_ecs: "gaz",
  type_generateur_ecs: "chaudiere classique gaz",
  type_installation_ecs: "collectif",
  type_ventilation: "Ventilation naturelle",
  chauffage_solaire: "0",
  ecs_solaire: "0",

  // Step 4 — Détails
  traversant: "inconnu",
  presence_balcon: "1",
  classe_inertie: "lourde",
};

/* Champs par step */
export const STEP_FIELDS = {
  general: [
    { key: "type_batiment_dpe",     label: "Type de bâtiment",      type: "select", options: ["maison", "appartement", "immeuble"] },
    { key: "surface_habitable_logement", label: "Surface habitable (m²)", type: "number", min: 9, max: 500 },
    { key: "annee_construction_dpe", label: "Année de construction",   type: "number", min: 1800, max: 2026 },
    { key: "nombre_niveau_logement", label: "Nombre de niveaux",       type: "number", min: 1, max: 20 },
    { key: "zone_climatique",       label: "Zone climatique",          type: "select", options: ["H1", "H2", "H3"] },
    { key: "code_departement",      label: "Département",              type: "select", options: ["13","33","44","59","63","67","74","75"] },
    { key: "periode_construction_dpe", label: "Période de construction", type: "select", options: ["avant 1948","1948-1974","1975-1977","1978-1982","1983-1988","1989-2000","2001-2005","2006-2012","2013-2021","après 2021"] },
  ],
  enveloppe: [
    { key: "surface_mur_totale",    label: "Surface mur totale (m²)", type: "number", min: 0 },
    { key: "surface_mur_exterieur", label: "Surface mur extérieur (m²)", type: "number", min: 0 },
    { key: "surface_mur_deperditif", label: "Surface mur déperditif (m²)", type: "number", min: 0 },
    { key: "u_mur_exterieur",       label: "U mur extérieur (W/m²·K)", type: "number", min: 0, step: 0.01 },
    { key: "type_isolation_mur_exterieur", label: "Isolation des murs", type: "select", options: ["non isole","ITI","ITE","ITI+ITE"] },
    { key: "type_vitrage",          label: "Type de vitrage",          type: "select", options: ["simple vitrage","double vitrage","triple vitrage"] },
    { key: "u_baie_vitree",         label: "U baie vitrée (W/m²·K)",  type: "number", min: 0, step: 0.1 },
    { key: "surface_vitree_sud",    label: "Vitrage Sud (m²)",        type: "number", min: 0 },
    { key: "surface_vitree_nord",   label: "Vitrage Nord (m²)",       type: "number", min: 0 },
    { key: "surface_vitree_est",    label: "Vitrage Est (m²)",        type: "number", min: 0 },
    { key: "surface_vitree_ouest",  label: "Vitrage Ouest (m²)",      type: "number", min: 0 },
    { key: "surface_plancher_bas_totale", label: "Plancher bas (m²)",  type: "number", min: 0 },
    { key: "type_isolation_plancher_bas", label: "Isolation plancher bas", type: "select", options: ["non isole","isolé","inconnu"] },
    { key: "type_isolation_plancher_haut", label: "Isolation plancher haut", type: "select", options: ["non isole","isolé","inconnu"] },
    { key: "materiaux_structure_mur_exterieur", label: "Matériaux murs", type: "select", options: ["beton","pierre","brique","bois","inconnu"] },
  ],
  systemes: [
    { key: "type_energie_chauffage",       label: "Énergie de chauffage",      type: "select", options: ["gaz","electricite","fioul","bois","gpl","reseau","charbon"] },
    { key: "tarif_energie_eur_kwh",        label: "Tarif énergie (€/kWh)",      type: "number", min: 0.01, max: 5, step: 0.0001 },
    { key: "type_installation_chauffage",  label: "Installation chauffage",    type: "select", options: ["individuel","collectif"] },
    { key: "type_generateur_chauffage",    label: "Générateur chauffage",      type: "select", options: ["chaudiere classique gaz","chaudiere condensation gaz","chaudiere classique fioul","pac air/eau","pac air/air","radiateur electrique","poele bois","inconnu"] },
    { key: "type_energie_ecs",             label: "Énergie ECS",               type: "select", options: ["gaz","electricite","fioul","bois","inconnu"] },
    { key: "type_generateur_ecs",          label: "Générateur ECS",            type: "select", options: ["chaudiere classique gaz","ballon electrique","chauffe-eau thermodynamique","inconnu"] },
    { key: "type_installation_ecs",        label: "Installation ECS",          type: "select", options: ["individuel","collectif"] },
    { key: "type_ventilation",             label: "Ventilation",               type: "select", options: ["Ventilation naturelle","Ventilation mécanique auto réglable","Ventilation mécanique par insufflation","Ventilation mécanique hygroréglable","inconnu"] },
    { key: "chauffage_solaire",            label: "Chauffage solaire",         type: "select", options: ["0","1"] },
    { key: "ecs_solaire",                  label: "ECS solaire",               type: "select", options: ["0","1"] },
  ],
  details: [
    { key: "nombre_niveau_immeuble",     label: "Niveaux immeuble",       type: "number", min: 0 },
    { key: "surface_habitable_immeuble", label: "Surface immeuble (m²)",  type: "number", min: 0 },
    { key: "surface_plancher_bas_deperditif", label: "Plancher bas déperditif (m²)", type: "number", min: 0 },
    { key: "surface_plancher_haut_totale",   label: "Plancher haut total (m²)", type: "number", min: 0 },
    { key: "surface_plancher_haut_deperditif", label: "Plancher haut déperditif (m²)", type: "number", min: 0 },
    { key: "facteur_solaire_baie_vitree", label: "Facteur solaire vitrage", type: "number", min: 0, max: 1, step: 0.01 },
    { key: "type_materiaux_menuiserie",  label: "Menuiserie",             type: "select", options: ["bois","pvc","aluminium","mixte","inconnu"] },
    { key: "type_gaz_lame",             label: "Gaz lame vitrage",        type: "select", options: ["air","argon","inconnu"] },
    { key: "traversant",                label: "Logement traversant",     type: "select", options: ["oui","non","inconnu"] },
    { key: "presence_balcon",           label: "Présence balcon",         type: "select", options: ["0","1"] },
    { key: "classe_inertie",            label: "Classe d'inertie",        type: "select", options: ["légère","moyenne","lourde","très lourde","inconnu"] },
  ],
};
