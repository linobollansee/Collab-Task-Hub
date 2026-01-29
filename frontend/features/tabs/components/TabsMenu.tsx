import React, { FC } from 'react';

import { TabsMenuState } from '@/features/tabs/types';

const TabsMenu: FC<TabsMenuState> = ({ content, activeContentIndex, setActiveContentIndex }) => {
  return (
    <menu className="flex flex-col gap-2 p-2 border-b border-gray-100 bg-gray-50/50 sm:flex-row sm:items-center sm:gap-4">
      {content.map((tab, index) => (
        <button
          key={tab.id}
          onClick={() => setActiveContentIndex(index)}
          className={`
    px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer
    ${
      activeContentIndex === index
        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }
    ${tab.className ?? ''}
  `}
        >
          {tab.label}
        </button>
      ))}
    </menu>
  );
};

export default TabsMenu;
