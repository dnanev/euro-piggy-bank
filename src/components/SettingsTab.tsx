import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { BgnToggle } from './BgnToggle';

export function SettingsTab() {
  const { t } = useTranslation();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('tabs.settings')}</h2>

        {/* Language Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('settings.language')}</h3>
          <LanguageToggle />
        </div>

        {/* Theme Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('settings.theme')}</h3>
          <ThemeToggle />
        </div>

        {/* Currency Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('totals.totalBgn')}</h3>
          <BgnToggle />
        </div>
      </div>
    </Card>
  );
}
