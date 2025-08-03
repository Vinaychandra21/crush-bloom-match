import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import MatchesPage from "@/components/MatchesPage";

type AppState = 'landing' | 'auth' | 'dashboard' | 'matches';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<AppState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const renderCurrentPage = () => {
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
      {isAuthenticated && (
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
                onClick={() => {
                  setIsAuthenticated(false);
                  setCurrentPage('landing');
                }}
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
