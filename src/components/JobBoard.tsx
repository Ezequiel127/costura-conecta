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
  Pencil,
  Phone,
  Plus,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import type { Job, View } from '../types';
import { cities, skills } from '../data';
import {
  createJob,
  deleteJob,
  getJobs,
  updateJob,
  type JobInput,
} from '../services/jobService';
import { getCurrentCompanyProfile } from '../services/companyProfileService';

interface JobBoardProps {
  user: User | null;
  onNavigate: (view: View) => void;
}

const publicationErrorMessages = {
  unauthenticated: 'Você precisa entrar com sua conta antes de publicar uma vaga.',
  missing_company_profile: 'Cadastre uma empresa antes de publicar uma vaga.',
  unexpected: 'Não foi possível publicar a vaga agora. Tente novamente mais tarde.',
};

const updateErrorMessages = {
  unauthenticated: 'Você precisa entrar com sua conta antes de editar uma vaga.',
  missing_company_profile: 'Cadastre uma empresa antes de editar uma vaga.',
  invalid_input: 'Revise os campos da vaga antes de salvar.',
  non_owned: 'Esta vaga não pertence à sua empresa ou não está mais disponível.',
  unexpected: 'Não foi possível salvar as alterações agora. Tente novamente mais tarde.',
};

const deleteErrorMessages = {
  unauthenticated: 'Você precisa entrar com sua conta antes de excluir uma vaga.',
  missing_company_profile: 'Cadastre uma empresa antes de excluir uma vaga.',
  non_owned: 'Esta vaga não pertence à sua empresa ou não está mais disponível.',
  unexpected: 'Não foi possível excluir a vaga agora. Tente novamente mais tarde.',
};

function formatDateOnly(date: string) {
  const [year, month, day] = date.split('-');

  return day && month && year ? [day, month, year].join('/') : date;
}

function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getJobInput(job: Job): JobInput {
  return {
    title: job.title,
    city: job.city,
    skill: job.skill,
    deadline: job.deadline,
    description: job.description,
  };
}

function hasJobChanged(job: Job, input: JobInput): boolean {
  return (
    job.title !== input.title ||
    job.city !== input.city ||
    job.skill !== input.skill ||
    job.deadline !== input.deadline ||
    job.description !== input.description
  );
}

function normalizeBrazilianPhone(phone?: string): string | null {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, '');
  let nationalNumber: string;

  if (digits.length === 10 || digits.length === 11) {
    nationalNumber = digits;
  } else if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith('55')
  ) {
    nationalNumber = digits.slice(2);
  } else {
    return null;
  }

  if (
    !/^[1-9]\d{9,10}$/.test(nationalNumber) ||
    /^(\d)\1+$/.test(nationalNumber)
  ) {
    return null;
  }

  return '55' + nationalNumber;
}

function getJobWhatsAppUrl(job: Job): string | null {
  const normalizedPhone = normalizeBrazilianPhone(job.companyPhone);

  if (!normalizedPhone) {
    return null;
  }

  const message =
    'Olá! Vi a vaga ' +
    job.title +
    ' no CosturaConecta e gostaria de saber mais.';
  const searchParams = new URLSearchParams({ text: message });

  return 'https://wa.me/' + normalizedPhone + '?' + searchParams.toString();
}

