# Photo Scolaire - Plateforme de vente de photos

Plateforme Next.js 15 pour la vente de photos scolaires avec authentification double (parents + établissements).

## Stack Technique

- **Next.js 15** (App Router, TypeScript, Server Actions)
- **MongoDB** (Mongoose ORM)
- **NextAuth.js v5** (Authentication)
- **TailwindCSS** (Styling)
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
- `MONGODB_URI` : URI MongoDB Atlas
- `NEXTAUTH_SECRET` : Générer avec `openssl rand -base64 32`
- `NEXT_PUBLIC_CLOUDFRONT_URL` : URL CloudFront pour les photos

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
