# Photo Scolaire - Plateforme de vente de photos

Plateforme Next.js 15 pour la vente de photos scolaires avec authentification double (parents + établissements).

## Stack Technique

- **Next.js 15** (App Router, TypeScript, Server Actions)
- **MongoDB** (Mongoose ORM)
- **NextAuth.js v5** (Authentication)
- **Stripe** (Paiement en ligne)
- **AWS S3 + CloudFront** (Stockage et CDN photos)
- **Resend** (Emails transactionnels)
- **Sharp** (Génération d'images serveur)
- **TailwindCSS** (Styling)
- **Zustand** (State management client)
- **Zod** (Validation)
- **bcryptjs** (Password hashing)

## Architecture

```
/app
  /api/auth/[...nextauth]       # Route handler NextAuth
  /(public)
    /login                        # Login parents
    /school/login                 # Login établissements
  /(protected-parent)
    /gallery                      # Galerie photos parents
    /cart                         # Panier
    /orders                       # Historique commandes
  /(protected-school)
    /dashboard                    # Dashboard école
    /orders                       # Gestion commandes
/lib
  /db                             # MongoDB + Models
  /auth                           # NextAuth config
  /utils                          # Utilitaires
/types                            # Types TypeScript
/middleware.ts                    # Protection routes
```

## Installation

1. **Cloner et installer**
```bash
cd photo-scolaire
npm install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

Modifier `.env.local` avec vos vraies valeurs :

**MongoDB**
- `MONGODB_URI` : URI MongoDB (ex: `mongodb://localhost:27017` ou Atlas)
- `MONGODB_DATABASE` : Nom de la base de données

**NextAuth**
- `NEXTAUTH_SECRET` : Générer avec `openssl rand -base64 32`
- `NEXTAUTH_URL` : URL de l'application (ex: `http://localhost:3000`)

**AWS S3 + CloudFront**
- `AWS_ACCESS_KEY_ID` : Clé d'accès AWS
- `AWS_SECRET_ACCESS_KEY` : Clé secrète AWS
- `S3_REGION` : Région S3 (ex: `eu-west-3`)
- `S3_BUCKET_NAME` : Nom du bucket S3
- `CLOUDFRONT_DOMAIN` : Domaine CloudFront

**Stripe**
- `STRIPE_SECRET_KEY` : Clé secrète Stripe (ex: `sk_test_...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` : Clé publique (ex: `pk_test_...`)
- `STRIPE_WEBHOOK_SECRET` : Secret webhook (ex: `whsec_...`)

**Resend (Emails)**
- `RESEND_API_KEY` : Clé API Resend

3. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Modèles de données

### Student (Élève)
- QR code unique + login/password
- Photos avec formats et prix
- Références fratrie
- Lié à une école

### School (Établissement)
- Login code unique + password
- Gère les commandes de ses élèves
- Valide paiements chèque/espèces

### Order (Commande)
- Numéro unique (CMD-YYYY-NNNNNN)
- Items avec quantités
- Statuts : pending → paid → validated → processing → shipped → completed
- Méthodes paiement : online, check, cash

## Authentification (Phase 1 - ✅ Complète)

### Parents
- **QR Code** OU **Login/Password**
- Providers NextAuth "parent" avec credentials
- Redirect vers `/gallery` après login
- Server Actions dans `app/(public)/login/actions.ts`

### Établissements
- **Login Code + Password**
- Provider NextAuth "school" avec credentials
- Redirect vers `/school/dashboard` après login
- Server Actions dans `app/(public)/school/login/actions.ts`

## Middleware de protection

Le middleware `middleware.ts` protège :
- Routes parents : accessible uniquement avec role="parent"
- Routes école : accessible uniquement avec role="school"
- Redirections automatiques selon le rôle

## Server Actions

**Règle d'or** : AUCUNE route API (sauf `/api/auth/[...nextauth]`). Tout passe par Server Actions.

Structure des Server Actions :
```typescript
'use server'

export async function myAction(params): Promise<ActionResponse<T>> {
  try {
    // 1. Valider inputs (Zod)
    // 2. Vérifier session avec await auth()
    // 3. Vérifier permissions
    // 4. Connecter DB
    // 5. Effectuer mutation/lecture
    // 6. Revalidate cache si besoin
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Message' }
  }
}
```

## Paiement Stripe

### Configuration

1. **Créer un compte Stripe** : https://dashboard.stripe.com/register

2. **Récupérer les clés API** (Dashboard → Développeurs → Clés API)
   - Mode test : `sk_test_...` et `pk_test_...`
   - Mode production : `sk_live_...` et `pk_live_...`

3. **Configurer le webhook**

**En développement (local)** :
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter à Stripe
stripe login

# Lancer l'écoute des webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Le CLI affichera le secret webhook : `whsec_...` → Copier dans `.env.local`

**En production** :
1. Dashboard Stripe → Webhooks → Add endpoint
2. URL : `https://votre-domaine.com/api/stripe/webhook`
3. Événements à sélectionner :
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
4. Copier le secret webhook dans vos variables d'environnement

### Flow de paiement

1. **Client passe commande** → Commande créée avec `status: "pending"`
2. **Sélection "Paiement en ligne"** → Redirection vers Stripe Checkout
3. **Paiement sur Stripe** → Page sécurisée Stripe
4. **Webhook `checkout.session.completed`** → Commande → `status: "paid"`
5. **Retour sur le site** → Page de confirmation + panier vidé

### Événements webhook gérés

| Événement | Action automatique | Description |
|-----------|-------------------|-------------|
| `checkout.session.completed` | Status → `"paid"` | Paiement réussi |
| `checkout.session.expired` | Commande supprimée | Session abandonnée (24h) |
| `payment_intent.payment_failed` | Note avec raison | Carte refusée, etc. |
| `charge.refunded` | Status → `"pending"` + note | Remboursement effectué |
| `charge.dispute.created` | Note avec détails | Litige/chargeback client |

### Metadata envoyées à Stripe

Chaque paiement contient :
```json
{
  "orderId": "673abc...",
  "orderNumber": "ORD-20251116-00001",
  "studentIds": "[\"673...\", \"674...\"]",
  "schoolId": "672xyz...",
  "classIds": "CE1-CE2, CM1"
}
```

Ces metadata permettent :
- ✅ Filtrage dans Dashboard Stripe
- ✅ Traçabilité complète
- ✅ Support client facilité

### Tester le paiement

**Cartes de test Stripe** :
- ✅ Succès : `4242 4242 4242 4242`
- ❌ Échec : `4000 0000 0000 0002`
- 🔒 3D Secure : `4000 0025 0000 3155`

Date d'expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres

**Simuler des événements** :
```bash
# Remboursement
stripe refunds create --charge=ch_xxx

# Litige
stripe disputes create --charge=ch_xxx --reason=fraudulent
```

## Fonctionnalités principales

### Packs de photos

Les **Packs** permettent aux parents d'acheter plusieurs photos à prix réduit :
- Modèle `Pack` dans MongoDB avec : nom (S, M, L, XL, XXL), prix, liste de planches
- Prix global du pack < somme des prix individuels
- Packs disponibles selon les photos de l'élève
- Sélection de photo de classe si plusieurs disponibles

**Sélection de photos de classe multiples** :
1. École peut avoir plusieurs photos de classe (ex: photo classique + photo fun)
2. Toutes les photos sont sauvegardées dans MongoDB et S3
3. Si pack contient "classe" → Parent choisit quelle photo il préfère
4. Sélection sauvegardée dans la commande (`selectedClassPhotoId`)
5. Export HD utilise la photo sélectionnée

### Génération de planches CSS

**Rendu dynamique** pour l'aperçu :
- Templates stockés dans MongoDB (JSON avec positions, rotations, effets)
- Génération côté client avec CSS/HTML pour preview instantané
- Composant `CssPlanchePreview` avec watermark

**Génération HD** pour les commandes :
- Script Python `scriptPlanche/export_hd_photos.py`
- Utilise Sharp côté serveur (`/api/generate-planche`)
- Photos HD sans watermark pour commandes payées
- Respect de la photo de classe sélectionnée

### Architecture hybride

```
┌─────────────────┐
│  Aperçu (Web)   │ → CSS dynamique (rapide, avec watermark)
└─────────────────┘

┌─────────────────┐
│ Commande payée  │ → Python/Sharp (HD, sans watermark)
└─────────────────┘
```

### Gestion du panier

- **State client** : Zustand (`lib/stores/cart-store.ts`)
- Persistance localStorage
- Support photos individuelles + packs
- Calcul automatique des totaux
- Différenciation par étudiant et classe

## Phases de développement

### ✅ Phase 1 - Setup et authentification (COMPLÈTE)
- [x] Init projet Next.js 15
- [x] MongoDB + Models (School, Student, Order)
- [x] NextAuth avec 2 providers credentials
- [x] Server Actions d'authentification
- [x] Pages login parents + école
- [x] Middleware de protection
- [x] Types TypeScript globaux
- [x] Utilitaires (formatPrice, formatDate, etc.)

### 🔄 Phase 2 - Interface Parents (À FAIRE)
- [ ] Galerie photos (Server Component)
- [ ] Server Action `getStudentPhotos()`
- [ ] Composant carte photo avec `addToCart()` action
- [ ] Gestion panier (state local + Server Actions)
- [ ] Server Action `createOrder()`
- [ ] Page confirmation commande

### 🔄 Phase 3 - Interface Établissement (À FAIRE)
- [ ] Dashboard avec stats (`getSchoolStats()`)
- [ ] Gestion commandes (`getSchoolOrders()`)
- [ ] Actions : valider paiement, changer statut, ajouter notes
- [ ] Modal détail commande

### 🔄 Phase 4 - Historique parents (À FAIRE)
- [ ] Liste commandes parent (`getParentOrders()`)
- [ ] Détail commande (`getOrderDetails()`)

### 🔄 Phase 5 - Améliorations (OPTIONNEL)
- [ ] Export CSV (`exportOrdersToCSV()`)
- [ ] Emails de confirmation
- [ ] Recherche avancée

## Scripts utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Linting
npm run lint
```

## Prochaines étapes

1. **Créer des données de test** dans MongoDB :
   - 1-2 écoles
   - 5-10 élèves avec photos
   - Quelques commandes

2. **Tester l'authentification** :
   - Login parent avec QR/credentials
   - Login école
   - Vérifier redirections

3. **Passer à la Phase 2** :
   - Implémenter galerie photos
   - Système de panier
   - Création de commandes

## Sécurité

- Passwords hashés avec bcrypt
- Validation Zod côté serveur
- Vérification session dans chaque Server Action
- Middleware strict sur les routes protégées
- Isolation des données par rôle (parent vs école)

## Support

Pour toute question sur l'implémentation, consultez :
- `/lib/auth/auth-options.ts` pour l'authentification
- `/middleware.ts` pour la protection des routes
- `/types/index.ts` pour les types TypeScript
- `app/(public)/login/actions.ts` pour les exemples de Server Actions

---

**Status** : Phase 1 complète ✅ - Prêt pour Phase 2
