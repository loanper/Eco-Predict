"""
EcoPredict v3 — API FastAPI.
Diagnostic énergétique + recommandations de travaux + agent LLM Claude.
"""

from dotenv import load_dotenv
load_dotenv()

import os
from typing import Optional

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from engine import (
    predict_cost,
    get_improvement_recommendations,
    build_llm_context,
    load_aides_context,
    classe_dpe,
    classe_ges,
    DEPT_TO_ZONE,
)
from database import (
    get_users, create_user, login_user, add_diagnostic_history,
    get_user_history, update_diagnostic_interpretation, get_history_entry,
)

app = FastAPI(
    title="EcoPredict v3 API",
    description="Diagnostic énergétique, recommandations de travaux et conseiller IA.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schéma Pydantic ─────────────────────────────────────────────────────


class HomeData(BaseModel):
    user_id: Optional[str] = Field(None, description="ID de l'utilisateur pour l'historique")
    
    # Obligatoires
    surface_habitable_logement: float = Field(..., gt=0, le=1000, description="Surface habitable en m²")
    annee_construction_dpe: int = Field(..., ge=1800, le=2026, description="Année de construction")

    # Localisation
    zone_climatique: str = Field("H2", description="Zone climatique : H1, H2 ou H3")
    code_departement: str = Field("75", description="Code département (ex: 75, 13, 59)")

    # Structure
    nombre_niveau_logement: int = Field(1, ge=1)
    nombre_niveau_immeuble: float = Field(0, ge=0)
    surface_habitable_immeuble: float = Field(0, ge=0)

    # Enveloppe thermique
    surface_mur_totale: float = Field(0, ge=0)
    surface_mur_exterieur: float = Field(0, ge=0)
    surface_mur_deperditif: float = Field(0, ge=0)
    u_mur_exterieur: float = Field(0, ge=0)
    surface_plancher_bas_totale: float = Field(0, ge=0)
    surface_plancher_bas_deperditif: float = Field(0, ge=0)
    surface_plancher_haut_totale: float = Field(0, ge=0)
    surface_plancher_haut_deperditif: float = Field(0, ge=0)
    u_baie_vitree: float = Field(0, ge=0)
    facteur_solaire_baie_vitree: float = Field(0, ge=0)

    # Vitrages
    surface_vitree_nord: float = Field(0, ge=0)
    surface_vitree_sud: float = Field(0, ge=0)
    surface_vitree_ouest: float = Field(0, ge=0)
    surface_vitree_est: float = Field(0, ge=0)

    # Catégorielles
    type_batiment_dpe: str = Field("maison")
    type_energie_chauffage: str = Field("gaz")
    type_installation_chauffage: str = Field("individuel")
    type_generateur_chauffage: str = Field("inconnu")
    type_energie_ecs: str = Field("inconnu")
    type_generateur_ecs: str = Field("inconnu")
    type_installation_ecs: str = Field("inconnu")
    type_isolation_mur_exterieur: str = Field("inconnu")
    type_isolation_plancher_bas: str = Field("inconnu")
    type_isolation_plancher_haut: str = Field("inconnu")
    materiaux_structure_mur_exterieur: str = Field("inconnu")
    type_vitrage: str = Field("double vitrage")
    type_materiaux_menuiserie: str = Field("inconnu")
    type_gaz_lame: str = Field("inconnu")
    type_ventilation: str = Field("inconnu")
    tarif_energie_eur_kwh: Optional[float] = Field(
        None,
        ge=0,
        le=5,
        description="Tarif personnalisé de l'énergie (€/kWh). Si absent, un tarif par défaut est appliqué selon l'énergie.",
    )
    periode_construction_dpe: str = Field("inconnu")
    chauffage_solaire: str = Field("0")
    ecs_solaire: str = Field("0")
    traversant: str = Field("inconnu")
    presence_balcon: str = Field("inconnu")
    classe_inertie: str = Field("inconnu")


class ChatRequest(BaseModel):
    home: HomeData
    message: str = Field(..., min_length=1, max_length=2000, description="Question de l'utilisateur")

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    nom: str
    email: str
    password: str
    type_logement: str = "maison"

class InterpretRequest(BaseModel):
    history_id: Optional[str] = None
    user_id: Optional[str] = None
    diagnostic: dict
    recommandations: list

class CompareInterpretRequest(BaseModel):
    diag_a: dict
    diag_b: dict
    recs_a: list
    recs_b: list
    home_a: dict = {}
    home_b: dict = {}


# ── Client Claude ────────────────────────────────────────────────────────

def _get_claude_client():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY non configurée. Définissez la variable d'environnement.",
        )
    return anthropic.Anthropic(api_key=api_key)


