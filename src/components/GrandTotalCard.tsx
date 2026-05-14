import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { formatEuro, formatBGN, convertEurToBgn, getSavingsInsights } from '@/utils/currency';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';

export function GrandTotalCard() {
  const { t } = useTranslation();
  const { denominations, language, showBgn, lastUpdated } = useAppStoreFirebase();

  const totalCents = denominations.reduce((total, denom) => total + (denom.quantity * denom.value), 0);
  const totalBgn = convertEurToBgn(totalCents);
  const insights = getSavingsInsights(denominations);

  const coinCount = insights.coinCount;
  const banknoteCount = insights.banknoteCount;
  const coinValue = denominations
    .filter((denom) => denom.type === 'coin')
    .reduce((total, denom) => total + denom.quantity * denom.value, 0);

  const coinValuePercent = totalCents > 0 ? Math.round((coinValue / totalCents) * 100) : 0;
  const banknoteValuePercent = totalCents > 0 ? 100 - coinValuePercent : 0;

  const formattedTotal = showBgn ? formatBGN(totalBgn, language) : formatEuro(totalCents, language);
  const formattedAltTotal = showBgn ? formatEuro(totalCents, language) : formatBGN(totalBgn, language);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US');
  };

  return (
    <div className="relative group">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 rounded-[2rem] pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.1),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(128,144,255,0.08),_transparent_28%)]"
      />

      <Card className="relative overflow-hidden rounded-[2rem] border border-slate-700/70 bg-slate-950/85 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.7)] backdrop-blur-xl p-8 md:p-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-900/90 to-transparent pointer-events-none" />

        <div className="relative space-y-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                {t('totals.title')}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="text-5xl md:text-6xl font-semibold tracking-tight text-white leading-none">
                  {formattedTotal}
                </div>
                <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                  {showBgn ? 'BGN' : 'EUR'}
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm text-slate-400">
                {showBgn
                  ? `${t('totals.totalEur')}: ${formattedAltTotal}`
                  : `${t('totals.totalBgn')}: ${formattedAltTotal}`}
              </p>
            </div>

            <div className="grid w-full max-w-sm grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-700/60 bg-slate-900/90 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  🪙 {t('totals.coinsCount')}
                </p>
                <div className="mt-4 text-3xl font-semibold text-white">
                  {coinCount}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {coinValuePercent}% value
                </div>
              </div>
              <div className="rounded-3xl border border-slate-700/60 bg-slate-900/90 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  💵 {t('totals.banknotesCount')}
                </p>
                <div className="mt-4 text-3xl font-semibold text-white">
                  {banknoteCount}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {banknoteValuePercent}% value
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_auto]">
            <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-900/80 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Composition</p>
                  <p className="mt-3 text-base text-slate-300">
                    Track how coins and banknotes build your total, with live value ratios and a clean overview of your savings mix.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {totalCents === 0 ? 'Empty' : 'Balanced'}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-950/90 p-4 border border-slate-700/50">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Coins</span>
                    <span>{formattedTotal === '' ? '0%' : `${coinValuePercent}%`}</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${coinValuePercent}%` }} />
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-950/90 p-4 border border-slate-700/50">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Banknotes</span>
                    <span>{formattedTotal === '' ? '0%' : `${banknoteValuePercent}%`}</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${banknoteValuePercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-900/80 p-6 flex flex-col justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Insights</p>
                <p className="mt-4 text-base text-slate-300 leading-7">
                  {totalCents === 0
                    ? 'Start adding your denominations to see your savings come together.'
                    : `You have ${coinCount} coin${coinCount === 1 ? '' : 's'} and ${banknoteCount} banknote${banknoteCount === 1 ? '' : 's'} contributing to your total.`}
                </p>
              </div>
              <div className="mt-6 border-t border-slate-700/50 pt-4 text-xs text-slate-500">
                {t('totals.lastUpdated')}: {formatDate(lastUpdated) ?? '—'}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
