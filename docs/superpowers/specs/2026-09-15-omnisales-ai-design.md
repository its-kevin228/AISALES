# Spécification d'Architecture et de Design : WhatsApp AI Commerce Copilot (omnisales-ai)

Date : 15 Septembre 2026
Auteur : Kevin & Antigravity
Statut : Validé en phase de conception

---

## 1. Contexte et Objectifs

### 1.1 Contexte
Le projet *WhatsApp AI Commerce Copilot* (`omnisales-ai`) est une plateforme SaaS destinée aux entreprises (grossistes, PME, distributeurs) dont la majorité des flux commerciaux s'effectue via WhatsApp. Les clients transmettent des commandes sous forme de texte libre, de messages vocaux ou de photos d'articles et de reçus de paiement Mobile Money.

### 1.2 Principes Fondamentaux
1. **Human-in-the-Loop strict** : L'IA prépare les devis et analyse les justificatifs financiers, mais la validation finale de la vente et l'expédition restent sous le contrôle exclusif de l'opérateur humain via le cockpit web.
2. **Poste de travail SaaS complet (Anti-design IA)** : L'interface web est un outil de production ergonomique et réactif, adoptant les standards visuels de Linear et Stripe. Tout artifice cosmétique générique (dégradés néon artificiels, sphères floues ou faux simulateurs de smartphone) est banni.
3. **Architecture découplée haute performance** : Backend asynchrone FastAPI 0.115+ et Frontend Next.js 16 (App Router / React 19).

---

## 2. Architecture Technique et Monorepo

### 2.1 Arborescence du Projet
```text
AISALES/
├── backend/
│   ├── app/
│   │   ├── api/             # Routes REST FastAPI (whatsapp, orders, products, dashboard)
│   │   ├── core/            # Configuration, base de données, sécurité HMAC
│   │   ├── models/          # Entités SQLAlchemy 2.0 Async
│   │   ├── schemas/         # Schémas Pydantic v2
│   │   └── services/        # Services Gemini, Whisper, Meta Graph API
│   ├── tests/               # Tests automatisés Pytest
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (dashboard, inbox, orders, inventory, cashdesk)
│   │   ├── components/      # Composants UI style Linear (DataTable, ChatFeed, MetricCard)
│   │   ├── lib/             # Client API, hooks et utilitaires
│   │   └── styles/          # Variables CSS du design system Linear
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Orchestration locale et production
├── CAHIER_DES_CHARGES.md
└── USE_CASES.md
```

### 2.2 Stack Technologique
* **Backend** : FastAPI 0.115+, Python 3.12, SQLAlchemy 2.0 Async, Pydantic v2, PostgreSQL 18.
* **Frontend** : Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
* **Moteur Multimodal & IA** : Google Gemini 2.0 Flash / Pro (Function Calling, Vision OCR), OpenAI Whisper (Transcription audio).
* **Sécurité** : Validation de signature HMAC SHA-256 sur les requêtes Webhook entrantes.

---

## 3. Modèle de Données Relationnel (PostgreSQL 18)

* **Customer** :
  * `id` : UUID, clé primaire
  * `phone_number` : Chaine (format E.164), unique
  * `name` : Chaine (nom de profil WhatsApp)
  * `address` : Chaine (adresse de livraison)
  * `created_at` : Horodatage avec fuseau horaire

* **Product** :
  * `id` : UUID, clé primaire
  * `code` : Chaine (SKU unique)
  * `name` : Chaine
  * `category` : Chaine
  * `unit_price` : Entier ou décimal (en FCFA)
  * `stock_quantity` : Entier
  * `is_active` : Booléen

