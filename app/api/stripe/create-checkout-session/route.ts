import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { connectDB } from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import mongoose from 'mongoose';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Valider l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: 'Invalid Order ID' },
        { status: 400 }
      );
    }

    // Récupérer la commande depuis MongoDB
    await connectDB();
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Vérifier que la commande n'est pas déjà payée
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not in pending status' },
        { status: 400 }
      );
    }

    // Préparer les line items pour Stripe
    interface LineItemData {
      quantity: number;
      unitPrice: number;
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Ajouter les photos individuelles
    if (order.items && order.items.length > 0) {
      const itemsByFormat = order.items.reduce((acc: Record<string, LineItemData>, item: typeof order.items[0]) => {
        const key = item.format || 'Photo';
        if (!acc[key]) {
          acc[key] = {
            quantity: 0,
            unitPrice: item.unitPrice || 0,
          };
        }
        acc[key].quantity += item.quantity || 1;
        return acc;
      }, {} as Record<string, LineItemData>);

      Object.entries(itemsByFormat).forEach(([format, data]: [string, LineItemData]) => {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Photo ${format}`,
              description: `Format ${format}`,
            },
            unit_amount: Math.round(data.unitPrice * 100), // Stripe utilise les centimes
          },
          quantity: data.quantity,
        });
      });
    }

    // Ajouter les packs
    if (order.packs && order.packs.length > 0) {
      order.packs.forEach((pack: typeof order.packs[0]) => {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Pack ${pack.packName}`,
              description: `${pack.photosCount} photos`,
            },
            unit_amount: Math.round(pack.packPrice * 100),
          },
          quantity: pack.quantity || 1,
        });
      });
    }

    // Préparer les informations pour Stripe metadata
    const studentIds = order.studentIds.map((id: typeof order.studentIds[0]) => id.toString());
    const classIds = new Set<string>();

    // Collecter les classes depuis les items et packs
    if (order.items && order.items.length > 0) {
      order.items.forEach((item: typeof order.items[0]) => {
        if (item.classId) classIds.add(item.classId);
      });
    }

    if (order.packs && order.packs.length > 0) {
      order.packs.forEach((pack: typeof order.packs[0]) => {
        if (pack.classId) classIds.add(pack.classId);
      });
    }

    // Créer une description lisible pour le dashboard Stripe
    const itemsCount = (order.items?.length || 0) + (order.packs?.length || 0);
    const description = `Commande ${order.orderNumber} - ${itemsCount} article(s)`;

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/order-confirmation?orderNumber=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
      metadata: {
        orderId: orderId.toString(),
        orderNumber: order.orderNumber,
        studentIds: JSON.stringify(studentIds),
        schoolId: order.schoolId?.toString() || '',
        classIds: Array.from(classIds).join(', '),
      },
      customer_email: order.email,
      payment_intent_data: {
        description: description,
        metadata: {
          orderId: orderId.toString(),
          orderNumber: order.orderNumber,
          studentIds: JSON.stringify(studentIds),
          schoolId: order.schoolId?.toString() || '',
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
