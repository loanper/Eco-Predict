"""
EcoPredict v3 — Moteur de calcul & simulation de travaux.
Chargé par le serveur FastAPI depuis le pipeline .joblib.
"""

import os
import joblib
import numpy as np
import pandas as pd

# ── Constantes features (identiques au notebook) ────────────────────────

FEATURES_NUM_RAW = [
    "surface_habitable_logement", "annee_construction_dpe",
    "nombre_niveau_logement", "nombre_niveau_immeuble",
    "surface_habitable_immeuble",
]

FEATURES_NUM_ENVELOPE = [
    "surface_mur_totale", "surface_mur_exterieur", "surface_mur_deperditif",
    "u_mur_exterieur", "surface_plancher_bas_totale",
    "surface_plancher_bas_deperditif", "surface_plancher_haut_totale",
    "surface_plancher_haut_deperditif", "u_baie_vitree",
    "facteur_solaire_baie_vitree",
]

FEATURES_NUM_VITRAGE = [
    "surface_vitree_nord", "surface_vitree_sud",
    "surface_vitree_ouest", "surface_vitree_est",
]

FEATURES_NUM_ALL = FEATURES_NUM_RAW + FEATURES_NUM_ENVELOPE + FEATURES_NUM_VITRAGE

FEATURES_ENGINEERED = [
    "is_rt2012", "age_batiment", "surface_vitree_totale",
    "ratio_vitrage", "ratio_mur_deperditif", "surface_par_niveau", "compacite",
]

FEATURES_NUM = FEATURES_NUM_ALL + FEATURES_ENGINEERED

FEATURES_CAT_BASE = [
    "type_batiment_dpe", "type_energie_chauffage",
    "type_installation_chauffage", "type_generateur_chauffage",
    "type_energie_ecs", "type_generateur_ecs", "type_installation_ecs",
    "type_isolation_mur_exterieur", "type_isolation_plancher_bas",
    "type_isolation_plancher_haut", "materiaux_structure_mur_exterieur",
    "type_vitrage", "type_materiaux_menuiserie", "type_gaz_lame",
    "type_ventilation", "periode_construction_dpe",
    "chauffage_solaire", "ecs_solaire", "traversant",
    "presence_balcon", "classe_inertie",
]

FEATURES_CAT = FEATURES_CAT_BASE + ["zone_climatique", "code_departement"]

ALL_FEATURES = FEATURES_NUM + FEATURES_CAT

DEPT_TO_ZONE = {
    "59": "H1", "67": "H1", "74": "H1",
    "44": "H2", "33": "H2", "75": "H2", "63": "H2",
    "13": "H3",
}

# ── Tarifs énergie résidentiels (France, estimations récentes) ─────────

TARIFS_ENERGIE = {
    "electricite": 0.2516, "gaz": 0.121, "fioul": 0.124,
    "bois": 0.085, "charbon": 0.11, "gpl": 0.182, "reseau": 0.11,
}
TARIF_DEFAULT = 0.15


def get_tarif(e: str, tarif_personnalise: float | None = None) -> float:
    if tarif_personnalise is not None:
        try:
            t = float(tarif_personnalise)
            if t > 0:
                return t
        except (TypeError, ValueError):
            pass
    if not e or str(e).lower() in ("nan", "inconnu", ""):
        return TARIF_DEFAULT
    e_low = str(e).lower().strip()
    for key, t in TARIFS_ENERGIE.items():
        if key in e_low:
            return t
    return TARIF_DEFAULT


def coef_ep_ef(e: str) -> float:
    if not e:
        return 1.0
    return 1 / 2.3 if "electri" in str(e).lower() else 1.0


# ── Classification DPE / GES ────────────────────────────────────────────

def classe_dpe(c: float) -> str:
    if c <= 50: return "A"
    if c <= 90: return "B"
    if c <= 150: return "C"
    if c <= 230: return "D"
    if c <= 330: return "E"
    if c <= 450: return "F"
    return "G"


def classe_ges(g: float) -> str:
    if g <= 5: return "A"
    if g <= 10: return "B"
    if g <= 20: return "C"
    if g <= 35: return "D"
    if g <= 55: return "E"
    if g <= 80: return "F"
    return "G"


# ── Chargement pipeline ─────────────────────────────────────────────────

_MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(_MODEL_DIR, "ecopredict_v3_pipeline.joblib")
pipeline = joblib.load(_MODEL_PATH)


# ── Catalogue de travaux ────────────────────────────────────────────────

def _cond_mur_non_isole(row: dict) -> bool:
    return str(row.get("type_isolation_mur_exterieur", "")).lower() in (
        "non isole", "non isolé", "inconnu", ""
    )

def _cond_mur_non_ite(row: dict) -> bool:
    return str(row.get("type_isolation_mur_exterieur", "")).lower() in (
        "non isole", "non isolé", "inconnu", "iti", ""
    )

def _cond_simple_vitrage(row: dict) -> bool:
    return "simple" in str(row.get("type_vitrage", "")).lower()

def _cond_pas_triple(row: dict) -> bool:
    return "triple" not in str(row.get("type_vitrage", "")).lower()

def _cond_plancher_bas(row: dict) -> bool:
    return str(row.get("type_isolation_plancher_bas", "")).lower() in (
        "non isole", "non isolé", "inconnu", ""
    )

def _cond_plancher_haut(row: dict) -> bool:
    return str(row.get("type_isolation_plancher_haut", "")).lower() in (
        "non isole", "non isolé", "inconnu", ""
    )

def _cond_pas_pac(row: dict) -> bool:
    return "pac" not in str(row.get("type_generateur_chauffage", "")).lower()

def _cond_pas_vmc_df(row: dict) -> bool:
    v = str(row.get("type_ventilation", "")).lower()
    return "double" not in v and "insufflation" not in v

def _cond_pas_thermo(row: dict) -> bool:
    return "thermodynamique" not in str(row.get("type_generateur_ecs", "")).lower()


TRAVAUX = [
    {
        "id": "isolation_murs_iti",
        "nom": "Isolation des murs par l'intérieur (ITI)",
        "modifications": {"type_isolation_mur_exterieur": "ITI", "u_mur_exterieur": 0.27},
        "cout_unitaire": 100, "surface_key": "surface_mur_exterieur",
        "cout_fixe": None, "condition": _cond_mur_non_isole,
    },
    {
        "id": "isolation_murs_ite",
        "nom": "Isolation des murs par l'extérieur (ITE)",
        "modifications": {"type_isolation_mur_exterieur": "ITE", "u_mur_exterieur": 0.22},
        "cout_unitaire": 180, "surface_key": "surface_mur_exterieur",
        "cout_fixe": None, "condition": _cond_mur_non_ite,
    },
    {
        "id": "double_vitrage",
        "nom": "Remplacement par du double vitrage",
        "modifications": {"type_vitrage": "double vitrage", "u_baie_vitree": 1.8, "type_gaz_lame": "air"},
        "cout_unitaire": 150, "surface_key": "surface_vitree_totale",
        "cout_fixe": None, "condition": _cond_simple_vitrage,
    },
    {
        "id": "triple_vitrage",
        "nom": "Remplacement par du triple vitrage",
        "modifications": {"type_vitrage": "triple vitrage", "u_baie_vitree": 0.8, "type_gaz_lame": "argon"},
        "cout_unitaire": 350, "surface_key": "surface_vitree_totale",
        "cout_fixe": None, "condition": _cond_pas_triple,
    },
    {
        "id": "isolation_plancher_bas",
        "nom": "Isolation du plancher bas",
        "modifications": {"type_isolation_plancher_bas": "isolé"},
        "cout_unitaire": 40, "surface_key": "surface_plancher_bas_totale",
        "cout_fixe": None, "condition": _cond_plancher_bas,
    },
    {
        "id": "isolation_plancher_haut",
        "nom": "Isolation des combles / plancher haut",
        "modifications": {"type_isolation_plancher_haut": "isolé"},
        "cout_unitaire": 30, "surface_key": "surface_plancher_haut_totale",
        "cout_fixe": None, "condition": _cond_plancher_haut,
    },
    {
        "id": "pac_air_eau",
        "nom": "Remplacement chauffage → PAC air/eau",
        "modifications": {
            "type_energie_chauffage": "electricite",
            "type_generateur_chauffage": "pac air/eau",
            "type_installation_chauffage": "individuel",
        },
        "cout_unitaire": None, "surface_key": None,
        "cout_fixe": 12000, "condition": _cond_pas_pac,
    },
    {
        "id": "vmc_double_flux",
        "nom": "Installation VMC double flux",
        "modifications": {"type_ventilation": "Ventilation mécanique par insufflation"},
        "cout_unitaire": None, "surface_key": None,
        "cout_fixe": 6000, "condition": _cond_pas_vmc_df,
    },
    {
        "id": "ecs_thermo",
        "nom": "Chauffe-eau thermodynamique (ECS)",
        "modifications": {
            "type_energie_ecs": "electricite",
            "type_generateur_ecs": "chauffe-eau thermodynamique",
        },
        "cout_unitaire": None, "surface_key": None,
        "cout_fixe": 2500, "condition": _cond_pas_thermo,
    },
]


