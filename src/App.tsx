import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { GrandTotalCard } from '@/components/GrandTotalCard';
import { TabGroup } from '@/components/TabGroup';

export function App() {
  const { i18n } = useTranslation();
  const { theme, language, setTheme } = useAppStore();

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <header className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {i18n.t('app.title')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {i18n.t('app.subtitle')}
            </p>
          </header>

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

export default App;
