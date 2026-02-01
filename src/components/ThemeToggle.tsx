import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun } from 'lucide-react';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useAppStoreFirebase();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4" />
      <Switch
        id="theme-toggle"
        checked={theme === 'dark'}
        onCheckedChange={handleThemeChange}
      />
      <Moon className="h-4 w-4" />
      <Label htmlFor="theme-toggle" className="ml-2">
        {theme === 'dark' ? t('settings.dark') : t('settings.light')}
      </Label>
    </div>
  );
}
