import { useTranslation } from 'react-i18next';
import { DenominationRow } from './DenominationRow';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';

export function DenominationList() {
  const { t } = useTranslation();
  const { denominations, language, showBgn, setQuantity } = useAppStoreFirebase();

  // Separate coins and banknotes
  const coins = denominations.filter(d => d.type === 'coin');
  const banknotes = denominations.filter(d => d.type === 'banknote');

  return (
    <div className="space-y-6">
      {/* Coins Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('denominations.title')} - {t('denominations.coin')}</h3>
        <div className="flex flex-wrap gap-3">
          {coins.map((denomination) => (
            <DenominationRow
              key={denomination.id}
              denomination={denomination}
              onQuantityChange={setQuantity}
              language={language}
              showBgn={showBgn}
            />
          ))}
        </div>

        {/* Banknotes Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('denominations.title')} - {t('denominations.banknote')}</h3>
          <div className="flex flex-wrap gap-3">
            {banknotes.map((denomination) => (
              <DenominationRow
                key={denomination.id}
                denomination={denomination}
                onQuantityChange={setQuantity}
                language={language}
                showBgn={showBgn}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
