import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, PackCartItem, Cart } from '@/types';

interface CartStore extends Cart {
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (photoUrl: string, format: string) => void;
  updateQuantity: (photoUrl: string, format: string, quantity: number) => void;
  addPackToCart: (pack: Omit<PackCartItem, 'quantity'>) => void;
  removePackFromCart: (packId: string) => void;
  updatePackQuantity: (packId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartItem[], packs: PackCartItem[]) => {
  const itemsTotal = items.reduce((sum, item) => sum + item.quantity, 0);
  const packsTotal = packs.reduce((sum, pack) => sum + pack.quantity, 0);
  const totalItems = itemsTotal + packsTotal;

  const itemsAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const packsAmount = packs.reduce(
    (sum, pack) => sum + pack.packPrice * pack.quantity,
    0
  );
  const totalAmount = itemsAmount + packsAmount;

  return { totalItems, totalAmount };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      packs: [],
      totalItems: 0,
      totalAmount: 0,

      addToCart: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.photoUrl === item.photoUrl && i.format === item.format
          );

          let newItems: CartItem[];

          if (existingIndex >= 0) {
            newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
          } else {
            newItems = [...state.items, { ...item, quantity: 1 }];
          }

          const { totalItems, totalAmount } = calculateTotals(newItems, state.packs);

          return {
            items: newItems,
            packs: state.packs,
            totalItems,
            totalAmount,
          };
        });
      },

      removeFromCart: (photoUrl, format) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => !(item.photoUrl === photoUrl && item.format === format)
          );

          const { totalItems, totalAmount } = calculateTotals(newItems, state.packs);

          return {
            items: newItems,
            packs: state.packs,
            totalItems,
            totalAmount,
          };
        });
      },

      updateQuantity: (photoUrl, format, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(photoUrl, format);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.photoUrl === photoUrl && item.format === format
              ? { ...item, quantity }
              : item
          );

          const { totalItems, totalAmount } = calculateTotals(newItems, state.packs);

          return {
            items: newItems,
            packs: state.packs,
            totalItems,
            totalAmount,
          };
        });
      },

      addPackToCart: (pack) => {
        set((state) => {
          const existingIndex = state.packs.findIndex((p) => p.packId === pack.packId);

          let newPacks: PackCartItem[];

          if (existingIndex >= 0) {
            newPacks = [...state.packs];
            newPacks[existingIndex].quantity += 1;
          } else {
            newPacks = [...state.packs, { ...pack, quantity: 1 }];
          }

          const { totalItems, totalAmount } = calculateTotals(state.items, newPacks);

          return {
            items: state.items,
            packs: newPacks,
            totalItems,
            totalAmount,
          };
        });
      },

      removePackFromCart: (packId) => {
        set((state) => {
          const newPacks = state.packs.filter((pack) => pack.packId !== packId);

          const { totalItems, totalAmount } = calculateTotals(state.items, newPacks);

          return {
            items: state.items,
            packs: newPacks,
            totalItems,
            totalAmount,
          };
        });
      },

      updatePackQuantity: (packId, quantity) => {
        if (quantity <= 0) {
          get().removePackFromCart(packId);
          return;
        }

        set((state) => {
          const newPacks = state.packs.map((pack) =>
            pack.packId === packId ? { ...pack, quantity } : pack
          );

          const { totalItems, totalAmount } = calculateTotals(state.items, newPacks);

          return {
            items: state.items,
            packs: newPacks,
            totalItems,
            totalAmount,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          packs: [],
          totalItems: 0,
          totalAmount: 0,
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
