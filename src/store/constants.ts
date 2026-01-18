import type { EuroDenomination } from './types';

export const EURO_DENOMINATIONS: EuroDenomination[] = [
  // Coins
  { id: '1c', label: '1¢', value: 1, type: 'coin', quantity: 0 },
  { id: '2c', label: '2¢', value: 2, type: 'coin', quantity: 0 },
  { id: '5c', label: '5¢', value: 5, type: 'coin', quantity: 0 },
  { id: '10c', label: '10¢', value: 10, type: 'coin', quantity: 0 },
  { id: '20c', label: '20¢', value: 20, type: 'coin', quantity: 0 },
  { id: '50c', label: '50¢', value: 50, type: 'coin', quantity: 0 },
  { id: '1e', label: '1€', value: 100, type: 'coin', quantity: 0 },
  { id: '2e', label: '2€', value: 200, type: 'coin', quantity: 0 },
  // Banknotes
  { id: '5e', label: '5€', value: 500, type: 'banknote', quantity: 0 },
  { id: '10e', label: '10€', value: 1000, type: 'banknote', quantity: 0 },
  { id: '20e', label: '20€', value: 2000, type: 'banknote', quantity: 0 },
  { id: '50e', label: '50€', value: 5000, type: 'banknote', quantity: 0 },
  { id: '100e', label: '100€', value: 10000, type: 'banknote', quantity: 0 },
  { id: '200e', label: '200€', value: 20000, type: 'banknote', quantity: 0 },
  { id: '500e', label: '500€', value: 50000, type: 'banknote', quantity: 0 },
];

export const EUR_TO_BGN_RATE = 1.95583;

export const STORAGE_KEYS = {
  DENOMINATIONS: 'euro-piggy-bank-denominations',
  THEME: 'euro-piggy-bank-theme',
  LANGUAGE: 'euro-piggy-bank-language',
  LAST_UPDATED: 'euro-piggy-bank-last-updated',
} as const;