export default function JobBoard({ user, onNavigate }: JobBoardProps) {
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
  const [currentCompanyProfileId, setCurrentCompanyProfileId] = useState<
    string | null
  >(null);
  const [currentCompanyUserId, setCurrentCompanyUserId] = useState<
    string | null
  >(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState<JobInput>({
    title: '',
    city: '',
    skill: '',
    deadline: '',
    description: '',
  });
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [managementSuccess, setManagementSuccess] = useState('');
  const userId = user?.id;

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

  useEffect(() => {
    let isMounted = true;

    setCurrentCompanyProfileId(null);
    setCurrentCompanyUserId(null);

    if (!userId) {
      return () => {
        isMounted = false;
      };
    }

    const loadCurrentCompanyProfile = async () => {
      const result = await getCurrentCompanyProfile();

      if (!isMounted) {
        return;
      }

      if (result.success && result.profile) {
        setCurrentCompanyProfileId(result.profile.id);
        setCurrentCompanyUserId(userId);
        return;
      }

      setCurrentCompanyProfileId(null);
      setCurrentCompanyUserId(null);
    };

    void loadCurrentCompanyProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

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
      !isValidDateOnly(jobInput.deadline)
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

  const handleStartEditing = (job: Job) => {
    setEditingJobId(job.id);
    setEditInput(getJobInput(job));
    setUpdateError('');
    setDeleteError('');
    setManagementSuccess('');
  };

  const handleCancelEditing = () => {
    setEditingJobId(null);
    setUpdateError('');
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUpdateError('');
    setDeleteError('');
    setManagementSuccess('');

    const job = jobs.find((currentJob) => currentJob.id === editingJobId);

    if (
      !job ||
      !user ||
      !currentCompanyProfileId ||
      currentCompanyUserId !== user.id ||
      job.companyId !== currentCompanyProfileId
    ) {
      setUpdateError(updateErrorMessages.non_owned);
      return;
    }

    const normalizedInput: JobInput = {
      title: editInput.title.trim(),
      city: editInput.city.trim(),
      skill: editInput.skill.trim(),
      deadline: editInput.deadline.trim(),
      description: editInput.description.trim(),
    };

    if (
      Object.values(normalizedInput).some((value) => !value) ||
      !isValidDateOnly(normalizedInput.deadline)
    ) {
      setUpdateError(
        'Preencha todos os campos obrigatórios e informe uma data válida.'
      );
      return;
    }

    if (!hasJobChanged(job, normalizedInput)) {
      setUpdateError('Altere pelo menos um campo antes de salvar.');
      return;
    }

    setSavingJobId(job.id);

    try {
      const result = await updateJob(job.id, normalizedInput);

      if (!result.success) {
        setUpdateError(updateErrorMessages[result.reason]);
        return;
      }

      setJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob.id === result.job.id ? result.job : currentJob
        )
      );
      setEditingJobId(null);
      setManagementSuccess('Vaga atualizada com sucesso!');
    } catch {
      setUpdateError(updateErrorMessages.unexpected);
    } finally {
      setSavingJobId(null);
    }
  };

  const handleDelete = async (job: Job) => {
    const confirmed = window.confirm(
      'Tem certeza de que deseja excluir esta vaga? Esta ação não poderá ser desfeita.'
    );

    if (!confirmed) {
      return;
    }

    setUpdateError('');
    setDeleteError('');
    setManagementSuccess('');
    setDeletingJobId(job.id);

    try {
      const result = await deleteJob(job.id);

      if (!result.success) {
        setDeleteError(deleteErrorMessages[result.reason]);
        return;
      }

      setJobs((currentJobs) =>
        currentJobs.filter((currentJob) => currentJob.id !== job.id)
      );

      if (editingJobId === job.id) {
        setEditingJobId(null);
      }

      setManagementSuccess('Vaga excluída com sucesso!');
    } catch {
      setDeleteError(deleteErrorMessages.unexpected);
    } finally {
      setDeletingJobId(null);
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

            {managementSuccess && (
              <div className='mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-3' role='status'>
                <CheckCircle className='w-5 h-5 flex-shrink-0' />
                <span className='text-sm font-medium'>{managementSuccess}</span>
              </div>
            )}

            {updateError && (
              <div className='mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3' role='alert'>
                <AlertCircle className='w-5 h-5 flex-shrink-0' />
                <span className='text-sm font-medium'>{updateError}</span>
              </div>
            )}

            {deleteError && (
              <div className='mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3' role='alert'>
                <AlertCircle className='w-5 h-5 flex-shrink-0' />
                <span className='text-sm font-medium'>{deleteError}</span>
              </div>
            )}

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
                {jobs.map((job) => {
                  const whatsAppUrl = getJobWhatsAppUrl(job);
                  const canManage = Boolean(
                    user &&
                      currentCompanyUserId === user.id &&
                      currentCompanyProfileId &&
                      job.companyId === currentCompanyProfileId
                  );
                  const isEditing = canManage && editingJobId === job.id;
                  const isSaving = savingJobId === job.id;
                  const isDeleting = deletingJobId === job.id;
                  const isOperationRunning = Boolean(
                    savingJobId || deletingJobId
                  );

                  return (
                    <div key={job.id} className='card'>
                      {isEditing ? (
                        <form onSubmit={handleUpdate} className='space-y-5'>
                          <div className='flex items-start justify-between gap-4'>
                            <h3 className='font-semibold text-navy-800'>
                              Editar vaga
                            </h3>
                            <span className='text-xs text-gray-400 whitespace-nowrap'>
                              {job.createdAt}
                            </span>
                          </div>

                          <div>
                            <label className='label-field'>Título da vaga *</label>
                            <input
                              type='text'
                              value={editInput.title}
                              onChange={(event) =>
                                setEditInput((currentInput) => ({
                                  ...currentInput,
                                  title: event.target.value,
                                }))
                              }
                              className='input-field'
                              required
                            />
                          </div>

                          <div>
                            <label className='label-field'>Cidade *</label>
                            <select
                              value={editInput.city}
                              onChange={(event) =>
                                setEditInput((currentInput) => ({
                                  ...currentInput,
                                  city: event.target.value,
                                }))
                              }
                              className='input-field'
                              required
                            >
                              <option value=''>Selecione</option>
                              {cities.map((cityOption) => (
                                <option key={cityOption} value={cityOption}>
                                  {cityOption}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className='label-field'>
                              Habilidade necessária *
                            </label>
                            <select
                              value={editInput.skill}
                              onChange={(event) =>
                                setEditInput((currentInput) => ({
                                  ...currentInput,
                                  skill: event.target.value,
                                }))
                              }
                              className='input-field'
                              required
                            >
                              <option value=''>Selecione</option>
                              {skills.map((skillOption) => (
                                <option key={skillOption} value={skillOption}>
                                  {skillOption}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className='label-field'>Prazo *</label>
                            <input
                              type='date'
                              value={editInput.deadline}
                              onChange={(event) =>
                                setEditInput((currentInput) => ({
                                  ...currentInput,
                                  deadline: event.target.value,
                                }))
                              }
                              className='input-field'
                              required
                            />
                          </div>

                          <div>
                            <label className='label-field'>Descrição *</label>
                            <textarea
                              value={editInput.description}
                              onChange={(event) =>
                                setEditInput((currentInput) => ({
                                  ...currentInput,
                                  description: event.target.value,
                                }))
                              }
                              className='input-field min-h-[100px] resize-none'
                              required
                            />
                          </div>

                          <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-2'>
                            <button
                              type='button'
                              onClick={handleCancelEditing}
                              disabled={isOperationRunning}
                              className='inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-4 py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                            >
                              <X className='w-4 h-4' />
                              Cancelar
                            </button>
                            <button
                              type='submit'
                              disabled={isOperationRunning}
                              className='btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60'
                            >
                              {isSaving ? (
                                <LoaderCircle className='w-4 h-4 animate-spin' />
                              ) : (
                                <Pencil className='w-4 h-4' />
                              )}
                              {isSaving ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
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
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {job.description}
                      </p>

                          {canManage && (
                            <div className='mt-4 flex flex-col sm:flex-row sm:justify-end gap-2'>
                              <button
                                type='button'
                                onClick={() => handleStartEditing(job)}
                                disabled={isOperationRunning}
                                className='inline-flex items-center justify-center gap-2 border border-navy-200 text-navy-700 hover:bg-navy-50 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                              >
                                <Pencil className='w-4 h-4' />
                                Editar
                              </button>
                              <button
                                type='button'
                                onClick={() => void handleDelete(job)}
                                disabled={isOperationRunning}
                                className='inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                              >
                                {isDeleting ? (
                                  <LoaderCircle className='w-4 h-4 animate-spin' />
                                ) : (
                                  <Trash2 className='w-4 h-4' />
                                )}
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="w-4 h-4 text-navy-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">Empresa responsável</p>
                            <p className="text-sm font-medium text-navy-800 truncate">
                              {job.companyName || 'Empresa não informada'}
                            </p>
                          </div>
                        </div>

                        {whatsAppUrl ? (
                          <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
                          >
                            <Phone className="w-4 h-4" />
                            Falar no WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 sm:text-right">
                            Contato não informado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
