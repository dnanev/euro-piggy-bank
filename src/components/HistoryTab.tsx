import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';
import type { HistoryFilters, HistoryExportOptions } from '@/store/types';
import {
  calculateHistoryStatistics,
  filterHistoryEntries,
  exportHistoryData,
  calculateGoalProgress,
  createManualHistoryEntry
} from '@/utils/history';

export function HistoryTab() {
  const { t } = useTranslation();
  const {
    history,
    goals,
    addHistoryEntry,
    deleteHistoryEntry,
    deleteGoal
  } = useAppStoreFirebase();

  const [filters, setFilters] = useState<HistoryFilters>({
    dateRange: { start: null, end: null },
    entryTypes: ['snapshot', 'manual-entry'],
    searchQuery: ''
  });

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<HistoryExportOptions>({
    format: 'csv',
    includeFilters: true,
    dateRange: filters.dateRange
  });

  const statistics = calculateHistoryStatistics(history);

  const handleExport = () => {
    const filters: HistoryFilters = {
      dateRange: exportOptions.dateRange,
      entryTypes: ['snapshot', 'manual-entry'],
      searchQuery: ''
    };
    const data = exportHistoryData(history, exportOptions.format, filters);

    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `history-export.${exportOptions.format}`;
    link.textContent = t('history.export.download');
    document.body.appendChild(link);
    link.click();

    setShowExportDialog(false);
  };

  const handleAddManualEntry = () => {
    const title = prompt(t('history.manualEntry.title'));
    const amountStr = prompt(t('history.manualEntry.amount'));
    const description = prompt(t('history.manualEntry.description'));

    if (title && amountStr) {
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        const amountInCents = Math.round(amount * 100); // Convert euros to cents
        const entry = createManualHistoryEntry(title, amountInCents, description || '');
        addHistoryEntry(entry);
      }
    }
  };

  const filteredHistory = filterHistoryEntries(history, filters);

  const currentTotal = history.reduce((total, entry) =>
    entry.type === 'snapshot' ? total + entry.totalEur : total, 0
  ); // This is in cents

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('history.title')}</h2>

        <div className="flex gap-2">
          <Button
            variant={showExportDialog ? "outline" : "default"}
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2"
          >
            <span>{t('history.export.title')}</span>
          </Button>

          <Button
            variant="default"
            onClick={handleAddManualEntry}
            className="flex items-center gap-2"
          >
            <span>{t('history.manualEntry.title')}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="date-start">{t('history.filters.dateFrom')}</Label>
            <Input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) => setFilters((prev: HistoryFilters) => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  start: e.target.value
                }
              }))}
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="date-end">{t('history.filters.dateTo')}</Label>
            <Input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) => setFilters((prev: HistoryFilters) => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  end: e.target.value
                }
              }))}
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search">{t('history.filters.search')}</Label>
            <Input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev: HistoryFilters) => ({
                ...prev,
                searchQuery: e.target.value
              }))}
              className="w-full"
              placeholder={t('history.filters.searchPlaceholder')}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="entry-types">{t('history.filters.entryTypes')}</Label>
            <select
              multiple
              value={filters.entryTypes}
              onChange={(e) => setFilters((prev: HistoryFilters) => ({
                ...prev,
                entryTypes: Array.from(e.target.selectedOptions, option => option.value) as HistoryFilters['entryTypes']
              }))}
              className="w-full"
            >
              <option value="snapshot">{t('history.entryTypes.snapshot')}</option>
              <option value="manual-entry">{t('history.entryTypes.manual')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      {statistics && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-3">{t('history.statistics.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(statistics.totalSavedEur / 100).toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t('history.statistics.totalSaved')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {(statistics.averageDailySaving / 100).toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t('history.statistics.averageDaily')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {(statistics.bestSavingDay / 100).toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t('history.statistics.bestDay')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {statistics.currentStreak}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t('history.statistics.currentStreak')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Timeline */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('history.noEntries')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {entry.title || t('history.manualEntry.untitled')}
                  </div>
                  {entry.type === 'manual-entry' && entry.description && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {entry.description}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-right">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t('history.total')}:
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {(entry.totalEur / 100).toFixed(2)} €
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {entry.totalBgn.toFixed(2)} BGN
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHistoryEntry(entry.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('history.delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goals Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">{t('history.goals.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('history.goals.noGoals')}</p>
              <Button
                onClick={handleAddManualEntry}
                className="mt-4"
              >
                {t('history.goals.create')}
              </Button>
            </div>
          ) : (
            goals.map((goal) => {
              const goalProgress = calculateGoalProgress(goal, currentTotal); // currentTotal is in cents
              const remaining = goal.targetAmount - currentTotal; // Both in cents
              const daysRemaining = goal.deadline ?
                Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) :
                null;

              return (
                <div
                  key={goal.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {goal.title}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t('history.goals.target')}: {(goal.targetAmount / 100).toFixed(2)} {goal.targetCurrency}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t('history.goals.deadline')}: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : t('history.goals.noDeadline')}
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <div className="mb-2">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {t('history.goals.progress')}:
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {goalProgress.toFixed(1)}%
                        </div>
                      </div>

                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t('history.goals.remaining')}: {(remaining / 100).toFixed(2)} {goal.targetCurrency}
                      </div>

                      {daysRemaining !== null && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t('history.goals.daysRemaining')}: {daysRemaining}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t('history.goals.delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('history.export.title')}</h3>

            <div className="space-y-4">
              <div className="mb-4">
                <Label htmlFor="export-format">{t('history.export.format')}</Label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions((prev: HistoryExportOptions) => ({ ...prev, format: e.target.value as HistoryExportOptions['format'] }))}
                  className="w-full"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFilters}
                    onChange={(e) => setExportOptions((prev: HistoryExportOptions) => ({ ...prev, includeFilters: e.target.checked }))}
                  />
                  <span>{t('history.export.includeFilters')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowExportDialog(false)}
                variant="outline"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('history.export.download')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
