import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { SearchMandate } from '@/types/search-mandate';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function POST(request: Request) {
  try {
    const mandateData = await request.json();
    
    // Validate required documents
    if (!mandateData.prosecutionRecord || !mandateData.payslips || mandateData.payslips.length < 3 || !mandateData.identityDocument) {
      return NextResponse.json(
        { error: 'Missing required documents' },
        { status: 400 }
      );
    }

    // Validate monthly income vs max budget
    if (mandateData.maxBudget * 3 > mandateData.monthlyIncome) {
      return NextResponse.json(
        { error: 'Maximum budget should not exceed one-third of monthly income' },
        { status: 400 }
      );
    }

    // Create mandate document in Firestore
    const mandateRef = await addDoc(collection(db, 'search-mandates'), {
      ...mandateData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Search Mandate Activation (90 days)',
              description: 'Activation fee for property search services',
            },
            unit_amount: 30000, // 300 CHF in centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/mandate/success?mandate_id=${mandateRef.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/mandate/cancel?mandate_id=${mandateRef.id}`,
      metadata: {
        mandateId: mandateRef.id,
      },
    });

    // Update mandate with Stripe session ID
    await updateDoc(doc(db, 'search-mandates', mandateRef.id), {
      stripeSessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating search mandate:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { mandateId, action } = await request.json();

    if (!mandateId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const mandateRef = doc(db, 'search-mandates', mandateId);

    if (action === 'activate') {
      const activationDate = new Date();
      const expiryDate = new Date(activationDate.getTime() + 90 * 24 * 60 * 60 * 1000);

      await updateDoc(mandateRef, {
        status: 'approved',
        activationDate,
        expiryDate,
        updatedAt: new Date(),
      });
    } else if (action === 'reject') {
      await updateDoc(mandateRef, {
        status: 'rejected',
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating search mandate:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}