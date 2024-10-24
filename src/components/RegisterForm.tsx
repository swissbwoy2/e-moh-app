'use client';

import { useAuth } from '@/contexts/AuthContext';
import { createMandate } from '@/lib/mandate';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Basic registration form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Additional user information
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    birthDate: '',
    nationality: '',
    residencePermit: '',
    maritalStatus: '',
    currentPropertyManager: '',
    propertyManagerContact: '',
    currentRent: '',
    livingAtCurrentAddressSince: '',
    currentRooms: '',
    extraordinaryCharges: false,
    chargesDetails: '',
    hasProsecution: false,
    hasGuardianship: false,
    reasonForMoving: '',
    profession: '',
    employer: '',
    monthlyIncome: '',
    employmentStartDate: '',
    usageType: 'Principal',
    userId: user?.uid || '',
  });

  // Files for upload
  const [files, setFiles] = useState({
    prosecutionRecord: null as File | null,
    payslips: [] as File[],
    identityDocument: null as File | null
  });

  // Handle file uploads
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    if (!event.target.files) return;
    
    if (type === 'payslips') {
      setFiles(prev => ({
        ...prev,
        payslips: Array.from(event.target.files || []).slice(0, 3)
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        [type]: event.target.files?.[0] || null
      }));
    }
  };

  // Handle form submission for each step
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      switch (step) {
        case 1: // Basic registration
          if (formData.password !== formData.confirmPassword) {
            throw new Error("Passwords don't match");
          }
          await signUp(formData.email, formData.password);
          setStep(2);
          break;

        case 2: // Additional information
          // Validate required fields
          const requiredFields = ['firstName', 'lastName', 'phone', 'address'];
          for (const field of requiredFields) {
            if (!userInfo[field as keyof typeof userInfo]) {
              throw new Error(`${field} is required`);
            }
          }
          setStep(3);
          break;

        case 3: // Document upload
          if (!files.prosecutionRecord || !files.identityDocument || files.payslips.length < 3) {
            throw new Error('Please upload all required documents');
          }
          
          if (!user?.uid) {
            throw new Error('User not authenticated');
          }

          // Update userInfo with current user ID
          const updatedUserInfo = {
            ...userInfo,
            userId: user.uid
          };
          
          // Create mandate document in Firestore
          await createMandate(updatedUserInfo, files);
          
          // Proceed to payment
          router.push('/register/payment');
          break;
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      setStep(2); // Skip email/password step
    } catch (err: any) {
      setError(err.message);
      console.error('Google sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {step === 1 && (
        <>
          {/* Basic Registration Fields */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* Personal Information Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Add all personal information fields */}
            {/* Example field: */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                required
                value={userInfo.firstName}
                onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          {/* Document Upload Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prosecution Record (last 3 months) *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'prosecutionRecord')}
                className="mt-1 block w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last 3 Payslips *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleFileChange(e, 'payslips')}
                className="mt-1 block w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID/Residence Permit *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'identityDocument')}
                className="mt-1 block w-full"
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          {loading
            ? 'Processing...'
            : step === 3
            ? 'Submit and Proceed to Payment'
            : 'Continue'}
        </button>
      </div>
    </form>
  );
};