* **Order** :
  * `id` : UUID, clé primaire
  * `order_number` : Chaine unique (ex: CMD-2026-0042)
  * `customer_id` : Clé étrangère vers Customer
  * `status` : Enum (`draft`, `pending_validation`, `confirmed`, `in_preparation`, `shipped`, `cancelled`)
  * `total_amount` : Entier ou décimal (en FCFA)
  * `receipt_url` : Chaine optionnelle (URL de la capture d'écran du reçu)
  * `receipt_data` : JSONB (données extraites par OCR : référence, montant, date, opérateur)
  * `created_at` : Horodatage

* **OrderLine** :
  * `id` : UUID, clé primaire
  * `order_id` : Clé étrangère vers Order
  * `product_id` : Clé étrangère vers Product
  * `quantity` : Entier
  * `unit_price` : Entier ou décimal
  * `subtotal` : Entier ou décimal

* **Conversation** :
  * `id` : UUID, clé primaire
  * `customer_id` : Clé étrangère vers Customer
  * `status` : Enum (`bot`, `human_handover`)
  * `last_activity_at` : Horodatage

* **Message** :
  * `id` : UUID, clé primaire
  * `conversation_id` : Clé étrangère vers Conversation
  * `direction` : Enum (`inbound`, `outbound`)
  * `sender` : Enum (`customer`, `ai_agent`, `human_agent`)
  * `content` : Texte
  * `media_url` : Chaine optionnelle
  * `media_type` : Enum (`text`, `audio`, `image`, `document`)
  * `created_at` : Horodatage

---

## 4. Flux de Traitement et Function Calling

1. **Réception Webhook** :
   * Validation de l'en-tête `X-Hub-Signature-256`.
   * Réponse immédiate 200 OK à Meta pour éviter les réémissions.
   * Traitement délégué à une tâche de fond asynchrone FastAPI.
2. **Transcription Vocale** :
   * Téléchargement de la note vocale WhatsApp.
   * Transcription en texte français par Whisper.
3. **Exécution des Outils Métier (Function Calling Gemini)** :
   * `get_product_availability(keyword: str)` : Recherche en base PostgreSQL et retourne prix et stock.
   * `create_or_update_draft_order(customer_phone: str, items: list[dict])` : Calcule les sous-totaux et persiste la commande en statut `draft`.
   * `trigger_human_handover(reason: str)` : Coupe l'automatisation du bot pour cette conversation et notifie le cockpit.
4. **Analyse de Reçus de Paiement (Vision OCR)** :
   * Extraction du montant, de la date, de la référence de transaction et de l'opérateur (Wave, Orange Money, MTN).
   * Contrôle d'unicité de la référence de transaction en base de données.
   * Association du reçu à la commande et bascule au statut `pending_validation`.

---

## 5. Spécifications de l'Interface Utilisateur (Cockpit Next.js 16)

### 5.1 Design System Linear
* Palette de fond sombre mat (`#010102`), panneaux charbon (`#0f1011`), bordures fines 1px (`#23252a`).
* Typographie dense avec chiffres tabulaires pour les montants FCFA, les SKU et les horodatages.
* Badges d'état sémantiques haute lisibilité inspirés de Stripe : Vert émeraude (confirmé), Ambre (en attente), Rouge (rupture/litige), Bleu/Gris (brouillon).
* Raccourcis clavier : `Ctrl+K` pour la recherche rapide, `Ctrl+Enter` pour valider une commande.

### 5.2 Les Cinq Espaces Métiers de l'Application Web
1. **Tableau de Bord** : Indicateurs d'activité du jour, liste des actions immédiates requises, alertes stock.
2. **Messagerie & Supervision WhatsApp** : Volet gauche des conversations actives, fil de discussion central avec lecteur de notes vocales et réponse directe, volet droit avec profil client et commutateur Bot / Humain.
3. **Pôle Commandes** : Tableau triable et filtrable avec tiroir coulissant de détail d'articles et validation 1-clic.
4. **Catalogue & Stocks** : Tableau de gestion des stocks avec mise à jour instantanée et seuils d'alerte.
5. **Caisse & Paiements** : Visualisation des captures d'écran de reçus et comparaison directe avec les montants extraits par OCR.

---

## 6. Plan de Vérification et Tests

* **Tests Backend (Pytest Asyncio)** :
  * Vérification du handshake Webhook Meta et du rejet des signatures invalides.
  * Tests des fonctions de calcul de commande et de réservation de stock.
  * Tests de simulation du flux d'outils Function Calling.
* **Tests Frontend (TypeScript & Lint)** :
  * Validation des types TypeScript stricts sur les modèles de données.
  * Vérification de l'accessibilité et du respect des contrastes de couleur.
