import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';

export function HistoryTab() {
  const { t } = useTranslation();

  return (
    <Card className="p-8 text-center">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{t('history.comingSoon')}</h3>
        <p className="text-muted-foreground">
          {t('history.noHistory')}
        </p>
      </div>
    </Card>
  );
}
