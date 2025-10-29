"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { useRouter } from "next/navigation";

export function MobileCartButton() {
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <button
      onClick={() => {
        console.log("🛒 [MobileCartButton] Clic - Navigation vers /checkout");
        router.push("/checkout");
      }}
      className="fixed top-4 right-4 z-50 bg-[#192F84] hover:bg-[#1a3699] text-white rounded-full p-3 shadow-lg transition-colors md:hidden flex items-center justify-center"
      aria-label="Voir le panier"
    >
      {/* Icône panier SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
}
