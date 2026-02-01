import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';
import { GrandTotalCard } from '@/components/GrandTotalCard';
import { TabGroup } from '@/components/TabGroup';
import { AppWrapper } from '@/components/AppWrapper';
import { AppHeader } from '@/components/AppHeader';
import { TabProvider } from '@/contexts/TabContext';

function AppContent() {
  const { i18n } = useTranslation();
  const { theme, language, setTheme, loading } = useAppStoreFirebase();

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply language to i18n
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Detect system theme preference on initial load
  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (!localStorage.getItem('euro-piggy-bank-store')) {
      setTheme(systemTheme);
    }
  }, [setTheme]);

  // Show loading state while initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your savings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Main Content */}
          <main className="space-y-8">
            <GrandTotalCard />
            <TabGroup />
          </main>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AppWrapper>
      <TabProvider>
        <AppContent />
      </TabProvider>
    </AppWrapper>
  );
}

export default App;
