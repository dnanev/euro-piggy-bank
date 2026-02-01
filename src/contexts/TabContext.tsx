import React, { createContext, useState } from 'react'
import type { ReactNode } from 'react'

interface TabContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export { TabContext }

interface TabProviderProps {
  children: ReactNode
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('breakdown')

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export const useTabContext = () => {
  const context = React.useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTabContext must be used within a TabProvider')
  }
  return context
}
