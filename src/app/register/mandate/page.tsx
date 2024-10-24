'use client';

import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function MandatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
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
    hasAnimals: false,
    playsInstrument: false,
    hasVehicles: false,
    vehiclePlates: '',
    discoverySource: '',
    occupants: '',
    propertyType: '',
    rooms: '',
    region: [],
    maxBudget: '',
    specialRequirements: '',
    termsAccepted: false
  });

  const [files, setFiles] = useState({
    prosecutionRecord: null as File | null,
    payslips: [] as File[],
    identityDocument: null as File | null
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit a mandate');
      return;
    }

    if (!files.prosecutionRecord || !files.identityDocument || files.payslips.length < 3) {
      setError('Please upload all required documents');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload files
      const uploadFile = async (file: File, path: string) => {
        const storageRef = ref(storage, `${path}/${user.id}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
      };

      const [prosecutionRecordUrl, identityDocumentUrl] = await Promise.all([
        uploadFile(files.prosecutionRecord, 'prosecution-records'),
        uploadFile(files.identityDocument, 'identity-documents')
      ]);

      const payslipUrls = await Promise.all(
        files.payslips.map(file => uploadFile(file, 'payslips'))
      );

      // Create mandate document
      const mandateDoc = {
        ...formData,
        userId: user.id,
        status: 'pending',
        prosecutionRecord: prosecutionRecordUrl,
        payslips: payslipUrls,
        identityDocument: identityDocumentUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'mandates', user.id), mandateDoc);

      // Navigate to payment page
      router.push('/register/payment');
    } catch (err: any) {
      console.error('Error submitting mandate:', err);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              Search Mandate Form
            </h1>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  {/* Add form fields here based on formData state */}
                  {/* Example field: */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h2>
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
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700">
                      I accept the terms and conditions *
                    </label>
                    <p className="text-gray-500">
                      I confirm that all provided information is accurate and complete.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Submitting...' : 'Submit and Proceed to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}