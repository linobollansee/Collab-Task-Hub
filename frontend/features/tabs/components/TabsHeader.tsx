import React, { FC } from 'react';

import { TabsHeaderProps } from '@/features/tabs/types';

const TabsHeader: FC<TabsHeaderProps> = ({ children }) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-semibold">{children}</h1>
    </header>
  );
};

export default TabsHeader;
