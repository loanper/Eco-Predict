"""
EcoPredict v3 — API FastAPI.
Diagnostic énergétique + recommandations de travaux + agent LLM.
"""


from dotenv import load_dotenv
load_dotenv()

import os
from typing import Optional

import google.generativeai as genai
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
    periode_construction_dpe: str = Field("inconnu")
    chauffage_solaire: str = Field("0")
    ecs_solaire: str = Field("0")
    traversant: str = Field("inconnu")
    presence_balcon: str = Field("inconnu")
    classe_inertie: str = Field("inconnu")


class ChatRequest(BaseModel):
    home: HomeData
    message: str = Field(..., min_length=1, max_length=2000, description="Question de l'utilisateur")


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


@app.post("/predict")
def predict(home: HomeData):
    """Diagnostic complet + recommandations de travaux."""
    params = home.model_dump()
    conso, co2, cout = predict_cost(params)
    recommendations = get_improvement_recommendations(params)

    return {
        "diagnostic": {
            "consommation_kwh_m2_an": conso,
            "emission_co2_kg_m2_an": co2,
            "cout_annuel_euros": cout,
            "classe_dpe": classe_dpe(conso),
            "classe_ges": classe_ges(co2),
            "zone_climatique": params.get("zone_climatique"),
        },
        "recommandations": recommendations,
    }


@app.post("/chat")
async def chat(req: ChatRequest):
    """Conseiller IA en rénovation énergétique via Google Gemma 3."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY non configurée. Définissez la variable d'environnement.",
        )

    params = req.home.model_dump()
    recommendations = get_improvement_recommendations(params)
    context = build_llm_context(params, recommendations, top_n=3)

    aides = load_aides_context()
    system_prompt = (
        "Tu es un conseiller expert en rénovation énergétique pour des logements en France. "
        "Tu réponds en français, de manière pédagogue et structurée. "
        "Tu mentionnes les aides financières disponibles quand c'est pertinent. "
        "Tu adaptes tes conseils à la zone climatique du logement.\n\n"
    )
    if aides:
        system_prompt += f"AIDES FINANCIÈRES 2026 :\n{aides}\n\n"
    system_prompt += context

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name="gemma-3-27b-it")
        # Gemma ne supporte pas system_instruction : on l'injecte dans le prompt
        full_prompt = f"{system_prompt}\n\nQuestion de l'utilisateur : {req.message}"
        response = model.generate_content(full_prompt)
        # response.text lève ValueError si la réponse est bloquée
        answer = response.candidates[0].content.parts[0].text
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "response": answer,
        "context_used": context,
        "model": "gemma-3-27b-it",
    }
