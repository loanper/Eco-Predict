# EcoPredict v3

Application full-stack de diagnostic energetique:
- prediction de consommation (kWh/m2/an)
- prediction d'emissions CO2 (kg/m2/an)
- estimation du cout annuel
- recommandations de travaux avec ROI
- chat IA (Gemma) contextuel au logement

## Architecture

Le projet est compose de trois couches:

1. Modele/Notebook
- `eda.ipynb`: exploration initiale mono-departement
- `model_multi_dep.ipynb`: entrainement multi-departements (v3)
- sortie attendue: `ecopredict_v3_pipeline.joblib`

2. Backend API (FastAPI)
- `main.py`: routes API (`/health`, `/predict`, `/chat`)
- `engine.py`: logique metier (features, prediction, simulation travaux, contexte LLM)
- `aides_financieres.txt`: base de contexte pour les aides

3. Frontend (React + Vite + Tailwind)
- dossier `frontend/`
- formulaire multi-etapes, dashboard, recommandations, widget chat
- proxy Vite `"/api" -> "http://127.0.0.1:8000"`

## Arborescence utile

```text
.
├── main.py
├── engine.py
├── requirements.txt
├── aides_financieres.txt
├── model_multi_dep.ipynb
├── eda.ipynb
├── ecopredict_v3_pipeline.joblib
├── dpe_logement_13.csv ... dpe_logement_75.csv
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api.js
    │   ├── constants.js
    │   └── components/
```

## Prerequis

- Python 3.11+ (ou environnement conda)
- Node.js + npm
- Cle API Gemini dans `.env`

Exemple `.env`:

```env
GEMINI_API_KEY=xxxxxxxxxxxxxxxx
```

## Installation

### 1) Backend

```bash
python -m pip install -r requirements.txt
```

### 2) Frontend

```bash
cd frontend
npm install
```

## Lancement en local

Ouvrir deux terminaux.

### Terminal A (backend, a la racine du projet)

```bash
uvicorn main:app --reload
```

API disponible sur `http://127.0.0.1:8000`

### Terminal B (frontend)

```bash
cd frontend
npm run dev
```

App disponible sur `http://localhost:5173`

## Build frontend

```bash
cd frontend
npm run build
npm run preview
```

## Endpoints API

- `GET /health` -> statut service
- `POST /predict` -> diagnostic + recommandations
- `POST /chat` -> reponse IA contextualisee

## Tarifs energie: comportement

- La prediction ML (`conso`, `co2`) ne depend pas du prix de l'energie.
- Le prix n'est utilise que pour convertir la conso en `cout_annuel_euros`.
- Tu peux fournir `tarif_energie_eur_kwh` dans l'input API/frontend pour personnaliser le cout.
- Si ce champ est absent, un tarif par defaut est applique selon `type_energie_chauffage`.

## Regeneration du modele (objectif a terme)

Etat actuel:
- l'application utilise prioritairement le fichier `ecopredict_v3_pipeline.joblib` existant
- la regeneration du modele via notebook n'est pas obligatoire pour lancer l'app

Pour regenerer plus tard:
1. placer les CSV DPE a la racine
2. ouvrir `model_multi_dep.ipynb`
3. executer les cellules d'entrainement/export
4. verifier la mise a jour de `ecopredict_v3_pipeline.joblib`

## Notes importantes

- Le chat IA est une fonctionnalite obligatoire du projet.
- Sans `GEMINI_API_KEY`, `/chat` renvoie une erreur 503.
- Le backend charge le `.joblib` au demarrage; si le fichier manque, l'API ne demarre pas.
- Le notebook `model_multi_dep.ipynb` contenait des marqueurs de conflit Git et a ete nettoye.

## Depannage rapide

Si `npm` n'est pas reconnu:
- verifier que Node/npm est installe et accessible dans le terminal courant

Si `uvicorn main:app --reload` echoue avec `Could not import module "main"`:
- verifier que la commande est lancee depuis la racine du projet (pas depuis `frontend/`)

## Auteur

Projet PPE ING4 - ECE Paris
