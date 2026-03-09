# 🏠 EcoPredict — Prédiction Énergétique des Logements

**EcoPredict** est un modèle de Machine Learning qui prédit la **consommation énergétique**, les **émissions de CO₂** et le **coût annuel estimé** d'un logement à partir de ses caractéristiques techniques (DPE).

## 📊 Performances

| Cible | R² | MAE | RMSE |
|---|---|---|---|
| Consommation (kWh/m²/an) | 0.78 | 29.6 | 44.9 |
| Émissions CO₂ (kg/m²/an) | 0.82 | 4.5 | 7.5 |
| Coût annuel (€) | 0.83 | 320.8 | 527.9 |

## 🛠️ Stack technique

- **Modèle** : XGBoost (MultiOutput) optimisé par Optuna (GPU CUDA)
- **Features** : 47 variables (19 numériques brutes + 7 engineered + 21 catégorielles)
- **Nettoyage** : IQR outlier removal + filtres de cohérence thermique
- **Coût** : Tarifs énergie réels 2025 (élec: 0.2516 €/kWh, gaz: 0.1284, fioul: 0.119, bois: 0.07)

## 📁 Structure

```
├── eda.ipynb              # Notebook complet (EDA + entraînement + prédiction)
├── dpe_logement.csv       # Dataset DPE (non versionné, ~113 Mo)
├── .gitignore
└── README.md
```

## 🚀 Utilisation

### Prérequis

```bash
pip install xgboost scikit-learn pandas matplotlib seaborn optuna
```

> **GPU** : nécessite CUDA pour l'entraînement rapide (~2 min sur RTX 3060 Ti).

### Exécuter

1. Placer `dpe_logement.csv` à la racine du projet (source : [data.ademe.fr](https://data.ademe.fr/datasets/dpe-v2-logements-existants))
2. Ouvrir `eda.ipynb` et exécuter toutes les cellules
3. Utiliser la fonction `predict_energy()` pour des prédictions personnalisées

### Exemple

```python
result = predict_energy(
    surface=65, annee=1965,
    type_batiment="appartement",
    type_energie_chauffage="gaz",
    type_installation_chauffage="collectif",
    type_isolation_mur="non isole",
    type_vitrage="simple vitrage",
)
# → Consommation : 168.1 kWh/m²/an | Classe D
```

## 📋 Dataset

Le modèle s'appuie sur le **DPE (Diagnostic de Performance Énergétique)** des logements existants, disponible en open data sur l'ADEME. Le fichier CSV (~146k lignes, 105 colonnes) n'est pas inclus dans le repo.

## 👤 Auteur

**Loan Perrache** — Projet PPE ING4 (ECE Paris)
