import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  Loader2 as LoaderCircle,
  MapPin,
  Phone,
  Search,
  Star,
} from 'lucide-react';
import { Professional, View } from '../types';
import { cities, skills, availabilities } from '../data';
import { getProfessionalProfiles } from '../services/professionalProfileService';
import { getCurrentCompanyProfile } from '../services/companyProfileService';
import CompanyProfileForm from './CompanyProfileForm';

interface CompanyAreaProps {
  user: User | null;
  onNavigate: (view: View) => void;
}

type CompanyProfileState = 'loading' | 'unauthenticated' | 'missing' | 'existing' | 'error';

export default function CompanyArea({ user, onNavigate }: CompanyAreaProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [companyProfileState, setCompanyProfileState] = useState<CompanyProfileState>('loading');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfessionals = async () => {
      try {
        const profiles = await getProfessionalProfiles();

        if (isMounted) {
          setProfessionals(profiles);
        }
      } catch {
        if (isMounted) {
          setLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfessionals();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCompanyProfile = async () => {
      setCompanyProfileState('loading');
      setRegistrationSuccess(false);

      const result = await getCurrentCompanyProfile();

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setCompanyProfileState(
          result.reason === 'unauthenticated' ? 'unauthenticated' : 'error'
        );
        return;
      }

      setCompanyProfileState(result.profile ? 'existing' : 'missing');
    };

    void loadCompanyProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCompanyCreated = () => {
    setRegistrationSuccess(true);
    setCompanyProfileState('existing');
  };

  const handleCompanyAlreadyExists = () => {
    setRegistrationSuccess(false);
    setCompanyProfileState('existing');
  };

  const filtered = professionals.filter((p) => {
    if (cityFilter && p.city !== cityFilter) return false;
    if (skillFilter && !p.skills.includes(skillFilter)) return false;
    if (availFilter && p.availability !== availFilter) return false;
    return true;
  });

  const hasFilters = cityFilter || skillFilter || availFilter;

  const getWhatsAppUrl = (whatsapp: string) => {
    const digits = whatsapp.replace(/\D/g, '');
    const number = digits.startsWith('55') ? digits : `55${digits}`;

    return `https://wa.me/${number}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy-800 text-white py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('landing')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Área da Empresa</h1>
              <p className="text-sm text-navy-300">Encontre profissionais da costura</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('jobs')}
            className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Vagas
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {companyProfileState === 'loading' && (
          <div className={'card mb-8 flex items-center gap-3 text-gray-600'} role={'status'}>
            <LoaderCircle className={'w-5 h-5 animate-spin text-navy-600'} />
            <p className={'text-sm'}>Verificando cadastro empresarial...</p>
          </div>
        )}

        {companyProfileState === 'error' && (
          <div
            className={'mb-8 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3'}
            role={'alert'}
          >
            <AlertCircle className={'w-5 h-5 flex-shrink-0'} />
            <p className={'text-sm font-medium'}>
              Não foi possível verificar o cadastro empresarial agora. Tente novamente mais tarde.
            </p>
          </div>
        )}

        {companyProfileState === 'unauthenticated' && (
          <div className={'card mb-8 flex items-start gap-3'}>
            <Building2 className={'w-5 h-5 flex-shrink-0 text-navy-600 mt-0.5'} />
            <div>
              <h2 className={'font-semibold text-navy-800'}>Cadastre sua empresa</h2>
              <p className={'text-sm text-gray-600 mt-1'}>
                Entre com sua conta para cadastrar uma empresa. A busca de profissionais continua disponível abaixo.
              </p>
            </div>
          </div>
        )}

        {companyProfileState === 'missing' && (
          <CompanyProfileForm
            onCreated={handleCompanyCreated}
            onAlreadyExists={handleCompanyAlreadyExists}
          />
        )}

        {companyProfileState === 'existing' && (
          <div
            className={'mb-8 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-3'}
            role={'status'}
          >
            <CheckCircle className={'w-5 h-5 flex-shrink-0'} />
            <p className={'text-sm font-medium'}>
              {registrationSuccess
                ? 'Empresa cadastrada com sucesso.'
                : 'Esta conta já possui uma empresa cadastrada.'}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-navy-600" />
            <h2 className="font-semibold text-navy-800">Filtrar profissionais</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Cidade</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Todas as cidades</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Habilidade</label>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Todas as habilidades</option>
                {skills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Disponibilidade</label>
              <select
                value={availFilter}
                onChange={(e) => setAvailFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Todas</option>
                {availabilities.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={() => { setCityFilter(''); setSkillFilter(''); setAvailFilter(''); }}
              className="mt-3 text-sm text-petrol-600 hover:text-petrol-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {!isLoading && !loadError && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} profissional{filtered.length !== 1 ? 'is' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Professional cards */}
        {!isLoading && !loadError && (
          <div className="grid sm:grid-cols-2 gap-6">
            {filtered.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-navy-800 text-lg">{p.name}</h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  p.availability === 'Integral'
                    ? 'bg-green-50 text-green-700'
                    : p.availability === 'Meio período'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {p.availability}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {p.city}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-gray-400" />
                  {p.experience}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {p.availability}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5 text-amber-400" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">5,0</span> · Avaliação demonstrativa
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-petrol-50 text-petrol-700 px-2.5 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <a
                href={getWhatsAppUrl(p.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Entrar em contato
              </a>
            </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16" role="status">
            <p className="text-gray-500">Carregando profissionais...</p>
          </div>
        )}

        {loadError && (
          <div className="text-center py-16" role="alert">
            <p className="text-red-600">Não foi possível carregar os profissionais. Tente novamente mais tarde.</p>
          </div>
        )}

        {!isLoading && !loadError && professionals.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum perfil profissional cadastrado.</p>
          </div>
        )}

        {!isLoading && !loadError && professionals.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum profissional encontrado com esses filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
