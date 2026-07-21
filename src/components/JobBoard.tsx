import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  Loader2 as LoaderCircle,
  MapPin,
  Plus,
  Wrench,
} from 'lucide-react';
import { Job, View } from '../types';
import { cities, skills } from '../data';
import { createJob, getJobs } from '../services/jobService';

interface JobBoardProps {
  onNavigate: (view: View) => void;
}

const publicationErrorMessages = {
  unauthenticated: 'Você precisa entrar com sua conta antes de publicar uma vaga.',
  missing_company_profile: 'Cadastre uma empresa antes de publicar uma vaga.',
  unexpected: 'Não foi possível publicar a vaga agora. Tente novamente mais tarde.',
};

function formatDateOnly(date: string) {
  const [year, month, day] = date.split('-');

  return day && month && year ? [day, month, year].join('/') : date;
}

export default function JobBoard({ onNavigate }: JobBoardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [skill, setSkill] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      const result = await getJobs();

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      setJobs(result.jobs);
      setIsLoading(false);
    };

    void loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(false);
    setSubmitError('');

    const jobInput = {
      title: title.trim(),
      city: city.trim(),
      skill: skill.trim(),
      deadline,
      description: description.trim(),
    };

    const requiredFields = Object.values(jobInput);

    if (
      requiredFields.some((value) => !value) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(jobInput.deadline)
    ) {
      setSubmitError('Preencha todos os campos obrigatórios antes de continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createJob(jobInput);

      if (!result.success) {
        setSubmitError(publicationErrorMessages[result.reason]);
        return;
      }

      setJobs((currentJobs) => [result.job, ...currentJobs]);
      setLoadError(false);
      setIsLoading(false);
      setSuccess(true);
      setTitle('');
      setCity('');
      setSkill('');
      setDeadline('');
      setDescription('');
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setSubmitError(publicationErrorMessages.unexpected);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy-800 text-white py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Vagas da Costura</h1>
            <p className="text-sm text-navy-300">Publique e encontre oportunidades</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Vaga publicada com sucesso!</span>
              </div>
            )}

            {submitError && (
              <div
                role={'alert'}
                className={'mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3'}
              >
                <AlertCircle className={'w-5 h-5 flex-shrink-0'} />
                <span className={'text-sm font-medium'}>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="card">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-navy-600" />
                <h2 className="font-semibold text-navy-800 text-lg">Publicar vaga</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label-field">Título da vaga *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    placeholder="Ex: Costureira Overlock"
                    required
                  />
                </div>

                <div>
                  <label className="label-field">Cidade *</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field" required>
                    <option value="">Selecione</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">Habilidade necessária *</label>
                  <select value={skill} onChange={(e) => setSkill(e.target.value)} className="input-field" required>
                    <option value="">Selecione</option>
                    {skills.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">Prazo *</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label-field">Descrição *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Descreva a vaga, turno, remuneração..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                  {isSubmitting ? 'Publicando...' : 'Publicar vaga'}
                </button>
              </div>
            </form>
          </div>

          {/* Job list */}
          <div className="lg:col-span-3">
            <h2 className="font-semibold text-navy-800 text-lg mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Vagas publicadas ({jobs.length})
            </h2>

            {isLoading ? (
              <div className="card text-center py-12" role="status">
                <LoaderCircle className="w-8 h-8 text-navy-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Carregando vagas...</p>
              </div>
            ) : loadError ? (
              <div
                className="card text-center py-12 border-red-100"
                role="alert"
              >
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <p className="text-red-600">
                  Não foi possível carregar as vagas. Tente novamente mais tarde.
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="card text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma vaga publicada ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-navy-800">{job.title}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {job.createdAt}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {job.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-gray-400" />
                        {job.skill}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Prazo: {formatDateOnly(job.deadline)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{job.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
