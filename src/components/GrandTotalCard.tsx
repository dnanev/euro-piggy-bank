import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { formatEuro, formatBGN, convertEurToBgn, getSavingsInsights } from '@/utils/currency';
import { useAppStore } from '@/store/useAppStore';
import { ConfirmDialog } from './ConfirmDialog';
import { useState } from 'react';

export function GrandTotalCard() {
  const { t } = useTranslation();
  const { denominations, language, showBgn, saveState, resetAll } = useAppStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const totalCents = denominations.reduce((total, denom) => total + (denom.quantity * denom.value), 0);
  const totalBgn = convertEurToBgn(totalCents);
  const insights = getSavingsInsights(denominations);

  const handleSave = () => {
    saveState();
  };

  const handleReset = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmReset = () => {
    resetAll();
    setShowConfirmDialog(false);
  };

  const handleCancelReset = () => {
    setShowConfirmDialog(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US');
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center">{t('totals.title')}</h2>

          {/* Main Totals */}
          <div className="text-center space-y-2">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg blur-sm opacity-10"></div>
              <div className="relative text-3xl font-bold text-slate-900 dark:text-slate-100 px-4 py-2">
                {showBgn ? formatBGN(totalBgn, language) : formatEuro(totalCents, language)}
              </div>
            </div>
            {showBgn && (
              <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full inline-block">
                {formatEuro(totalCents, language)} ≈ {formatBGN(totalBgn, language)}
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-semibold text-slate-700 dark:text-slate-300">{insights.coinCount}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('totals.coinsCount')}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-semibold text-slate-700 dark:text-slate-300">{insights.banknoteCount}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('totals.banknotesCount')}</div>
            </div>
            <div className="col-span-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                {insights.mostSaved ? `${insights.mostSaved.label} (${insights.mostSaved.quantity})` : '-'}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('totals.mostSaved')}</div>
            </div>
          </div>

          {/* Top 3 Denominations */}
          {insights.top3.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('totals.top3')}</h3>
              <div className="space-y-1">
                {insights.top3.map((denom, index) => (
                  <div key={denom.id} className="flex justify-between items-center">
                    <span className="text-sm">
                      {index + 1}. {denom.label} ({denom.quantity})
                    </span>
                    <span className="text-sm font-medium">
                      {showBgn ? formatBGN(convertEurToBgn(denom.totalValue), language) : formatEuro(denom.totalValue, language)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          {formatDate(useAppStore.getState().lastUpdated) && (
            <div className="text-center text-sm text-muted-foreground">
              {t('totals.lastUpdated')}: {formatDate(useAppStore.getState().lastUpdated)}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg"
            >
              <Save className="h-4 w-4" />
              {t('actions.save')}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white border-0 shadow-lg"
            >
              <RotateCcw className="h-4 w-4" />
              {t('actions.reset')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={t('actions.reset')}
        description={t('actions.confirmReset')}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
        confirmText={t('actions.reset')}
        cancelText={t('actions.cancel')}
      />
    </>
  );
}
