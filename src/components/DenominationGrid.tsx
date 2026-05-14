import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { EuroDenomination } from '@/store/types';
import { formatEuro, formatBGN, convertEurToBgn } from '@/utils/currency';

interface DenominationGridProps {
  denominations: EuroDenomination[];
  onQuantityChange: (id: string, quantity: number) => void;
  language: string;
  showBgn: boolean;
}

function DenominationCard({
  denomination,
  onQuantityChange,
  language,
  showBgn,
  selectedId,
  onSelect
}: {
  denomination: EuroDenomination;
  onQuantityChange: (id: string, quantity: number) => void;
  language: string;
  showBgn: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const totalValue = denomination.quantity * denomination.value;
  const inputRef = useRef<HTMLInputElement>(null);
  const isSelected = selectedId === denomination.id;

  // Goal-based progress: 50 units per denomination
  const GOAL_QUANTITY = 50;
  const progressPercent = Math.min((denomination.quantity / GOAL_QUANTITY) * 100, 100);
  const isOverachieved = denomination.quantity > GOAL_QUANTITY;
  const remainingToGoal = Math.max(0, GOAL_QUANTITY - denomination.quantity);

  const handleIncrement = () => {
    onQuantityChange(denomination.id, denomination.quantity + 1);
  };

  const handleDecrement = () => {
    onQuantityChange(denomination.id, Math.max(0, denomination.quantity - 1));
  };

  const handleQuickAdd5 = () => {
    onQuantityChange(denomination.id, denomination.quantity + 5);
  };

  const handleInputChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      onQuantityChange(denomination.id, numValue);
    }
  };

  // Keyboard shortcuts for this card
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={() => onSelect?.(denomination.id)}
        className={`relative p-4 bg-white dark:bg-slate-800/50 backdrop-blur border-slate-200 dark:border-slate-700 transition-all duration-300 cursor-pointer group
          ${isSelected
            ? 'ring-2 ring-emerald-500 shadow-lg scale-105'
            : 'hover:shadow-lg hover:scale-102 hover:border-emerald-400 dark:hover:border-emerald-600'
          }`}
      >
        <div className="space-y-4">
          {/* Denomination Label & Total with Animation */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white block">
                {denomination.label}
              </span>
              <motion.div
                key={totalValue}
                initial={{ scale: 1.1, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1"
              >
                {showBgn ? formatBGN(convertEurToBgn(totalValue), language) : formatEuro(totalValue, language)}
              </motion.div>
            </div>
            {denomination.quantity > 0 && (
              <motion.div
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-bold shadow-md"
              >
                {denomination.quantity}
              </motion.div>
            )}
          </div>

          {/* Progress Bar - Goal: 50 units */}
          <div className="space-y-1.5">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
              style={{ originX: 0 }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverachieved
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-orange-500/50'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
              />
            </motion.div>
            {/* Goal Progress Label */}
            <div className="flex justify-between items-center px-0.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {denomination.quantity}/{GOAL_QUANTITY}
              </span>
              {isOverachieved ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full"
                >
                  🎉 +{denomination.quantity - GOAL_QUANTITY}
                </motion.span>
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {remainingToGoal} to go
                </span>
              )}
            </div>
          </div>

          {/* Input with +/- */}
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={denomination.quantity === 0}
                className="h-10 w-10 bg-slate-50 dark:bg-slate-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-500 transition-colors disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </motion.div>
            <Input
              ref={inputRef}
              type="number"
              value={denomination.quantity}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => onSelect?.(denomination.id)}
              className="flex-1 text-center font-semibold text-lg h-10 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              min="0"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                className="h-10 w-10 bg-slate-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Quick Add 5 & Clear */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickAdd5}
                className="w-full bg-slate-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" />
                +5
              </Button>
            </motion.div>
            {denomination.quantity > 0 && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onQuantityChange(denomination.id, 0)}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  Clear
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function DenominationGrid({ denominations, onQuantityChange, language, showBgn }: DenominationGridProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'coins' | 'banknotes'>('coins');
  const [selectedId, setSelectedId] = useState<string>('');
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Separate coins and banknotes
  const coins = denominations.filter(d => d.type === 'coin');
  const banknotes = denominations.filter(d => d.type === 'banknote');

  const currentDenominations = selectedTab === 'coins' ? coins : banknotes;

  const handleClearAllCoins = () => {
    coins.forEach(denom => {
      if (denom.quantity > 0) {
        onQuantityChange(denom.id, 0);
      }
    });
  };

  const handleClearAllBanknotes = () => {
    banknotes.forEach(denom => {
      if (denom.quantity > 0) {
        onQuantityChange(denom.id, 0);
      }
    });
  };

  const hasCoins = coins.some(d => d.quantity > 0);
  const hasBanknotes = banknotes.some(d => d.quantity > 0);

  // Keyboard shortcuts for number keys
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = parseInt(e.key, 10);

      // Handle number keys 1-8 for coin/banknote selection and increment
      if (!isNaN(key) && key >= 0 && key <= 9 && !selectedId) {
        const target = currentDenominations[key];
        if (target) {
          onQuantityChange(target.id, target.quantity + 1);
          e.preventDefault();
        }
      }

      // Tab between coins/banknotes with Tab key
      if (e.key === 'Tab') {
        setSelectedTab(selectedTab === 'coins' ? 'banknotes' : 'coins');
        e.preventDefault();
      }

      // Navigate between denominations with arrow keys
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (selectedId) {
          const currentIndex = currentDenominations.findIndex(d => d.id === selectedId);
          if (e.key === 'ArrowLeft' && currentIndex > 0) {
            setSelectedId(currentDenominations[currentIndex - 1].id);
          } else if (e.key === 'ArrowRight' && currentIndex < currentDenominations.length - 1) {
            setSelectedId(currentDenominations[currentIndex + 1].id);
          }
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedId, currentDenominations, onQuantityChange, selectedTab]);

  // Handle touch swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;

    if (touchStart && endX) {
      const distance = touchStart - e.changedTouches[0].clientX;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe) {
        setSelectedTab(selectedTab === 'coins' ? 'banknotes' : 'coins');
      } else if (isRightSwipe) {
        setSelectedTab(selectedTab === 'banknotes' ? 'coins' : 'banknotes');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={selectedTab}
        onValueChange={(v) => setSelectedTab(v as 'coins' | 'banknotes')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
          <TabsTrigger
            value="coins"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            {t('denominations.coin')}
          </TabsTrigger>
          <TabsTrigger
            value="banknotes"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            {t('denominations.banknote')}
          </TabsTrigger>
        </TabsList>

        <motion.div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <TabsContent value="coins" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {coins.filter(c => c.quantity > 0).length} active
              </div>
              {hasCoins && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllCoins}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('actions.clearAll') || 'Clear All'}
                  </Button>
                </motion.div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {coins.map((denomination) => (
                <DenominationCard
                  key={denomination.id}
                  denomination={denomination}
                  onQuantityChange={onQuantityChange}
                  language={language}
                  showBgn={showBgn}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="banknotes" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {banknotes.filter(b => b.quantity > 0).length} active
              </div>
              {hasBanknotes && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllBanknotes}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('actions.clearAll') || 'Clear All'}
                  </Button>
                </motion.div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {banknotes.map((denomination) => (
                <DenominationCard
                  key={denomination.id}
                  denomination={denomination}
                  onQuantityChange={onQuantityChange}
                  language={language}
                  showBgn={showBgn}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          </TabsContent>
        </motion.div>
      </Tabs>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-xs text-slate-400 dark:text-slate-500 text-center pt-4 border-t border-slate-200 dark:border-slate-700"
      >
        💡 <span className="hidden md:inline">Press number keys to add • Arrow keys to navigate • Tab to switch view • Swipe on mobile</span>
        <span className="md:hidden">Swipe to switch • Arrow keys to navigate</span>
      </motion.div>
    </div>
  );
}
