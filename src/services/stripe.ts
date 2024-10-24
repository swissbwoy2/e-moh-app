import { loadStripe } from '@stripe/stripe-js';
import { db } from '../config/firebase';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const createSubscriptionCheckoutSession = async (userId: string) => {
  try {
    const checkoutSessionRef = await addDoc(
      collection(db, 'users', userId, 'checkout_sessions'),
      {
        price: 'price_membership_90days', // Create this price ID in your Stripe dashboard
        success_url: window.location.origin + '/client/dashboard?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: window.location.origin,
      }
    );

    // Wait for the CheckoutSession to get attached by the extension
    onSnapshot(checkoutSessionRef, async (snap) => {
      const { sessionId } = snap.data() as { sessionId: string };
      if (sessionId) {
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId });
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const validateSubscription = async (userId: string): Promise<boolean> => {
  try {
    // Implementation to check subscription status
    // This would typically involve checking Firestore for active subscription
    return true;
  } catch (error) {
    console.error('Error validating subscription:', error);
    return false;
  }
};