# ── Fonctions internes ──────────────────────────────────────────────────

def _build_input_df(params: dict) -> pd.DataFrame:
    surface = params.get("surface_habitable_logement", 80)
    annee = params.get("annee_construction_dpe", 1990)
    nb_niv = params.get("nombre_niveau_logement", 1)
    svn = params.get("surface_vitree_nord", 0)
    svs = params.get("surface_vitree_sud", 0)
    svo = params.get("surface_vitree_ouest", 0)
    sve = params.get("surface_vitree_est", 0)
    svt = svn + svs + svo + sve
    s_mur_tot = params.get("surface_mur_totale", 0)
    s_mur_ext = params.get("surface_mur_exterieur", 0)
    s_mur_dep = params.get("surface_mur_deperditif", 0)

    row = {}
    for f in FEATURES_NUM_RAW + FEATURES_NUM_ENVELOPE + FEATURES_NUM_VITRAGE:
        row[f] = params.get(f, 0)
    row["is_rt2012"] = 1 if annee >= 2013 else 0
    row["age_batiment"] = 2026 - annee
    row["surface_vitree_totale"] = svt
    row["ratio_vitrage"] = round(svt / max(surface, 1), 4)
    row["ratio_mur_deperditif"] = round(s_mur_dep / max(s_mur_tot, 1), 4) if s_mur_tot > 0 else 0
    row["surface_par_niveau"] = round(surface / max(nb_niv, 1), 2)
    row["compacite"] = round(s_mur_ext / max(surface, 1), 4) if s_mur_ext > 0 else 0
    for f in FEATURES_CAT:
        row[f] = str(params.get(f, "inconnu"))
    return pd.DataFrame([row])


def predict_cost(params: dict) -> tuple[float, float, float]:
    """Retourne (conso_kwh_m2, co2_kg_m2, cout_annuel_€)."""
    input_df = _build_input_df(params)
    pred = pipeline.predict(input_df)[0]
    conso = float(pred[0])
    co2 = float(pred[1])
    surface = params.get("surface_habitable_logement", 80)
    energie = params.get("type_energie_chauffage", "inconnu")
    tarif = get_tarif(energie, params.get("tarif_energie_eur_kwh"))
    coef = coef_ep_ef(energie)
    cout = conso * coef * surface * tarif
    return round(conso, 1), round(co2, 1), round(cout, 2)


# ── Recommandations ─────────────────────────────────────────────────────

def get_improvement_recommendations(input_data: dict) -> list[dict]:
    """
    Simule chaque travaux éligible, prédit la nouvelle consommation,
    calcule l'économie annuelle et le ROI. Retourne une liste triée
    par ROI croissant (meilleur en premier).
    """
    conso_actuelle, co2_actuel, cout_actuel = predict_cost(input_data)
    surface = input_data.get("surface_habitable_logement", 80)

    recommendations = []

    for travail in TRAVAUX:
        if not travail["condition"](input_data):
            continue

        simulated = input_data.copy()
        for key, val in travail["modifications"].items():
            simulated[key] = val

        new_conso, new_co2, new_cout = predict_cost(simulated)
        economie_annuelle = cout_actuel - new_cout
        reduction_conso = conso_actuelle - new_conso
        reduction_co2 = co2_actuel - new_co2

        if economie_annuelle <= 0:
            continue

        if travail["cout_fixe"]:
            cout_travaux = travail["cout_fixe"]
        else:
            surface_concernee = input_data.get(travail["surface_key"], 0)
            if surface_concernee <= 0:
                surface_concernee = surface * 0.5
            cout_travaux = travail["cout_unitaire"] * surface_concernee

        roi_annees = round(cout_travaux / economie_annuelle, 1) if economie_annuelle > 0 else 999

        recommendations.append({
            "id": travail["id"],
            "nom": travail["nom"],
            "cout_travaux_euros": round(cout_travaux),
            "economie_annuelle_euros": round(economie_annuelle),
            "roi_annees": roi_annees,
            "nouvelle_conso_kwh_m2": new_conso,
            "nouvelle_classe_dpe": classe_dpe(new_conso),
            "reduction_conso_kwh_m2": round(reduction_conso, 1),
            "reduction_co2_kg_m2": round(reduction_co2, 1),
            "nouveau_cout_annuel": new_cout,
        })

    recommendations.sort(key=lambda r: r["roi_annees"])
    return recommendations


