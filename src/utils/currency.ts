import { EUR_TO_BGN_RATE } from '@/store/constants';

export const formatEuro = (cents: number, language: string = 'en'): string => {
  const euros = cents / 100;
  return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(euros);
};

export const formatBGN = (bgn: number, language: string = 'en'): string => {
  return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
    style: 'currency',
    currency: 'BGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(bgn);
};

export const convertEurToBgn = (cents: number): number => {
  const euros = cents / 100; // Convert cents to euros first
  return euros * EUR_TO_BGN_RATE;
};

export const calculateTotal = (denominations: Array<{ quantity: number; value: number }>): number => {
  return denominations.reduce((total, denom) => total + (denom.quantity * denom.value), 0);
};

export const getSavingsInsights = (denominations: Array<{ quantity: number; value: number; type: 'coin' | 'banknote'; label: string; id: string }>) => {
  const coins = denominations.filter(d => d.type === 'coin');
  const banknotes = denominations.filter(d => d.type === 'banknote');

  const coinCount = coins.reduce((total, coin) => total + coin.quantity, 0);
  const banknoteCount = banknotes.reduce((total, note) => total + note.quantity, 0);

  const denominationsWithValue = denominations
    .filter(d => d.quantity > 0)
    .map(d => ({
      ...d,
      totalValue: d.quantity * d.value,
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  const mostSaved = denominationsWithValue[0];
  const top3 = denominationsWithValue.slice(0, 3);

  return {
    coinCount,
    banknoteCount,
    mostSaved,
    top3,
  };
};
