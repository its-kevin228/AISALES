# 📘 Spécification Fonctionnelle & Cas d'Utilisation (Use Cases)
## Projet : WhatsApp AI Commerce Copilot (`omnisales-ai`)
### *Architecture Découplée : FastAPI 0.115+, Next.js 16 & PostgreSQL 18*

---

## 1. Vue d'Ensemble & Acteurs du Système

Le système **WhatsApp AI Commerce Copilot** est une plateforme SaaS moderne d'automatisation des ventes et du support client. Il connecte la messagerie WhatsApp (Meta Cloud API) à un backend **FastAPI 0.115+** haute performance relié à **PostgreSQL 18**, supervisé en temps réel par un Cockpit commercial sous **Next.js 16 (React 19)**.

### Les Acteurs

| Acteur | Type | Rôle et Responsabilités |
| :--- | :--- | :--- |
| **Client / Prospect** | Humain (Externe) | Échange sur WhatsApp (texte, audio vocal, photos d'articles ou reçus de paiement) pour s'informer, commander et suivre ses livraisons. |
| **Agent IA (Copilot)** | Système (FastAPI + Gemini) | Écoute 24/7, comprend les intentions, interroge les stocks en base PostgreSQL 18 via *Tool Calling*, génère les commandes devis et répond instantanément. |
| **Vendeur / Commercial** | Humain (Interne) | Supervise les devis dans le Cockpit Next.js 16, valide les commandes en 1 clic (*Human-in-the-Loop*), gère les négociations et le SAV. |
| **Caissier / Comptable** | Humain (Interne) | Vérifie les preuves de paiement (Mobile Money Wave/Orange/MTN ou virements) reçues dans Next.js 16 et valide l'encaissement. |
| **Magasinier / Livreur** | Humain (Interne) | Prépare les colis physiques et prend en charge l'expédition notifiée automatiquement au client. |
| **Administrateur Système**| Humain (Interne) | Gère le catalogue produits, les prix, les clés API Meta & Gemini et les paramètres de sécurité. |

---

## 2. Matrice Globale des 20 Cas d'Utilisation

```
+-----------------------------------------------------------------------------------+
|                            CYCLE DE VIE DU CLIENT                                 |
+-----------------------------------+-----------------------------------------------+
| PHASE 1 : ACQUISITION & INFO      | UC-01 : Accueil & Enregistrement Contact      |
|                                   | UC-02 : Recherche Catalogue, Prix & Stocks    |
|                                   | UC-03 : Recherche de Produit par Photo        |
|                                   | UC-04 : Gestion Rupture & Vente Croisée       |
+-----------------------------------+-----------------------------------------------+
| PHASE 2 : COMMANDE & DEVIS        | UC-05 : Commande Texte Multi-Articles         |
|                                   | UC-06 : Commande par Message Vocal (Audio)    |
|                                   | UC-07 : Modification / Annulation de Devis    |
|                                   | UC-08 : Négociation & Limites de Remise       |
+-----------------------------------+-----------------------------------------------+
| PHASE 3 : PAIEMENT & FACTURATION  | UC-09 : Choix Mode de Paiement & Instructions |
|                                   | UC-10 : Transmission de Preuve de Paiement    |
|                                   | UC-11 : Validation Humaine & Confirmation     |
+-----------------------------------+-----------------------------------------------+
| PHASE 4 : LIVRAISON & LOGISTIQUE  | UC-12 : Génération Bon de Préparation/Colis   |
|                                   | UC-13 : Notification d'Expédition Automatique |
+-----------------------------------+-----------------------------------------------+
| PHASE 5 : SUIVI & SUPPORT CLIENT  | UC-14 : Suivi de Commande en Self-Service     |
|                                   | UC-15 : Réclamation & Escalade Humaine Urgente|
|                                   | UC-16 : Demande de Duplicata de Facture PDF   |
+-----------------------------------+-----------------------------------------------+
| PHASE 6 : MARKETING & RELANCE     | UC-17 : Relance Automatique Devis Abandonnés  |
|                                   | UC-18 : Alerte Retour en Stock                |
+-----------------------------------+-----------------------------------------------+
| PHASE 7 : COCKPIT & SÉCURITÉ      | UC-19 : Prise de Contrôle Humaine (Handover)  |
|                                   | UC-20 : Audit Trail & Supervision Next.js 16  |
+-----------------------------------+-----------------------------------------------+
```

---

## 3. Détail Exhaustif des Cas d'Utilisation

---

### PHASE 1 : Découverte, Renseignement & Recherche Produits

#### UC-01 : Accueil & Enregistrement Automatique du Contact
* **Déclencheur** : Un utilisateur inconnu envoie un premier message WhatsApp (*"Bonjour"* ou demande de catalogue).
* **Préconditions** : Webhook FastAPI et base PostgreSQL 18 actifs.
* **Scénario Nominal** :
  1. FastAPI reçoit le webhook Meta et extrait le numéro de téléphone (`wa_id`) et le nom de profil.
  2. Le service interroge la table `Customer` dans PostgreSQL 18.
  3. Aucun enregistrement n'étant trouvé, le système insère un nouveau client :
     * `phone_number` : Numéro WhatsApp normalisé (E.164)
     * `name` : Nom de profil WhatsApp
  4. L'IA renvoie un message d'accueil chaleureux présentant l'entreprise et proposant son assistance.
* **Données impactées** : Table `Customer` (Création).

---

#### UC-02 : Consultation Catalogue, Prix & Disponibilité du Stock
* **Déclencheur** : Le client demande les caractéristiques, le prix ou la disponibilité d'un article (*"Combien coûte le ciment Dangote 50kg et est-ce qu'il y en a ?"*).
* **Scénario Nominal** :
  1. L'Agent IA extrait l'entité recherchée : `produit="ciment Dangote 50kg"`.
  2. L'Agent déclenche la fonction Python (*Tool Calling*) : `get_product_availability(keyword="ciment")`.
  3. FastAPI interroge la table `Product` dans PostgreSQL 18 :
     * Prix de vente unitaire : 4 900 FCFA
     * Stock disponible (`stock_quantity`) : 80 sacs.
  4. L'IA formule une réponse claire et engageante :
     > *"Le sac de ciment Dangote 50kg est disponible à 4 900 FCFA l'unité. Nous en avons 80 sacs en stock actuellement. Combien de sacs souhaitez-vous commander ?"*

---

#### UC-03 : Recherche de Produit par Photo / Image
* **Déclencheur** : Le client envoie une photo d'un article ou d'une pièce détachée (*"Avez-vous ce modèle précis ?"*).
* **Scénario Nominal** :
  1. Le Webhook FastAPI reçoit le média image et télécharge le fichier média via l'API Graph Meta.
  2. Le modèle multimodal Gemini Vision analyse l'image et identifie l'objet.
  3. FastAPI recherche la correspondance dans la table `Product` par SKU ou libellé.
  4. L'IA répond en indiquant le prix et le stock disponible avec proposition d'ajout au devis.

---

#### UC-04 : Gestion de Rupture de Stock & Recommandation Alternative
* **Déclencheur** : Le client demande un produit dont le stock dans PostgreSQL 18 est à zéro.
* **Scénario Nominal** :
  1. L'IA constate `stock_quantity <= 0`.
  2. L'Agent recherche automatiquement les articles alternatifs actifs dans la même catégorie avec un stock suffisant.
  3. L'IA informe courtoisement de la rupture et propose immédiatement le produit de substitution avec son tarif.

---

### PHASE 2 : Prise de Commande & Devis

#### UC-05 : Prise de Commande Multi-Articles en Texte Libre
* **Déclencheur** : Le client saisit une liste d'achats en un seul message (*"Je veux 10 sacs de ciment, 2 fers de 12 et 5 boîtes de pointes 80"*).
* **Scénario Nominal** :
  1. Le LLM parse le message en liste d'articles et quantités structurées.
  2. FastAPI vérifie la disponibilité de chaque ligne dans PostgreSQL 18.
  3. L'Agent appelle `create_draft_order()` :
     * Table `Order` créée en statut `draft`.
     * Tables `OrderLine` créées avec calcul précis des sous-totaux et taxes.
  4. L'IA renvoie la proforma chiffrée sur WhatsApp avec le montant total.
  5. **Mise à jour en temps réel** : La commande apparaît instantanément dans le Cockpit Next.js 16 des commerciaux !

---

#### UC-06 : Prise de Commande par Message Vocal (Audio Speech-to-Text)
* **Déclencheur** : Le client envoie une note vocale WhatsApp de 20 secondes.
* **Scénario Nominal** :
  1. FastAPI télécharge le fichier audio (`.ogg` / Opus).
  2. Le service Whisper transcrit la voix en texte avec ponctuation.
  3. Le texte transcrit est injecté dans le moteur d'IA Gemini.
  4. L'IA applique la logique de l'UC-05 et génère le devis en base.
  5. L'IA répond en confirmant la bonne réception du vocal et détaille le devis.

---

#### UC-07 : Modification ou Annulation de Devis avant Validation
* **Déclencheur** : Le client modifie ses quantités avant paiement (*"Finalement mets 15 sacs au lieu de 10"*).
* **Scénario Nominal** :
  1. L'IA retrouve la commande active au statut `draft`.
  2. FastAPI met à jour les lignes `OrderLine` et recalcule le total dans PostgreSQL 18.
  3. L'IA envoie le nouveau total actualisé.

---

#### UC-08 : Gestion des Remises & Règles Commerciales
* **Déclencheur** : Le client demande une remise (*"Je prends pour 500 000 FCFA, tu me fais 15% ?"*).
* **Scénario Nominal** :
  1. L'IA applique les règles configurées (max 5% automatique sur gros paniers).
  2. Au-delà, l'IA propose la remise standard autorisée et crée une alerte d'approbation dans le Cockpit Next.js 16 pour le manager commercial.

---

### PHASE 3 : Paiement, Facturation & Contrôle Financier

#### UC-09 : Sélection du Mode de Paiement & Instructions
* **Déclencheur** : Le client valide son devis et son adresse.
* **Scénario Nominal** :
  1. L'IA fournit les instructions de paiement officielles (Numéro marchand Mobile Money Wave/Orange/MTN ou coordonnées bancaires).
  2. L'IA transmet la référence unique à rappeler lors du transfert (ex: `CMD-1042`).

---

#### UC-10 : Réception & Analyse de Preuve de Paiement (Vision OCR)
* **Déclencheur** : Le client envoie la capture d'écran de son reçu Mobile Money.
* **Scénario Nominal** :
  1. FastAPI reçoit l'image et l'analyse avec Gemini Vision.
  2. Extraction du montant, de la date et du code de transaction opérateur.
  3. Contrôle anti-fraude d'unicité de la référence de transaction en base.
  4. L'image est enregistrée et liée à la commande dans PostgreSQL 18.
  5. Une alerte visuelle prioritaire s'affiche sur le Cockpit Next.js 16 du caissier.

---

#### UC-11 : Validation Humaine (Human-in-the-Loop) & Confirmation de Vente
* **Déclencheur** : Le caissier ou le vendeur valide l'encaissement sur le Cockpit Next.js 16.
* **Scénario Nominal** :
  1. Le gestionnaire consulte la commande et la preuve de paiement sur Next.js 16.
  2. Il clique sur le bouton vert **"Confirmer la Vente"**.
  3. FastAPI passe le statut de l'ordre de `draft` à `confirmed`, déduit les stocks d'articles et génère la facture.
  4. FastAPI envoie automatiquement un message WhatsApp de confirmation au client avec notification de mise en préparation.

---

### PHASE 4 : Logistique & Préparation de Commande

#### UC-12 : Bon de Préparation & Gestion Entrepôt
* **Déclencheur** : Confirmation de la commande (UC-11).
* **Scénario Nominal** :
  1. Le statut de commande passe à `in_preparation`.
  2. La liste de colisage s'affiche dans l'espace logistique du Cockpit Next.js 16 pour le magasinier.

---

#### UC-13 : Notification d'Expédition Automatique & Coordination Livreur
* **Déclencheur** : Le colis est remis au livreur.
* **Scénario Nominal** :
  1. Le responsable logistique clique sur "Expédier" dans Next.js 16.
  2. FastAPI envoie un message WhatsApp avec le nom du livreur, son contact et l'estimation de livraison.

---

### PHASE 5 : Suivi, Après-Vente & Gestion des Litiges

#### UC-14 : Suivi de Commande en Self-Service
* **Déclencheur** : Le client demande : *"Où en est ma commande ?"*.
* **Scénario Nominal** :
  1. L'IA identifie la dernière commande du client dans PostgreSQL 18.
  2. L'IA répond en temps réel selon le statut : `En préparation`, `En cours de livraison` ou `Livrée`.

---

#### UC-15 : Réclamation Client & Escalade Immédiate
* **Déclencheur** : Le client signale un problème ou exprime son mécontentement.
* **Scénario Nominal** :
  1. Le modèle IA détecte le sentiment négatif.
  2. L'IA envoie un message d'apaisement et active immédiatement le mode `handover` (pause du bot).
  3. Une alerte rouge clignote dans le Cockpit Next.js 16 pour qu'un conseiller prenne immédiatement la main.

---

#### UC-16 : Demande de Duplicata de Facture PDF
* **Déclencheur** : Le client demande la facture officielle de sa commande en PDF.
* **Scénario Nominal** :
  1. FastAPI génère la facture PDF stylisée et la transmet en pièce jointe via l'API WhatsApp Document.

---

### PHASE 6 : Marketing Automatisé & Réactivation

#### UC-17 : Relance Automatique des Devis Abandonnés
* **Déclencheur** : Un devis reste en statut `draft` après 24 heures.
* **Scénario Nominal** :
  1. Une tâche de fond asynchrone FastAPI identifie les devis sans réponse.
  2. L'IA envoie une relance polie sur WhatsApp demandant si le client a besoin d'assistance.

---

#### UC-18 : Alerte Retour en Stock (Back-in-Stock)
* **Déclencheur** : Réapprovisionnement d'un article dont le stock était épuisé.
* **Scénario Nominal** :
  1. Dès la saisie du nouveau stock dans Next.js 16, le système notifie les clients ayant récemment demandé cet article.

---

### PHASE 7 : Cockpit Next.js 16 & Supervision

#### UC-19 : Prise de Contrôle Humaine en Direct (Human Handover)
* **Déclencheur** : Un commercial souhaite converser en direct avec le client sans intervention de l'IA.
* **Scénario Nominal** :
  1. Dans Next.js 16, le commercial bascule le toggle **"Pause IA / Reprise Humaine"**.
  2. Le commercial tape ses réponses directement dans l'interface web : FastAPI les expédie sur WhatsApp.
  3. L'IA reste en veille jusqu'à réactivation manuelle.

---

#### UC-20 : Audit Trail & Supervision Temps Réel
* **Déclencheur** : Tout événement ou message échangé.
* **Scénario Nominal** :
  1. 100% des messages, requêtes et décisions sont stockés dans la table `Message` de PostgreSQL 18.
  2. Le Cockpit Next.js 16 fournit une vue chronologique inaltérable, avec indicateurs de tokens IA et métriques de conversion.

---

## 4. Architecture Technique

```
                             +-----------------------+
                             |   WhatsApp Cloud API  |
                             |     (Meta Graph)      |
                             +-----------+-----------+
                                         |
                                 (Webhook HTTPS)
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                         BACKEND FASTAPI 0.115+ (Python 3.12)                    |
|                                                                                 |
|  +-----------------------------------+   +-----------------------------------+  |
|  |       ROUTERS & WEBHOOKS          |   |           SERVICES IA             |  |
|  |  - /api/v1/whatsapp (Webhook Meta)|   |  - Gemini Function Calling        |  |
|  |  - /api/v1/orders (Commandes)     |   |  - Whisper Speech-to-Text         |  |
|  |  - /api/v1/dashboard (Temps Réel) |   |  - Vision OCR Paiements           |  |
|  +-----------------+-----------------+   +-----------------+-----------------+  |
|                    |                                       |                    |
|                    +-------------------+-------------------+                    |
|                                        |                                        |
|                                        v                                        |
|  +---------------------------------------------------------------------------+  |
|  |                   POSTGRESQL 18 (SQLAlchemy 2.0 Async)                    |  |
|  |  • Customer (Clients WhatsApp)                                            |  |
|  |  • Product (Catalogue & Stocks réels)                                     |  |
|  |  • Order & OrderLine (Devis & Ventes confirmées)                          |  |
|  |  • Conversation & Message (Audit Trail complet)                          |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
                                         ^
                                         | (REST API / SSE / WebSockets)
                                         v
+---------------------------------------------------------------------------------+
|                   FRONTEND NEXT.JS 16 (React 19 / TypeScript)                   |
|                                                                                 |
|  • Dashboard Commercial & KPIs en Direct (Chiffre d'Affaires, Devis récents)   |
|  • Simulateur Smartphone WhatsApp Interactif                                    |
|  • Bouton de Validation Human-in-the-Loop (Confirmation Vente 1-clic)           |
|  • Switch Handover (Débrayage Bot <-> Commercial)                               |
|  • Gestion des Stocks & Alertes Rupture                                         |
+---------------------------------------------------------------------------------+
```
