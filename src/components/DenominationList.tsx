import { DenominationGrid } from './DenominationGrid';
import { useAppStoreFirebase } from '@/store/useAppStoreFirebase';

export function DenominationList() {
  const { denominations, language, showBgn, setQuantity } = useAppStoreFirebase();

  return (
    <DenominationGrid
      denominations={denominations}
      onQuantityChange={setQuantity}
      language={language}
      showBgn={showBgn}
    />
  );
}