# ── Routes ───────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API EcoPredict v3 !",
        "documentation": "Rendez-vous sur /docs pour tester les prédictions."
    }

@app.get("/health")
def health():
    return {"status": "ok", "model": "EcoPredict v3"}


@app.get("/users")
def api_get_users():
    return get_users()

@app.post("/login")
def api_login(req: LoginRequest):
    user = login_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")
    return user

@app.post("/register")
def api_register(req: RegisterRequest):
    user = create_user(req.nom, req.email, req.password, req.type_logement)
    if not user:
        raise HTTPException(status_code=409, detail="Un compte avec cet email existe déjà.")
    return user

@app.get("/history/{user_id}")
def api_get_history(user_id: str):
    return get_user_history(user_id)

@app.get("/history/entry/{id}")
def api_get_history_entry(id: str):
    entry = get_history_entry(id)
    if not entry:
        raise HTTPException(status_code=404, detail="Diagnostic non trouvé.")
    return entry

@app.delete("/history/entry/{id}")
def api_delete_history_entry(id: str):
    success = delete_history_entry(id)
    if not success:
        raise HTTPException(status_code=404, detail="Diagnostic non trouvé.")
    return {"status": "success", "message": "Diagnostic supprimé."}


@app.post("/predict")
def predict(home: HomeData):
    """Diagnostic complet + recommandations de travaux."""
    params = home.model_dump()
    
    user_id = params.pop("user_id", None)
    
    conso, co2, cout = predict_cost(params)
    recommendations = get_improvement_recommendations(params)

    diagnostic = {
        "consommation_kwh_m2_an": conso,
        "emission_co2_kg_m2_an": co2,
        "cout_annuel_euros": cout,
        "classe_dpe": classe_dpe(conso),
        "classe_ges": classe_ges(co2),
        "zone_climatique": params.get("zone_climatique"),
    }
    
    history_entry = None
    if user_id:
        history_entry = add_diagnostic_history(user_id, params, diagnostic, recommendations)

    return {
        "diagnostic": diagnostic,
        "recommandations": recommendations,
        "history_id": history_entry["id"] if history_entry else None,
    }


