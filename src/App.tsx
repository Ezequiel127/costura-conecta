import { useEffect, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { View } from './types';
import LandingPage from './components/LandingPage';
import CompanyArea from './components/CompanyArea';
import ProfessionalArea from './components/ProfessionalArea';
import JobBoard from './components/JobBoard';

function App() {
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        accountButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

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
  setIsAccountMenuOpen(false);
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert('Erro ao sair: ' + error.message);
  }
};

  return (
    <>
      {user && (
        <div ref={accountMenuRef} className="fixed top-4 right-4 z-[100]">
          <button
            ref={accountButtonRef}
            type="button"
            aria-label="Abrir menu da conta"
            aria-haspopup="dialog"
            aria-expanded={isAccountMenuOpen}
            aria-controls="account-menu"
            onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-white text-teal-700 shadow-lg transition-colors hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <UserRound aria-hidden="true" className="h-5 w-5" />
          </button>

          {isAccountMenuOpen && (
            <div
              id="account-menu"
              role="dialog"
              aria-label="Menu da conta"
              className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
            >
              <p className="text-sm text-slate-700">Logado como</p>
              <strong className="mt-1 block break-all text-sm text-slate-900">
                {user.email}
              </strong>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 rounded-md px-1 py-1 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Sair
              </button>
            </div>
          )}
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
        <JobBoard user={user} onNavigate={setView} />
      )}
    </>
  );
}

export default App;
