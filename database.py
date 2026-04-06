import json
import os
import uuid
import hashlib
from datetime import datetime

DATABASE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.json")

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def _init_db():
    if not os.path.exists(DATABASE_FILE):
        # Créer avec des utilisateurs par défaut
        default_users = [
            {
                "id": str(uuid.uuid4()),
                "nom": "Jean Dupont",
                "email": "jean@ecopredict.fr",
                "password_hash": _hash_password("eco2026"),
                "type_logement": "maison",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "nom": "Marie Laurent",
                "email": "marie@ecopredict.fr",
                "password_hash": _hash_password("eco2026"),
                "type_logement": "appartement",
                "created_at": datetime.now().isoformat()
            },
        ]
        with open(DATABASE_FILE, "w", encoding="utf-8") as f:
            json.dump({"users": default_users, "history": []}, f, indent=2, ensure_ascii=False)

def read_db():
    _init_db()
    with open(DATABASE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_db(data):
    with open(DATABASE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_users():
    db = read_db()
    # Ne pas retourner les password_hash
    return [{k: v for k, v in u.items() if k != "password_hash"} for u in db["users"]]

def login_user(email: str, password: str):
    """Vérifie email + mot de passe. Retourne le user (sans hash) ou None."""
    db = read_db()
    hashed = _hash_password(password)
    for u in db["users"]:
        if u.get("email", "").lower() == email.lower() and u.get("password_hash") == hashed:
            return {k: v for k, v in u.items() if k != "password_hash"}
    return None

def create_user(nom: str, email: str, password: str, type_logement: str):
    db = read_db()
    # Vérifier si l'email existe déjà
    for u in db["users"]:
        if u.get("email", "").lower() == email.lower():
            return None  # Email déjà pris
    new_user = {
        "id": str(uuid.uuid4()),
        "nom": nom,
        "email": email,
        "password_hash": _hash_password(password),
        "type_logement": type_logement,
        "created_at": datetime.now().isoformat()
    }
    db["users"].append(new_user)
    write_db(db)
    return {k: v for k, v in new_user.items() if k != "password_hash"}

def add_diagnostic_history(user_id: str, home_data: dict, diagnostic: dict, recommandations: list):
    db = read_db()
    if not any(u["id"] == user_id for u in db["users"]):
        return None
    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "timestamp": datetime.now().isoformat(),
        "homeData": home_data,
        "diagnostic": diagnostic,
        "recommandations": recommandations,
        "interpretation": None
    }
    db["history"].append(entry)
    write_db(db)
    return entry

def get_user_history(user_id: str):
    db = read_db()
    return [h for h in db["history"] if h["user_id"] == user_id]

def update_diagnostic_interpretation(history_id: str, interpretation: str):
    db = read_db()
    for entry in db["history"]:
        if entry["id"] == history_id:
            entry["interpretation"] = interpretation
            write_db(db)
            return entry
    return None

def get_history_entry(history_id: str):
    db = read_db()
    for entry in db["history"]:
        if entry["id"] == history_id:
            return entry
    return None

def delete_history_entry(history_id: str):
    db = read_db()
    initial_len = len(db["history"])
    db["history"] = [h for h in db["history"] if h["id"] != history_id]
    if len(db["history"]) < initial_len:
        write_db(db)
        return True
    return False