@app.post("/interpret")
def interpret(req: InterpretRequest):
    """Interprétation complète du diagnostic par Claude."""
    
    # Si on a déjà une interprétation sauvegardée, la retourner
    if req.history_id:
        entry = get_history_entry(req.history_id)
        if entry and entry.get("interpretation"):
            return {"interpretation": entry["interpretation"], "cached": True}
    
    diag = req.diagnostic
    recs = req.recommandations
    
    # Construire le prompt
    context = f"""Voici le diagnostic énergétique d'un logement :

DIAGNOSTIC :
- Consommation : {diag.get('consommation_kwh_m2_an', 'N/A')} kWh/m²/an
- Classe DPE : {diag.get('classe_dpe', 'N/A')}
- Émissions CO2 : {diag.get('emission_co2_kg_m2_an', 'N/A')} kg CO₂/m²/an
- Classe GES : {diag.get('classe_ges', 'N/A')}
- Coût annuel estimé : {diag.get('cout_annuel_euros', 'N/A')} EUR/an

RECOMMANDATIONS DE TRAVAUX ({len(recs)} travaux identifiés) :
"""
    for i, r in enumerate(recs, 1):
        context += f"""
{i}. {r.get('nom', 'N/A')}
   - Coût : {r.get('cout_travaux_euros', 'N/A')} EUR
   - Économie annuelle : {r.get('economie_annuelle_euros', 'N/A')} EUR/an
   - ROI : {r.get('roi_annees', 'N/A')} ans
   - Nouvelle classe DPE : {r.get('nouvelle_classe_dpe', 'N/A')}
   - Réduction conso : -{r.get('reduction_conso_kwh_m2', 'N/A')} kWh/m²/an
"""

    system_prompt = (
        "Tu es un expert en rénovation énergétique pour des particuliers en France. "
        "On te donne un diagnostic DPE complet et des recommandations de travaux. "
        "Tu dois fournir une interprétation claire, pédagogique et actionnable.\n\n"
        "STRUCTURE DE TA REPONSE :\n"
        "1. Bilan général (2-3 phrases sur l'état du logement)\n"
        "2. Points critiques (les problèmes principaux identifiés)\n"
        "3. Plan d'action prioritaire (quels travaux faire en premier et pourquoi)\n"
        "4. Estimation du budget global et des économies attendues\n"
        "5. Aides financières potentielles (MaPrimeRénov', CEE, éco-PTZ)\n\n"
        "CONTRAINTES :\n"
        "- Maximum 400 mots\n"
        "- Langage clair et accessible, pas de jargon\n"
        "- Utilise des tirets pour les listes\n"
        "- N'utilise PAS de markdown : pas de **, pas de #, pas de listes avec *\n"
        "- Sois concret avec des chiffres\n"
    )

    try:
        client = _get_claude_client()
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            system=system_prompt,
            messages=[{"role": "user", "content": context}],
        )
        interpretation = message.content[0].text
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    
    # Sauvegarder dans l'historique si on a un history_id
    if req.history_id:
        update_diagnostic_interpretation(req.history_id, interpretation)
    
    return {"interpretation": interpretation, "cached": False}


@app.post("/compare-interpret")
def compare_interpret(req: CompareInterpretRequest):
    """Verdict IA comparatif entre deux diagnostics."""
    da = req.diag_a
    db = req.diag_b

    def _fmt_recs(recs):
        lines = []
        for i, r in enumerate(recs[:5], 1):
            lines.append(
                f"  {i}. {r.get('nom','?')} — Cout: {r.get('cout_travaux_euros','?')} EUR, "
                f"Economie: {r.get('economie_annuelle_euros','?')} EUR/an, "
                f"ROI: {r.get('roi_annees','?')} ans"
            )
        return '\n'.join(lines) if lines else '  Aucun travail recommande.'

    context = f"""Compare ces deux diagnostics energetiques de logements :

SCENARIO A :
- Classe DPE : {da.get('classe_dpe','?')}
- Consommation : {da.get('consommation_kwh_m2_an','?')} kWh/m2/an
- Emissions CO2 : {da.get('emission_co2_kg_m2_an','?')} kg CO2/m2/an
- Cout annuel : {da.get('cout_annuel_euros','?')} EUR/an
- Surface : {req.home_a.get('surface_habitable_logement','?')} m2
- Chauffage : {req.home_a.get('type_energie_chauffage','?')}
- Travaux recommandes :
{_fmt_recs(req.recs_a)}

SCENARIO B :
- Classe DPE : {db.get('classe_dpe','?')}
- Consommation : {db.get('consommation_kwh_m2_an','?')} kWh/m2/an
- Emissions CO2 : {db.get('emission_co2_kg_m2_an','?')} kg CO2/m2/an
- Cout annuel : {db.get('cout_annuel_euros','?')} EUR/an
- Surface : {req.home_b.get('surface_habitable_logement','?')} m2
- Chauffage : {req.home_b.get('type_energie_chauffage','?')}
- Travaux recommandes :
{_fmt_recs(req.recs_b)}
"""

    system_prompt = (
        "Tu es un expert en renovation energetique en France. "
        "On te donne deux diagnostics energetiques de logements (Scenario A et Scenario B). "
        "Tu dois fournir un verdict comparatif clair et actionnable.\n\n"
        "STRUCTURE DE TA REPONSE :\n"
        "1. Verdict general (1-2 phrases : quel scenario est le meilleur et pourquoi)\n"
        "2. Avantages du Scenario A (2-3 puces)\n"
        "3. Avantages du Scenario B (2-3 puces)\n"
        "4. Conseil strategique (1-2 phrases : que faire concretement)\n\n"
        "CONTRAINTES :\n"
        "- Maximum 200 mots\n"
        "- Langage clair, pas de jargon technique\n"
        "- N'utilise PAS de markdown : pas de **, pas de #, pas de listes avec *\n"
        "- Utilise des tirets pour les listes\n"
        "- Sois concret avec des chiffres\n"
    )

    try:
        client = _get_claude_client()
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system_prompt,
            messages=[{"role": "user", "content": context}],
        )
        verdict = message.content[0].text
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {"verdict": verdict}


