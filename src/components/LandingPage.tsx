import { Scissors, Building2, User, Chrome, Briefcase } from 'lucide-react';
import { View } from '../types';

interface LandingPageProps {
  onNavigate: (view: View) => void;
  onGoogleLogin: () => void;
}

export default function LandingPage({ onNavigate, onGoogleLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-navy-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-petrol-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-petrol-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-32 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Scissors className="w-10 h-10 md:w-12 md:h-12 text-petrol-300" strokeWidth={1.5} />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Costura<span className="text-petrol-300">Conecta</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl text-navy-200 mb-4 max-w-2xl mx-auto">
            Conectando confecções e costureiras de Picos e região
          </p>
          <p className="text-sm md:text-base text-navy-300 mb-10 max-w-xl mx-auto leading-relaxed">
            O CosturaConecta é uma plataforma que aproxima empresas de confecção e profissionais
            autônomas da costura, facilitando a busca por talentos e a contratação de forma rápida
            e organizada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('company')}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Building2 className="w-5 h-5" />
              Sou empresa
            </button>
            <button
              onClick={() => onNavigate('professional')}
              className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <User className="w-5 h-5" />
              Sou profissional
            </button>
          </div>
          <button
            onClick={onGoogleLogin}
            className="mt-4 flex items-center gap-2 mx-auto bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
          >
            <Chrome className="w-5 h-5" />
            Entrar com Google
          </button>
          <button
            onClick={() => onNavigate('jobs')}
            className="mt-3 flex items-center gap-2 mx-auto text-petrol-300 hover:text-petrol-200 font-medium py-2 px-4 rounded-xl transition-all duration-200 text-sm"
          >
            <Briefcase className="w-4 h-4" />
            Ver vagas publicadas
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <h2 className="section-title text-center mb-12">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-14 h-14 bg-petrol-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-petrol-600" />
            </div>
            <h3 className="font-semibold text-navy-800 mb-2">Profissional se cadastra</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              A costureira cria seu perfil informando habilidades, cidade, experiência e
              disponibilidade.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-14 h-14 bg-petrol-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-petrol-600" />
            </div>
            <h3 className="font-semibold text-navy-800 mb-2">Empresa busca talentos</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Confecções e ateliês filtram profissionais por habilidade, cidade e disponibilidade.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-14 h-14 bg-petrol-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-7 h-7 text-petrol-600" />
            </div>
            <h3 className="font-semibold text-navy-800 mb-2">Conexão acontece</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              O contato é feito diretamente via WhatsApp, sem burocracia e com agilidade.
            </p>
          </div>
        </div>
      </section>

      {/* Impact */}
      <ImpactSection />

      {/* Footer */}
      <footer className="bg-navy-800 text-navy-300 text-center py-8 text-sm">
        <p>CosturaConecta &mdash; Projeto de Extensão Curricular 1</p>
        <p className="mt-1">IFPI Campus Picos &bull; Ano 2026</p>
      </footer>
    </div>
  );
}

function ImpactSection() {
  const impacts = [
    {
      title: 'Mais agilidade',
      desc: 'Empresas encontram profissionais rapidamente, sem depender de indicações.',
      icon: '⚡',
    },
    {
      title: 'Mais oportunidades',
      desc: 'Costureiras ficam visíveis para mais empresas e aumentam suas chances de trabalho.',
      icon: '🌟',
    },
    {
      title: 'Menos dependência',
      desc: 'Redução da dependência de indicações informais e grupos de WhatsApp.',
      icon: '🔗',
    },
    {
      title: 'Setor fortalecido',
      desc: 'Fortalecimento do setor de confecção local de Picos e região.',
      icon: '🏗️',
    },
  ];

  return (
    <section className="bg-navy-50 py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-title text-center mb-12">Impacto esperado</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {impacts.map((item) => (
            <div key={item.title} className="card flex items-start gap-4">
              <span className="text-2xl mt-0.5">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-navy-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
