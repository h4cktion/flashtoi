# Implémentation du système de commande

Ce document décrit l'implémentation du système de commande avec paiement chèque/liquide/Stripe.

## Fichiers créés

### 1. Actions serveur - `/lib/actions/order.ts`
Action serveur pour créer les commandes avec :
- Génération automatique du numéro de commande (format: ORD-YYYYMMDD-XXXXX)
- Validation de l'étudiant
- Calcul automatique des subtotals
- Enregistrement en base de données

### 2. Page de checkout - `/app/checkout/page.tsx`
Page de finalisation de commande avec :
- Récapitulatif détaillé (packs + photos individuelles)
- Sélection du mode de paiement (chèque, liquide, Stripe)
- Champ notes optionnel
- Validation et création de la commande
- Protection par authentification (redirection si non connecté)

### 3. Page de confirmation - `/app/order-confirmation/page.tsx`
Page affichée après création de la commande avec :
- Numéro de commande
- Instructions pour le paiement
- Options d'impression et retour

### 4. Provider de session - `/app/providers.tsx`
Wrapper pour NextAuth SessionProvider permettant l'utilisation de useSession dans toute l'application.

## Modifications de fichiers existants

### 1. Types - `/types/index.ts`
Ajout de :
- `OrderPackItem` : interface pour les packs dans les commandes
- Champ `packs?: OrderPackItem[]` dans `IOrder`

### 2. Modèle Order - `/lib/db/models/Order.ts`
Ajout du champ `packs` dans le schema Mongoose avec validation complète.

### 3. Layout principal - `/app/layout.tsx`
Ajout du `<Providers>` wrapper pour activer NextAuth dans toute l'application.

### 4. Panier - `/components/cart/cart-summary.tsx`
- Import de `useRouter` from 'next/navigation'
- Bouton "Passer commande" redirige vers `/checkout`

## Modes de paiement

### Chèque (check)
- Statut: ✅ Fonctionnel
- Enregistre la commande avec `paymentMethod: 'check'` et `status: 'pending'`

### Liquide (cash)
- Statut: ✅ Fonctionnel
- Enregistre la commande avec `paymentMethod: 'cash'` et `status: 'pending'`

### Stripe (online)
- Statut: 🚧 Non implémenté
- Option désactivée dans l'interface avec message "bientôt disponible"
- Message d'erreur si tentative de sélection

## Flux utilisateur

1. **Panier** : L'utilisateur ajoute des photos/packs au panier
2. **Checkout** : Clic sur "Passer commande" → redirection vers `/checkout`
3. **Sélection paiement** : Choix entre chèque ou liquide
4. **Notes** : Ajout optionnel de notes
5. **Validation** : Création de la commande en base de données
6. **Confirmation** : Affichage du numéro de commande et des instructions
7. **Panier vidé** : Le panier est automatiquement vidé après validation

## Structure de la commande en base

```typescript
{
  orderNumber: "ORD-20251025-00001",
  studentIds: ["student_id"],
  schoolId: "school_id",
  items: [
    {
      photoUrl: "url",
      format: "10x15",
      quantity: 2,
      unitPrice: 5.99,
      subtotal: 11.98
    }
  ],
  packs: [
    {
      packId: "pack_id",
      packName: "L",
      packPrice: 29.99,
      quantity: 1,
      subtotal: 29.99,
      photosCount: 15
    }
  ],
  totalAmount: 41.97,
  paymentMethod: "check", // ou "cash", "online", "pending"
  status: "pending",
  createdAt: Date,
  updatedAt: Date
}
```

## Sécurité

- ✅ Protection par authentification (useSession)
- ✅ Vérification que l'utilisateur est connecté
- ✅ Récupération automatique du studentId depuis la session
- ✅ Validation côté serveur dans l'action

## Prochaines étapes (Stripe)

Pour implémenter Stripe :
1. Installer `@stripe/stripe-js` et `stripe`
2. Créer une API route `/api/create-payment-intent`
3. Ajouter le composant Stripe Elements dans checkout
4. Gérer le webhook Stripe pour la confirmation
5. Mettre à jour le statut de la commande après paiement

## Test

Pour tester :
1. Se connecter en tant qu'étudiant
2. Ajouter des items au panier
3. Cliquer sur "Passer commande"
4. Sélectionner "Chèque" ou "Espèces"
5. Valider la commande
6. Vérifier la création en base de données
