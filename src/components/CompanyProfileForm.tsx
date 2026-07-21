import { useState } from 'react';
import { AlertCircle, Building2, Loader2 as LoaderCircle } from 'lucide-react';
import {
  createCompanyProfile,
  type CompanyProfileInput,
} from '../services/companyProfileService';

interface CompanyProfileFormProps {
  onCreated: () => void;
  onAlreadyExists: () => void;
}

const emptyProfile: CompanyProfileInput = {
  name: '',
  phone: '',
  city: '',
  business_type: '',
  email: '',
  address: '',
  description: '',
};

const errorMessages = {
  unauthenticated: 'Você precisa entrar com sua conta antes de cadastrar uma empresa.',
  unexpected: 'Não foi possível salvar o cadastro agora. Tente novamente mais tarde.',
};

export default function CompanyProfileForm({
  onCreated,
  onAlreadyExists,
}: CompanyProfileFormProps) {
  const [profile, setProfile] = useState<CompanyProfileInput>(emptyProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateField = (field: keyof CompanyProfileInput, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const trimmedProfile: CompanyProfileInput = {
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      city: profile.city.trim(),
      business_type: profile.business_type.trim(),
      email: profile.email.trim(),
      address: profile.address.trim(),
      description: profile.description.trim(),
    };

    const requiredFields = [
      trimmedProfile.name,
      trimmedProfile.phone,
      trimmedProfile.city,
      trimmedProfile.business_type,
    ];

    if (requiredFields.some((value) => !value)) {
      setErrorMessage('Preencha todos os campos obrigatórios antes de continuar.');
      return;
    }

    setIsSubmitting(true);
    const result = await createCompanyProfile(trimmedProfile);
    setIsSubmitting(false);

    if (!result.success) {
      if (result.reason === 'already_exists') {
        onAlreadyExists();
        return;
      }

      setErrorMessage(errorMessages[result.reason]);
      return;
    }

    setProfile(emptyProfile);
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className={'card mb-8'}>
      <div className={'flex items-center gap-2 mb-6'}>
        <Building2 className={'w-5 h-5 text-navy-600'} />
        <div>
          <h2 className={'font-semibold text-navy-800 text-lg'}>Cadastro da empresa</h2>
          <p className={'text-sm text-gray-500'}>Informe os dados básicos da sua empresa.</p>
        </div>
      </div>

      {errorMessage && (
        <div
          role={'alert'}
          className={'mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3'}
        >
          <AlertCircle className={'w-5 h-5 flex-shrink-0'} />
          <span className={'text-sm font-medium'}>{errorMessage}</span>
        </div>
      )}

      <div className={'grid sm:grid-cols-2 gap-5'}>
        <div>
          <label htmlFor={'company-name'} className={'label-field'}>Nome da empresa *</label>
          <input
            id={'company-name'}
            type={'text'}
            value={profile.name}
            onChange={(event) => updateField('name', event.target.value)}
            className={'input-field'}
            placeholder={'Nome da empresa'}
            autoComplete={'organization'}
            required
          />
        </div>

        <div>
          <label htmlFor={'company-phone'} className={'label-field'}>Telefone *</label>
          <input
            id={'company-phone'}
            type={'tel'}
            value={profile.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            className={'input-field'}
            placeholder={'(89) 99999-0000'}
            autoComplete={'tel'}
            required
          />
        </div>
        <div>
          <label htmlFor={'company-city'} className={'label-field'}>Cidade *</label>
          <input
            id={'company-city'}
            type={'text'}
            value={profile.city}
            onChange={(event) => updateField('city', event.target.value)}
            className={'input-field'}
            placeholder={'Picos'}
            autoComplete={'address-level2'}
            required
          />
        </div>

        <div>
          <label htmlFor={'company-business-type'} className={'label-field'}>Tipo de negócio *</label>
          <input
            id={'company-business-type'}
            type={'text'}
            value={profile.business_type}
            onChange={(event) => updateField('business_type', event.target.value)}
            className={'input-field'}
            placeholder={'Confecção, ateliê ou loja'}
            required
          />
        </div>
        <div>
          <label htmlFor={'company-email'} className={'label-field'}>E-mail</label>
          <input
            id={'company-email'}
            type={'email'}
            value={profile.email}
            onChange={(event) => updateField('email', event.target.value)}
            className={'input-field'}
            placeholder={'contato@empresa.com'}
            autoComplete={'email'}
          />
        </div>

        <div>
          <label htmlFor={'company-address'} className={'label-field'}>Endereço</label>
          <input
            id={'company-address'}
            type={'text'}
            value={profile.address}
            onChange={(event) => updateField('address', event.target.value)}
            className={'input-field'}
            placeholder={'Rua, número e bairro'}
            autoComplete={'street-address'}
          />
        </div>
        <div className={'sm:col-span-2'}>
          <label htmlFor={'company-description'} className={'label-field'}>Descrição</label>
          <textarea
            id={'company-description'}
            value={profile.description}
            onChange={(event) => updateField('description', event.target.value)}
            className={'input-field min-h-[90px] resize-none'}
            placeholder={'Conte brevemente sobre a empresa...'}
          />
        </div>

        <button
          type={'submit'}
          disabled={isSubmitting}
          className={'btn-primary sm:col-span-2 w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60'}
        >
          {isSubmitting ? (
            <LoaderCircle className={'w-5 h-5 animate-spin'} />
          ) : (
            <Building2 className={'w-5 h-5'} />
          )}
          {isSubmitting ? 'Salvando...' : 'Cadastrar empresa'}
        </button>
      </div>
    </form>
  );
}
