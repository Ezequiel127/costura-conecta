import { useState } from 'react';
import { ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { Professional, View } from '../types';
import { cities, skills, availabilities } from '../data';

interface ProfessionalAreaProps {
  onRegister: (professional: Professional) => void;
  onNavigate: (view: View) => void;
}

export default function ProfessionalArea({ onRegister, onNavigate }: ProfessionalAreaProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [experience, setExperience] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || selectedSkills.length === 0 || !availability || !whatsapp) return;

    const newProfessional: Professional = {
      id: Date.now().toString(),
      name,
      city,
      skills: selectedSkills,
      availability,
      experience,
      whatsapp,
    };

    onRegister(newProfessional);
    setSuccess(true);
    setName('');
    setCity('');
    setSelectedSkills([]);
    setAvailability('');
    setWhatsapp('');
    setExperience('');
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-petrol-700 text-white py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Área da Profissional</h1>
            <p className="text-sm text-petrol-200">Cadastre seu perfil e seja encontrada</p>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-8">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Cadastro realizado com sucesso! Seu perfil já está visível para empresas.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-5 h-5 text-petrol-600" />
            <h2 className="font-semibold text-navy-800 text-lg">Cadastro de profissional</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="label-field">Nome completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label className="label-field">Cidade *</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field" required>
                <option value="">Selecione sua cidade</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Habilidades *</label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-petrol-500 text-white border-petrol-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-petrol-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-field">Disponibilidade *</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Selecione</option>
                {availabilities.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">WhatsApp *</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="input-field"
                placeholder="(89) 99999-0000"
                required
              />
            </div>

            <div>
              <label className="label-field">Experiência</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="input-field min-h-[80px] resize-none"
                placeholder="Conte um pouco sobre sua experiência..."
              />
            </div>

            <button type="submit" className="btn-secondary w-full flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Cadastrar perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
