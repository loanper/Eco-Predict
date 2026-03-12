# 🏠 EcoPredict — Prédiction Énergétique des Logements

**EcoPredict** est un modèle de Machine Learning qui prédit la **consommation énergétique**, les **émissions de CO₂** et le **coût annuel estimé** d'un logement à partir de ses caractéristiques techniques (DPE), en intégrant les **zones climatiques françaises**.

## 📊 Modèle v3 — Multi-Départemental

- **8 départements** : 13, 33, 44, 59, 63, 67, 74, 75 (~3.5M lignes)
- **3 zones climatiques** : H1 (Froid), H2 (Tempéré), H3 (Méditerranéen)
- **Évaluation géographique** : métriques R²/MAE par zone et par département

## 🛠️ Stack technique

- **Modèle** : XGBoost (MultiOutput) optimisé par Optuna (GPU CUDA)
- **Features** : 49 variables (19 numériques brutes + 7 engineered + 23 catégorielles dont zone_climatique + code_departement)
- **Nettoyage** : IQR outlier removal + filtres de cohérence thermique
- **Coût** : Tarifs énergie réels 2025 (élec: 0.2516 €/kWh, gaz: 0.1284, fioul: 0.119, bois: 0.07)
- **Export** : Pipeline complet en `.joblib` pour backend FastAPI

## 📁 Structure

```
├── eda.ipynb                      # EDA mono-département (v2)
├── model_multi_dep.ipynb          # Modélisation multi-départementale (v3)
├── ecopredict_v3_pipeline.joblib  # Pipeline exporté (non versionné)
├── dpe_logement_XX.csv            # Datasets DPE par département (non versionnés)
├── .gitignore
└── README.md
```

## 🚀 Utilisation

### Prérequis

```bash
pip install xgboost scikit-learn pandas matplotlib seaborn optuna joblib
```

> **GPU** : nécessite CUDA pour l'entraînement (~3-5 min sur RTX 3060 Ti).

### Exécuter

1. Placer les fichiers `dpe_logement_XX.csv` à la racine (source : [data.ademe.fr](https://data.ademe.fr/datasets/dpe-v2-logements-existants))
2. Ouvrir `model_multi_dep.ipynb` et exécuter toutes les cellules
3. Utiliser `predict_energy()` avec le paramètre `zone_climatique`

### Exemple

```python
result = predict_energy(
    65, 1965,
    zone_climatique="H1", code_departement="59",
    type_batiment="appartement",
    type_energie_chauffage="gaz",
    type_isolation_mur="non isole",
)
# → Consommation : ~168 kWh/m²/an | Classe D | Zone H1
```

### Charger le modèle exporté (FastAPI)

```python
import joblib
pipeline = joblib.load("ecopredict_v3_pipeline.joblib")
predictions = pipeline.predict(df_input)
```

## 📋 Dataset

Le modèle s'appuie sur le **DPE (Diagnostic de Performance Énergétique)** des logements existants, disponible en open data sur l'ADEME. Les fichiers CSV (~3.5M lignes au total) ne sont pas inclus dans le repo.

## 👤 Auteur

**Loan Perrache** — Projet PPE ING4 (ECE Paris)
