'use client';

import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!user) {
      setError('You must be logged in to make a payment');
      return;
    }

    try {
      setLoading(true);
      
      // Create a payment session
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Activate Your Search Mandate
            </h1>
            
            <div className="mt-4 text-gray-600">
              <p>
                To activate your search mandate and start receiving property matches,
                a payment of 300 CHF is required. This amount will:
              </p>
              
              <ul className="mt-4 list-disc list-inside space-y-2">
                <li>Activate your account for 90 days</li>
                <li>Provide access to exclusive property listings</li>
                <li>Enable direct communication with real estate agents</li>
                <li>Grant access to property viewing scheduling</li>
              </ul>
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="mt-8">
              <div className="rounded-md bg-gray-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      90-Day Search Mandate
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Activate your property search with professional assistance
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-900">300 CHF</p>
                    <p className="mt-1 text-sm text-gray-500">One-time payment</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Payment Methods</h3>
                <div className="mt-2 space-y-3">
                  <div className="relative flex items-center">
                    <div className="flex items-center h-5">
                      <input
                        id="card"
                        name="payment-method"
                        type="radio"
                        defaultChecked
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="card" className="text-sm font-medium text-gray-700">
                        Credit/Debit Card
                      </label>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="flex items-center h-5">
                      <input
                        id="twint"
                        name="payment-method"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="twint" className="text-sm font-medium text-gray-700">
                        TWINT
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  By proceeding, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}