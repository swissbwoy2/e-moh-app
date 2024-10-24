import { RegisterFormData } from '../../../types/register';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface Props {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export const RegisterFormFields = ({ register, errors }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Informations personnelles */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            {...register('email', { required: 'Email requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom *</label>
          <input
            type="text"
            {...register('firstName', { required: 'Prénom requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nom de famille *</label>
          <input
            type="text"
            {...register('lastName', { required: 'Nom de famille requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone *</label>
          <input
            type="tel"
            {...register('phone', { required: 'Téléphone requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
        </div>

        {/* Situation de logement actuelle */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Gérance actuelle *</label>
          <input
            type="text"
            {...register('currentAgency', { required: 'Gérance actuelle requise' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.currentAgency && <span className="text-red-500 text-sm">{errors.currentAgency.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Loyer actuel *</label>
          <input
            type="number"
            {...register('currentRent', { required: 'Loyer actuel requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.currentRent && <span className="text-red-500 text-sm">{errors.currentRent.message}</span>}
        </div>

        {/* Situation professionnelle */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Profession *</label>
          <input
            type="text"
            {...register('profession', { required: 'Profession requise' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.profession && <span className="text-red-500 text-sm">{errors.profession.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Employeur *</label>
          <input
            type="text"
            {...register('employer', { required: 'Employeur requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.employer && <span className="text-red-500 text-sm">{errors.employer.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Revenu mensuel net *</label>
          <input
            type="number"
            {...register('monthlyIncome', { required: 'Revenu mensuel requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.monthlyIncome && <span className="text-red-500 text-sm">{errors.monthlyIncome.message}</span>}
        </div>
      </div>

      {/* Critères de recherche */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type de bien *</label>
          <select
            {...register('propertyType', { required: 'Type de bien requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Sélectionnez</option>
            <option value="HOUSE">Villa & maison</option>
            <option value="APARTMENT">Appartement</option>
            <option value="COLOCATION">Colocation</option>
            <option value="SUBLET">Sous-location</option>
            <option value="COMMERCIAL">Local commercial</option>
            <option value="OTHER">Autre</option>
          </select>
          {errors.propertyType && <span className="text-red-500 text-sm">{errors.propertyType.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre de pièces *</label>
          <select
            {...register('roomsCount', { required: 'Nombre de pièces requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Sélectionnez</option>
            <option value="1+">1+</option>
            <option value="2+">2+</option>
            <option value="3+">3+</option>
            <option value="4+">4+</option>
            <option value="5+">5+</option>
            <option value="OTHER">Autre</option>
          </select>
          {errors.roomsCount && <span className="text-red-500 text-sm">{errors.roomsCount.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Région *</label>
          <select
            {...register('region', { required: 'Région requise' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Sélectionnez</option>
            <option value="LAUSANNE">Lausanne et région</option>
            <option value="OUEST">Ouest lausannois</option>
            <option value="LAVAUX">Lavaux</option>
            <option value="RIVIERA">Riviera</option>
            <option value="CHABLAIS">Chablais</option>
            <option value="NORD">Nord vaudois</option>
            <option value="BROYE">Broye</option>
            <option value="GROS_DE_VAUD">Gros-de-Vaud</option>
          </select>
          {errors.region && <span className="text-red-500 text-sm">{errors.region.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Budget maximum *</label>
          <input
            type="number"
            {...register('maxBudget', { required: 'Budget maximum requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.maxBudget && <span className="text-red-500 text-sm">{errors.maxBudget.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Exigences particulières</label>
          <textarea
            {...register('specificRequirements')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterFormFields;
