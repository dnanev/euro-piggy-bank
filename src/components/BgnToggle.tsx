import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';

export function BgnToggle() {
  const { t } = useTranslation();
  const { showBgn, setShowBgn } = useAppStore();

  const handleToggleChange = (checked: boolean) => {
    setShowBgn(checked);
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="bgn-toggle"
        checked={showBgn}
        onCheckedChange={handleToggleChange}
      />
      <Label htmlFor="bgn-toggle" className="text-sm font-medium">
        {showBgn ? t('totals.hideBgn') : t('totals.showBgn')}
      </Label>
    </div>
  );
}