# ── Contexte LLM ────────────────────────────────────────────────────────

def build_llm_context(input_data: dict, recommendations: list[dict], top_n: int = 3) -> str:
    """
    Génère un Context String structuré pour un LLM incluant
    le diagnostic du logement et les meilleures recommandations.
    """
    conso, co2, cout = predict_cost(input_data)
    top_recs = recommendations[:top_n]

    surface = input_data.get("surface_habitable_logement", "N/A")
    annee = input_data.get("annee_construction_dpe", "N/A")
    zone = input_data.get("zone_climatique", "N/A")
    dept = input_data.get("code_departement", "N/A")
    energie = input_data.get("type_energie_chauffage", "N/A")
    batiment = input_data.get("type_batiment_dpe", "N/A")
    vitrage = input_data.get("type_vitrage", "N/A")
    isolation_mur = input_data.get("type_isolation_mur_exterieur", "N/A")
    ventilation = input_data.get("type_ventilation", "N/A")

    ctx = f"""=== CONTEXTE LOGEMENT — EcoPredict v3 ===

CARACTÉRISTIQUES DU LOGEMENT :
- Type : {batiment}
- Surface habitable : {surface} m²
- Année de construction : {annee}
- Zone climatique : {zone} (département {dept})
- Énergie de chauffage : {energie}
- Type de vitrage : {vitrage}
- Isolation des murs : {isolation_mur}
- Ventilation : {ventilation}

DIAGNOSTIC ÉNERGÉTIQUE ACTUEL (prédiction EcoPredict) :
- Consommation : {conso} kWh/m²/an → Classe DPE : {classe_dpe(conso)}
- Émissions CO₂ : {co2} kg CO₂/m²/an → Classe GES : {classe_ges(co2)}
- Coût annuel estimé : {cout} €/an
"""

    if top_recs:
        ctx += f"\nTOP {len(top_recs)} RECOMMANDATIONS DE TRAVAUX (triées par ROI) :\n"
        for i, rec in enumerate(top_recs, 1):
            ctx += f"""
{i}. {rec['nom']}
   - Coût estimé des travaux : {rec['cout_travaux_euros']:,} €
   - Économie annuelle : {rec['economie_annuelle_euros']:,} €/an
   - Retour sur investissement : {rec['roi_annees']} ans
   - Nouvelle consommation : {rec['nouvelle_conso_kwh_m2']} kWh/m²/an (−{rec['reduction_conso_kwh_m2']} kWh/m²/an)
   - Nouvelle classe DPE : {rec['nouvelle_classe_dpe']}
   - Réduction CO₂ : −{rec['reduction_co2_kg_m2']} kg CO₂/m²/an
"""
        economie_totale = sum(r["economie_annuelle_euros"] for r in top_recs)
        cout_total = sum(r["cout_travaux_euros"] for r in top_recs)
        ctx += f"""
SYNTHÈSE SI TOUS LES TRAVAUX RECOMMANDÉS SONT RÉALISÉS :
- Investissement total estimé : {cout_total:,} €
- Économie annuelle cumulée : {economie_totale:,} €/an
"""
    else:
        ctx += "\nAucune recommandation de travaux majeure identifiée. Le logement est déjà performant.\n"

    return ctx


# ── RAG : chargement aides financières ──────────────────────────────────

def load_aides_context(filepath: str = "aides_financieres.txt") -> str:
    path = os.path.join(_MODEL_DIR, filepath)
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return f.read()
    return ""
