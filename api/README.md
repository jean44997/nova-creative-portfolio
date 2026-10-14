# API FastAPI

Cette API valide les messages du portfolio et les transmet à un webhook configuré hors du dépôt.

    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    $env:CONTACT_DELIVERY_URL = "https://votre-webhook-securise.example/contact"
    uvicorn main:app --host 0.0.0.0 --port 8000

Endpoints :

- GET /api/health
- POST /api/contact

Avant le déploiement, définir MIENTHY_ALLOWED_ORIGINS et CONTACT_DELIVERY_URL dans l’environnement du fournisseur d’hébergement. Ne jamais placer de secret ou d’URL webhook privée dans Git.
