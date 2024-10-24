import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const useStripePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 30000, // 300 CHF en centimes
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const { clientSecret } = await response.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Impossible de charger Stripe');
      }

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret);
      if (stripeError) {
        throw new Error(stripeError.message);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePayment,
    isLoading,
    error,
  };
};

export default useStripePayment;
