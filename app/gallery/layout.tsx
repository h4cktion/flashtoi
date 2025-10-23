import { CartProvider } from '@/components/cart/cart-context'
import { ReactNode } from 'react'

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}
