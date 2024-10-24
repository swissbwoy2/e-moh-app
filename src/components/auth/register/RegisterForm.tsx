import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { RegisterFormData } from '../../../types/register';
import { RegisterFormFields } from './RegisterFormFields';
import { useStripePayment } from '../../../hooks/useStripePayment';

export const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { handlePayment, isLoading: isPaymentLoading } = useStripePayment();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Effectuer le paiement
      const paymentSuccess = await handlePayment();
      if (!paymentSuccess) {
        throw new Error('Le paiement a échoué');
      }

      // Soumettre le formulaire
      // TODO: Ajouter la logique de soumission du formulaire

      router.push('/register/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-8">Mandat de recherche pour un logement à louer</h1>
        
        <RegisterFormFields register={register} errors={errors} />

        {/* Section des documents */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Documents requis</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Veuillez fournir les documents suivants :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
              <li>Extrait de l'office des poursuites (moins de 3 mois)</li>
              <li>3 dernières fiches de salaire</li>
              <li>Copie de la pièce d'identité ou du permis de séjour</li>
            </ul>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              {...register('documents', { required: 'Documents requis' })}
              className="mt-2"
            />
            {errors.documents && (
              <span className="text-red-500 text-sm">{errors.documents.message}</span>
            )}
          </div>
        </div>

        {/* Conditions générales */}
        <div className="mt-8">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('termsAccepted', { required: 'Vous devez accepter les conditions' })}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Lu et approuvé *
            </span>
          </label>
          {errors.termsAccepted && (
            <span className="text-red-500 text-sm block mt-1">{errors.termsAccepted.message}</span>
          )}
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isPaymentLoading}
          className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isSubmitting || isPaymentLoading ? 'Traitement en cours...' : 'Soumettre la demande'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
