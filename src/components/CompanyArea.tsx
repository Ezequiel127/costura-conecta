import { useState } from 'react';
import { ArrowLeft, Search, MapPin, Clock, Star, Phone, Briefcase } from 'lucide-react';
import { Professional, View } from '../types';
import { cities, skills, availabilities } from '../data';

interface CompanyAreaProps {
  professionals: Professional[];
  onNavigate: (view: View) => void;
}

export default function CompanyArea({ professionals, onNavigate }: CompanyAreaProps) {
  const [cityFilter, setCityFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');

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

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} profissional{filtered.length !== 1 ? 'is' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Professional cards */}
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

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum profissional encontrado com esses filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
