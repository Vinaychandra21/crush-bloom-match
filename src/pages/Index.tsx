import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import LandingPage from "@/components/LandingPage";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import MatchesPage from "@/components/MatchesPage";

type AppState = 'landing' | 'auth' | 'dashboard' | 'matches';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('landing');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setCurrentPage('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('landing');
  };

  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'auth':
        return <AuthPage onAuthSuccess={handleAuthSuccess} />;
      case 'dashboard':
        return <Dashboard />;
      case 'matches':
        return <MatchesPage onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      {user && (
        <nav className="bg-card border-b shadow-soft sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💕</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CrushMatch
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-4 py-2 rounded-md transition-smooth ${
                  currentPage === 'dashboard' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('matches')}
                className={`px-4 py-2 rounded-md transition-smooth ${
                  currentPage === 'matches' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                Matches
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md hover:bg-muted transition-smooth"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      {renderCurrentPage()}

      {/* Call to Action Overlay for Landing Page */}
      {currentPage === 'landing' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => setCurrentPage('auth')}
            className="gradient-love text-white px-8 py-4 rounded-full font-semibold text-lg shadow-romantic hover:shadow-glow transition-bounce animate-pulse-glow"
          >
            Start Finding Love 💕
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
