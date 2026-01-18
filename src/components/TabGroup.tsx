import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DenominationList } from './DenominationList';
import { HistoryTab } from './HistoryTab';
import { SettingsTab } from './SettingsTab';

export function TabGroup() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('breakdown');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="breakdown">
          {t('tabs.breakdown')}
        </TabsTrigger>
        <TabsTrigger value="history">
          {t('tabs.history')}
        </TabsTrigger>
        <TabsTrigger value="settings">
          {t('tabs.settings')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="breakdown" className="mt-6">
        <DenominationList />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <HistoryTab />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}
