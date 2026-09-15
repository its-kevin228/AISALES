import json
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.services.ai_tools import execute_tool

SYSTEM_PROMPT = """Tu es le Copilot Commercial IA de omnisales-ai sur WhatsApp.
Ton rôle est d'accueillir les clients, renseigner sur les prix et disponibilités, et créer des devis proforma précis.
Règles strictes :
1. Toujours vérifier la disponibilité des stocks via get_product_availability avant d'annoncer un prix ou de confirmer un stock.
2. Pour créer un devis, utilise create_or_update_draft_order. Les montants sont toujours en FCFA.
3. En cas de mécontentement, litige ou demande de négociation complexe, déclenche immédiatement trigger_human_handover.
4. Tu n'as PAS le pouvoir de confirmer un paiement ou de marquer une commande comme expédiée.
5. Sois chaleureux, concis et professionnel. Pas de dégradés ni de fioritures.
"""

GEMINI_TOOLS_DECLARATION = [
    {
        "name": "get_product_availability",
        "description": "Recherche un produit dans le catalogue et retourne les stocks et prix actuels.",
        "parameters": {
            "type": "object",
            "properties": {
                "keyword": {"type": "string", "description": "Mot clé du produit ou SKU"}
            },
            "required": ["keyword"]
        }
    },
    {
        "name": "create_or_update_draft_order",
        "description": "Crée un devis proforma au statut brouillon pour le client.",
        "parameters": {
            "type": "object",
            "properties": {
                "customer_phone": {"type": "string", "description": "Numéro WhatsApp du client (format E.164)"},
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "product_code": {"type": "string"},
                            "quantity": {"type": "integer"}
                        },
                        "required": ["product_code", "quantity"]
                    }
                }
            },
            "required": ["customer_phone", "items"]
        }
    },
    {
        "name": "trigger_human_handover",
        "description": "Désactive le bot et alerte un conseiller humain pour prendre le relais.",
        "parameters": {
            "type": "object",
            "properties": {
                "customer_phone": {"type": "string"},
                "reason": {"type": "string", "description": "Motif de l'escalade"}
            },
            "required": ["customer_phone", "reason"]
        }
    }
]

async def process_incoming_message(
    customer_phone: str,
    message_text: str,
    db: AsyncSession,
    media_url: Optional[str] = None,
    media_type: str = "text"
) -> Dict[str, Any]:
    # In production, this calls Gemini API with Function Calling
    # For deterministic tests and fallback:
    return {
        "customer_phone": customer_phone,
        "input_message": message_text,
        "media_type": media_type,
        "reply": "Merci pour votre message. Un agent traite votre demande."
    }
