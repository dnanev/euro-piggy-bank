import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import type { EuroDenomination } from '@/store/types';
import { formatEuro, formatBGN, convertEurToBgn } from '@/utils/currency';

interface DenominationRowProps {
  denomination: EuroDenomination;
  onQuantityChange: (id: string, quantity: number) => void;
  language: string;
  showBgn: boolean;
}

export function DenominationRow({ denomination, onQuantityChange, language, showBgn }: DenominationRowProps) {
  const { t } = useTranslation();
  const totalValue = denomination.quantity * denomination.value;

  const handleIncrement = () => {
    onQuantityChange(denomination.id, denomination.quantity + 1);
  };

  const handleDecrement = () => {
    onQuantityChange(denomination.id, Math.max(0, denomination.quantity - 1));
  };

  const handleInputChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      onQuantityChange(denomination.id, numValue);
    }
  };

  return (
    <Card className="flex-1 min-w-[280px] p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: Denomination */}
        <div className="flex items-center justify-start">
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {denomination.label}
          </span>
        </div>

        {/* Middle: Input Controls */}
        <div className="flex items-center justify-center">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecrement}
              disabled={denomination.quantity === 0}
              aria-label={t('actions.decrement')}
              className="rounded-r-none border-r-0 h-9 w-9 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
              style={{ pointerEvents: denomination.quantity === 0 ? 'none' : 'auto' }}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Input
              type="number"
              value={denomination.quantity}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-16 text-center border-0 rounded-none focus:ring-2 focus:ring-slate-500 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none bg-white dark:bg-slate-800"
              min="0"
              aria-label={t('denominations.quantity')}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleIncrement}
              aria-label={t('actions.increment')}
              className="rounded-l-none border-l-0 h-9 w-9 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
              style={{ pointerEvents: 'auto' }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right: Total */}
        <div className="flex flex-col items-end justify-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 leading-tight">
            {t('denominations.total')}
          </div>
          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-tight break-words text-right">
            {showBgn ? formatBGN(convertEurToBgn(totalValue), language) : formatEuro(totalValue, language)}
          </div>
        </div>
      </div>
    </Card>
  );
}
