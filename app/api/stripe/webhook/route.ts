import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { connectDB } from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import Stripe from 'stripe';

// Désactiver le body parser de Next.js pour recevoir le raw body
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Gérer les événements Stripe
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('💰 Paiement réussi:', session.id);
        console.log('   Order ID:', session.metadata?.orderId);
        console.log('   Order Number:', session.metadata?.orderNumber);

        // Récupérer l'ID de la commande depuis les métadonnées
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error('❌ No orderId in session metadata');
          break;
        }

        // Mettre à jour le statut de la commande dans MongoDB
        await connectDB();

        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            status: 'paid',
            paymentMethod: 'online',
            paidAt: new Date(),
          },
          { new: true }
        );

        if (updatedOrder) {
          console.log('✅ Commande mise à jour:', updatedOrder.orderNumber);
        } else {
          console.error('❌ Commande non trouvée:', orderId);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('⏰ Session expirée:', session.id);
        // Optionnel: marquer la commande comme expirée ou la supprimer
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Paiement échoué:', paymentIntent.id);
        // Optionnel: notifier l'utilisateur ou marquer la commande
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
