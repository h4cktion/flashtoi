"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { createOrder } from "@/lib/actions/order";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaymentMethod } from "@/types";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const packs = useCartStore((state) => state.packs);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const removePackFromCart = useCartStore((state) => state.removePackFromCart);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Récupérer le studentId depuis les items du panier (tous les items ont le même studentId)
  const studentId = items.length > 0 ? items[0].studentId : packs.length > 0 ? packs[0].studentId : null;

  // Marquer le composant comme monté pour éviter les problèmes d'hydratation
  useEffect(() => {
    console.log("🔵 [Checkout] Composant monté");
    setIsMounted(true);
  }, []);

  // Logs pour débugger
  useEffect(() => {
    console.log("🔍 [Checkout] État actuel:", {
      status,
      hasSession: !!session,
      sessionStudentId: session?.user?.studentId,
      cartStudentId: studentId,
      role: session?.user?.role,
      itemsCount: items.length,
      packsCount: packs.length,
      isMounted,
    });
  }, [status, session, items, packs, isMounted, studentId]);

  // Afficher un loader pendant l'hydratation du store SEULEMENT
  if (!isMounted) {
    console.log("🔄 [Checkout] Affichage loader (store non hydraté)");
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ [Checkout] Tout est OK - Affichage du checkout");

  const handleSubmitOrder = async () => {
    console.log("📝 [Checkout] Début handleSubmitOrder");

    if (!email.trim() || !email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    if (!paymentMethod || paymentMethod === null) {
      setError("Veuillez sélectionner un mode de paiement");
      return;
    }

    if (paymentMethod === "online") {
      setError("Le paiement en ligne sera bientôt disponible");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🔍 [Checkout] Vérification studentId dans handleSubmitOrder:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionStudentId: session?.user?.studentId,
        cartStudentId: studentId,
      });

      if (!studentId) {
        console.error("❌ [Checkout] Pas de studentId disponible");
        setError("Erreur: impossible de récupérer l'identifiant de l'élève");
        return;
      }

      // Préparer les données de la commande
      const orderData = {
        studentId: studentId,
        email: email.trim(),
        items: items.map((item) => ({
          photoUrl: item.photoUrl,
          format: item.format,
          plancheName: item.plancheName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
          student_id: item.student_id,
          classId: item.classId,
        })),
        packs: packs.map((pack) => ({
          packId: pack.packId,
          packName: pack.packName,
          packPrice: pack.packPrice,
          quantity: pack.quantity,
          subtotal: pack.packPrice * pack.quantity,
          photosCount: pack.photos.length,
          student_id: pack.student_id,
          classId: pack.classId,
          selectedClassPhotoId: pack.selectedClassPhotoId,
        })),
        totalAmount,
        paymentMethod: paymentMethod as PaymentMethod,
        notes: notes.trim() || undefined,
      };

      const result = await createOrder(orderData);

      if (result.success) {
        // Vider le panier
        clearCart();

        // Rediriger vers la page de confirmation
        router.push(
          `/order-confirmation?orderNumber=${result.data?.orderNumber}`
        );
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Error submitting order:", err);
      setError("Une erreur est survenue lors de la création de la commande");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && packs.length === 0) {
    console.log("🛒 [Checkout] Panier vide - Affichage message");
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-6">
              Ajoutez des photos à votre panier pour passer commande
            </p>
            <button
              onClick={() => {
                console.log("🔙 [Checkout] Clic sur Retour");
                router.back();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
            >
              Retour à la galerie
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("🎉 [Checkout] Rendu final du formulaire checkout");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finaliser la commande
          </h1>
          <p className="text-gray-600">
            Vérifiez votre commande et choisissez votre mode de paiement
          </p>
        </div>

        {/* Email */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Email</h2>
          <p className="text-sm text-gray-600 mb-3">
            Votre adresse email pour recevoir la confirmation de commande
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Récapitulatif de la commande */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>

          {/* Packs */}
          {packs.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Packs</h3>
              <div className="space-y-2">
                {packs.map((pack) => (
                  <div
                    key={pack.packId}
                    className="flex justify-between items-center text-sm bg-blue-50 p-3 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium">Pack {pack.packName}</p>
                      <p className="text-gray-600 text-xs">
                        {pack.photos.length} photos × {pack.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">
                        {(pack.packPrice * pack.quantity).toFixed(2)} €
                      </p>
                      <button
                        onClick={() => removePackFromCart(pack.packId, pack.studentId)}
                        className="text-red-500 hover:text-red-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 transition-colors"
                        aria-label="Supprimer ce pack"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos individuelles */}
          {items.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">
                Photos individuelles
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={`${item.photoUrl}-${item.format}-${index}`}
                    className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.format}</p>
                      <p className="text-gray-600 text-xs">
                        {item.unitPrice.toFixed(2)} € × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">
                        {(item.unitPrice * item.quantity).toFixed(2)} €
                      </p>
                      <button
                        onClick={() => removeFromCart(item.photoUrl, item.format, item.studentId)}
                        className="text-red-500 hover:text-red-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 transition-colors"
                        aria-label="Supprimer cette photo"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                {totalAmount.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Mode de paiement */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Mode de paiement</h2>

          <div className="space-y-3">
            {/* Chèque */}
            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="check"
                checked={paymentMethod === "check"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Chèque</p>
                <p className="text-sm text-gray-600 mt-1">
                  Payez par chèque à l&apos;ordre de l&apos;école
                </p>
              </div>
            </label>

            {/* Liquide */}
            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Espèces</p>
                <p className="text-sm text-gray-600 mt-1">
                  Payez en espèces directement à l&apos;école
                </p>
              </div>
            </label>

            {/* Stripe (désactivé) */}
            <label className="flex items-start p-4 border rounded-lg opacity-50 cursor-not-allowed bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                disabled
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Paiement en ligne (bientôt disponible)
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Payez en ligne par carte bancaire via Stripe
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes (optionnel)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des informations complémentaires pour votre commande..."
            rows={4}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded transition-colors"
            disabled={isLoading}
          >
            Retour
          </button>
          <button
            onClick={handleSubmitOrder}
            disabled={isLoading || !paymentMethod}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Création en cours..." : "Confirmer la commande"}
          </button>
        </div>
      </div>
    </div>
  );
}
