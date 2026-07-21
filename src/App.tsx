import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { View, Job } from './types';
import { initialJobs } from './data';
import LandingPage from './components/LandingPage';
import CompanyArea from './components/CompanyArea';
import ProfessionalArea from './components/ProfessionalArea';
import JobBoard from './components/JobBoard';

function App() {
  const [view, setView] = useState<View>('landing');
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handlePublishJob = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
  };

const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      scopes: 'openid email profile https://www.googleapis.com/auth/userinfo.email',
    },
  });

  if (error) {
    alert('Erro ao entrar com Google: ' + error.message);
  }
};

  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert('Erro ao sair: ' + error.message);
  }
};

  return (
    <>
      {user && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 max-w-xs">
          <p className="text-sm text-slate-700">
            Logado como <strong>{user.email}</strong>
          </p>

          <button
            onClick={handleLogout}
            className="mt-2 text-xs text-red-600 font-semibold hover:underline"
          >
            Sair
          </button>
        </div>
      )}


      {view === 'landing' && (
        <LandingPage onNavigate={setView} onGoogleLogin={handleGoogleLogin} />
      )}

      {view === 'company' && (
        <CompanyArea user={user} onNavigate={setView} />
      )}

      {view === 'professional' && (
        <ProfessionalArea onNavigate={setView} />
      )}

      {view === 'jobs' && (
        <JobBoard jobs={jobs} onPublish={handlePublishJob} onNavigate={setView} />
      )}
    </>
  );
}

export default App;
