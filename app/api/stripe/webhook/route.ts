import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { connectDB } from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import Student from '@/lib/db/models/Student';
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation';
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

          // Récupérer les infos de l'étudiant pour l'email
          console.log('📧 Préparation envoi email confirmation...');
          try {
            const studentId = updatedOrder.studentIds && updatedOrder.studentIds.length > 0
              ? updatedOrder.studentIds[0]
              : null;

            let studentName = 'Client';
            if (studentId) {
              const student = await Student.findById(studentId).lean();
              if (student) {
                studentName = `${student.firstName} ${student.lastName}`;
              }
            }

            // Envoyer l'email
            const emailResult = await sendOrderConfirmationEmail({
              to: updatedOrder.email,
              orderNumber: updatedOrder.orderNumber,
              studentName: studentName,
              items: (updatedOrder.items || []).map((item) => ({
                format: item.format,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
              })),
              packs: (updatedOrder.packs || []).map((pack) => ({
                packName: pack.packName,
                quantity: pack.quantity,
                packPrice: pack.packPrice,
                subtotal: pack.subtotal,
                photosCount: pack.photosCount,
              })),
              totalAmount: updatedOrder.totalAmount,
              paymentMethod: 'online',
              notes: updatedOrder.notes,
            });

            if (emailResult.success) {
              console.log('✅ Email de confirmation envoyé');
            } else {
              console.error('❌ Erreur envoi email:', emailResult.error);
            }
          } catch (emailErr) {
            console.error('❌ Exception envoi email dans webhook:', emailErr);
          }
        } else {
          console.error('❌ Commande non trouvée:', orderId);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('⏰ Session expirée:', session.id);

        const orderId = session.metadata?.orderId;
        if (orderId) {
          await connectDB();

          // Supprimer la commande expirée (session abandonnée après 24h)
          const deletedOrder = await Order.findByIdAndDelete(orderId);

          if (deletedOrder) {
            console.log('🗑️  Commande expirée supprimée:', deletedOrder.orderNumber);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Paiement échoué:', paymentIntent.id);

        // Récupérer l'orderId depuis les metadata du payment intent
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await connectDB();

          await Order.findByIdAndUpdate(orderId, {
            status: 'pending',
            notes: `Paiement échoué: ${paymentIntent.last_payment_error?.message || 'Erreur inconnue'}`,
          });

          console.log('⚠️  Commande marquée comme échec paiement:', orderId);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('💸 Remboursement:', charge.id);

        // Récupérer l'orderId depuis les metadata
        const orderId = charge.metadata?.orderId;
        if (orderId) {
          await connectDB();

          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
              status: 'pending', // Retour en pending après remboursement
              notes: `Remboursé le ${new Date().toLocaleDateString('fr-FR')}`,
            },
            { new: true }
          );

          if (updatedOrder) {
            console.log('💰 Commande remboursée:', updatedOrder.orderNumber);
          }
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log('⚠️  Litige créé:', dispute.id);

        // Récupérer l'orderId depuis le charge
        const charge = await stripe.charges.retrieve(dispute.charge as string);
        const orderId = charge.metadata?.orderId;

        if (orderId) {
          await connectDB();

          await Order.findByIdAndUpdate(orderId, {
            notes: `⚠️ LITIGE: ${dispute.reason} - Montant: ${dispute.amount / 100}€`,
          });

          console.log('🚨 Commande en litige:', orderId);
        }
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
