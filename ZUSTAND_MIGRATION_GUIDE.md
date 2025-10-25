# Guide de migration vers Zustand

Ce guide explique comment utiliser le nouveau store Zustand pour gérer le panier dans l'application.

## Installation

Zustand a été installé avec la commande :
```bash
npm install zustand
```

## Structure du store

Le store Zustand se trouve dans `/lib/stores/cart-store.ts` et remplace le `CartContext` React.

### Avantages de Zustand

1. **Pas besoin de Provider** : Contrairement au Context API, Zustand ne nécessite pas de wrapper Provider
2. **Performance** : Seuls les composants qui utilisent les données modifiées sont re-rendus
3. **Simplicité** : API plus simple et moins de boilerplate
4. **Persistance** : Le panier est automatiquement sauvegardé dans localStorage
5. **DevTools** : Support intégré pour Redux DevTools

## API du store

Le store expose les mêmes méthodes que le `CartContext` :

### État
- `items: CartItem[]` - Liste des photos individuelles
- `packs: PackCartItem[]` - Liste des packs
- `totalItems: number` - Nombre total d'items
- `totalAmount: number` - Montant total

### Méthodes
- `addToCart(item)` - Ajouter une photo au panier
- `removeFromCart(photoUrl, format)` - Retirer une photo
- `updateQuantity(photoUrl, format, quantity)` - Modifier la quantité d'une photo
- `addPackToCart(pack)` - Ajouter un pack
- `removePackFromCart(packId)` - Retirer un pack
- `updatePackQuantity(packId, quantity)` - Modifier la quantité d'un pack
- `clearCart()` - Vider le panier

## Utilisation dans les composants

### Exemple 1 : Afficher le compteur du panier

```tsx
'use client'

import { useCartStore } from '@/lib/stores/cart-store'

export function CartButton() {
  const totalItems = useCartStore((state) => state.totalItems)
  const totalAmount = useCartStore((state) => state.totalAmount)

  return (
    <button>
      Panier ({totalItems}) - {totalAmount.toFixed(2)} €
    </button>
  )
}
```

### Exemple 2 : Ajouter un item au panier

```tsx
'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { PhotoFormat } from '@/types'

export function PhotoCard({ photo, format, price }: Props) {
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = () => {
    addToCart({
      photoUrl: photo.cloudFrontUrl,
      format: format,
      unitPrice: price,
    })
  }

  return (
    <button onClick={handleAddToCart}>
      Ajouter au panier
    </button>
  )
}
```

### Exemple 3 : Afficher le contenu du panier

```tsx
'use client'

import { useCartStore } from '@/lib/stores/cart-store'

export function CartSummary() {
  const items = useCartStore((state) => state.items)
  const packs = useCartStore((state) => state.packs)
  const totalAmount = useCartStore((state) => state.totalAmount)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)

  return (
    <div>
      <h2>Votre panier</h2>

      {items.map((item) => (
        <div key={`${item.photoUrl}-${item.format}`}>
          <img src={item.photoUrl} alt="Photo" />
          <p>Format: {item.format}</p>
          <p>Prix unitaire: {item.unitPrice} €</p>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.photoUrl, item.format, parseInt(e.target.value))
            }
          />
          <button onClick={() => removeFromCart(item.photoUrl, item.format)}>
            Supprimer
          </button>
        </div>
      ))}

      <p>Total: {totalAmount.toFixed(2)} €</p>
    </div>
  )
}
```

### Exemple 4 : Ajouter un pack

```tsx
'use client'

import { useCartStore } from '@/lib/stores/cart-store'

export function PackCard({ pack, photos }: Props) {
  const addPackToCart = useCartStore((state) => state.addPackToCart)

  const handleAddPack = () => {
    addPackToCart({
      packId: pack._id.toString(),
      packName: pack.name,
      packPrice: pack.price,
      photos: photos,
    })
  }

  return (
    <button onClick={handleAddPack}>
      Ajouter le pack {pack.name}
    </button>
  )
}
```

## Migration depuis CartContext

### Avant (avec Context)
```tsx
import { useCart } from '@/components/cart/cart-context'

function MyComponent() {
  const { cart, addToCart, removeFromCart } = useCart()

  return <div>{cart.totalItems}</div>
}
```

### Après (avec Zustand)
```tsx
import { useCartStore } from '@/lib/stores/cart-store'

function MyComponent() {
  const totalItems = useCartStore((state) => state.totalItems)
  const addToCart = useCartStore((state) => state.addToCart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)

  return <div>{totalItems}</div>
}
```

## Points importants

1. **Sélecteurs** : Utilisez des sélecteurs pour n'extraire que les données nécessaires et optimiser les performances
   ```tsx
   // ✅ Bon - seule la valeur nécessaire
   const totalItems = useCartStore((state) => state.totalItems)

   // ❌ À éviter - tout le store
   const cart = useCartStore()
   ```

2. **Pas besoin de Provider** : Vous pouvez supprimer le `<CartProvider>` du layout

3. **Persistance automatique** : Le panier est sauvegardé dans localStorage avec la clé `cart-storage`

4. **'use client'** : N'oubliez pas la directive `'use client'` dans les composants utilisant le store

## Composants créés

- `/lib/stores/cart-store.ts` - Le store Zustand principal
- `/components/cart/cart-button.tsx` - Exemple de bouton panier avec compteur

## Prochaines étapes

Pour terminer la migration :

1. Remplacer les imports de `useCart` par `useCartStore` dans tous les composants
2. Adapter la syntaxe d'accès aux données (voir exemples ci-dessus)
3. Supprimer le `<CartProvider>` du layout principal
4. Supprimer ou archiver `/components/cart/cart-context.tsx`
5. Tester toutes les fonctionnalités du panier
