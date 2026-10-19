"""API FastAPI du portfolio MienthyKaya.

GitHub Pages ne peut servir que le front statique. Cette API est prête à être
déployée séparément sur Render, puis connectée au formulaire du portfolio.
"""

from __future__ import annotations

import os
import re
import time
from collections import defaultdict, deque
from threading import Lock
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator


DEFAULT_ORIGINS = (
    "https://jean44997.github.io,"
    "https://mienthykaya.dev,"
    "https://www.mienthykaya.dev,"
    "http://localhost:5173"
)
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
CONTACT_RATE_LIMIT = 3
CONTACT_RATE_WINDOW_SECONDS = 60 * 60
contact_attempts: dict[str, deque[float]] = defaultdict(deque)
contact_attempts_lock = Lock()

app = FastAPI(
    title="MienthyKaya Portfolio API",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("MIENTHY_ALLOWED_ORIGINS", DEFAULT_ORIGINS).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class ContactMessage(BaseModel):
    """Payload accepted from the contact form."""

    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=254)
    message: str = Field(min_length=10, max_length=5000)

    @field_validator("name", "message")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Ce champ est obligatoire.")
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not EMAIL_PATTERN.fullmatch(cleaned):
            raise ValueError("Adresse e-mail invalide.")
        return cleaned


@app.get("/api/health")
def health() -> dict[str, str]:
    """Endpoint de supervision sans données sensibles."""

    return {"status": "ok", "service": "mienthykaya-portfolio-api"}


def enforce_contact_rate_limit(request: Request, email: str) -> None:
    """Limit contacts to three delivery attempts per IP and email per hour."""

    client_host = request.client.host if request.client else "unknown"
    key = f"{client_host}:{email}"
    now = time.monotonic()
    with contact_attempts_lock:
        attempts = contact_attempts[key]
        while attempts and now - attempts[0] >= CONTACT_RATE_WINDOW_SECONDS:
            attempts.popleft()
        if len(attempts) >= CONTACT_RATE_LIMIT:
            retry_after = int(CONTACT_RATE_WINDOW_SECONDS - (now - attempts[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Limite atteinte. Réessaie plus tard.",
                headers={"Retry-After": str(retry_after)},
            )
        attempts.append(now)


@app.post("/api/contact", status_code=status.HTTP_202_ACCEPTED)
def contact(message: ContactMessage, request: Request) -> dict[str, Any]:
    """Valide un message.

    Le fournisseur de livraison n’est jamais stocké dans le dépôt public.
    Définir CONTACT_DELIVERY_URL dans l’environnement de production avec une
    URL webhook sûre qui accepte le JSON du message.
    """

    delivery_url = os.getenv("CONTACT_DELIVERY_URL")
    if not delivery_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La livraison des messages n’est pas encore configurée.",
        )

    enforce_contact_rate_limit(request, message.email)

    try:
        response = httpx.post(
            delivery_url,
            json=message.model_dump(),
            timeout=httpx.Timeout(5.0, connect=2.0),
        )
        response.raise_for_status()
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Le service de livraison est indisponible.",
        ) from error

    return {
        "accepted": True,
        "recipient": "mienthykaya@gmail.com",
        "message_length": len(message.message),
    }
