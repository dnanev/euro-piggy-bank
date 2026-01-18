import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const handleLanguageChange = (newLanguage: 'bg' | 'en') => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4" />
      <div className="flex gap-2">
        <Button
          variant={language === 'bg' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLanguageChange('bg')}
        >
          BG
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLanguageChange('en')}
        >
          EN
        </Button>
      </div>
    </div>
  );
}
