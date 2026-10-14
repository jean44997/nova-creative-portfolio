-- Schéma PostgreSQL optionnel pour archiver les demandes de contact.
-- À utiliser uniquement avec un backend authentifié et une politique de rétention.
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_name VARCHAR(100) NOT NULL,
  sender_email VARCHAR(254) NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 10 AND 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