@app.post("/chat")
async def chat(req: ChatRequest):
    """Conseiller IA en rénovation énergétique via Claude."""
    params = req.home.model_dump()
    params.pop("user_id", None)
    
    recommendations = get_improvement_recommendations(params)

    q = req.message.lower().strip()
    focused_keywords = (
        "eco-ptz", "éco-ptz", "ptz", "maprimerenov", "ma prime renov", "cee", "tva",
        "aide", "financement", "subvention", "definition", "définition", "c'est quoi", "c est quoi",
    )
    is_focused_question = any(k in q for k in focused_keywords)

    if is_focused_question:
        context = (
            "=== CONTEXTE MINIMAL ===\n"
            f"Type logement: {params.get('type_batiment_dpe', 'N/A')}\n"
            f"Surface: {params.get('surface_habitable_logement', 'N/A')} m²\n"
            f"Energie chauffage: {params.get('type_energie_chauffage', 'N/A')}\n"
            "La question utilisateur est ciblée: répondre uniquement à cette question, sans refaire tout le diagnostic.\n"
        )
    else:
        context = build_llm_context(params, recommendations, top_n=2)

    aides = load_aides_context()
    system_prompt = (
        "Tu es un conseiller renovation energetique pour des particuliers en France. "
        "Objectif prioritaire: expliquer simplement la facture annuelle et la rentabilite des travaux. "
        "Reponds en francais clair, concret et court.\n\n"
        "REGLE CLE: repond d'abord a la question precise de l'utilisateur.\n"
        "Ne refais pas un recap complet du diagnostic sauf si l'utilisateur le demande explicitement.\n\n"
        "FORMAT CONSEILLE:\n"
        "- Si question generale: Resume express + 2 a 3 puces d'actions.\n"
        "- Si question ciblee (ex: eco-PTZ): definition courte + conditions + 1 action pratique.\n\n"
        "CONTRAINTES:\n"
        "- Maximum 110 mots, sauf demande explicite de details.\n"
        "- N'invente jamais de montant/aide non present dans le contexte.\n"
        "- Si une info est incertaine, ecris 'A confirmer'.\n"
        "- Pas de long paragraphe, prefere des puces courtes.\n"
        "- N'utilise PAS de markdown: pas de **, pas de #, pas de listes avec *.\n"
    )
    if aides:
        system_prompt += f"AIDES FINANCIERES 2026 (extrait):\n{aides[:2500]}\n\n"
    system_prompt += context

    try:
        client = _get_claude_client()
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            system=system_prompt,
            messages=[{"role": "user", "content": req.message}],
        )
        answer = message.content[0].text
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "response": answer,
        "model": "ecopredict-ai",
    }
