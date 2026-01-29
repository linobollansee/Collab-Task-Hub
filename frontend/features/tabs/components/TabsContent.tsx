import React, { FC } from 'react';

import { useStoreTabs } from '@/features/tabs/store/use-store-tabs';
import { TabsContentProps } from '@/features/tabs/types';

const TabsContent: FC<TabsContentProps> = ({ content, activeContentIndex }) => {
  const { tabs, activeTabIndex } = useStoreTabs();
  const activeTab = tabs[activeTabIndex];

  if (!activeTab) return null;
  const CurrentComponents = activeTab.component;
  return (
    <div id="tab-content" className="p-3 min-h-75 md:p-3">
      <h2 className="text-xl font-bold mb-4">{content[activeContentIndex].label}</h2>
      <CurrentComponents />
    </div>
  );
};

export default TabsContent;
