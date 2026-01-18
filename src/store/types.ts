export interface EuroDenomination {
  id: string;
  label: string;
  value: number; // in Euro cents
  type: 'coin' | 'banknote';
  quantity: number;
}

export interface AppState {
  denominations: EuroDenomination[];
  theme: 'light' | 'dark';
  language: 'bg' | 'en';
  showBgn: boolean;
  lastUpdated: string | null;
}

export interface AppActions {
  setQuantity: (id: string, quantity: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'bg' | 'en') => void;
  setShowBgn: (showBgn: boolean) => void;
  resetAll: () => void;
  saveState: () => void;
  loadState: () => void;
}
