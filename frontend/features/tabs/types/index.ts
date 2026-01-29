import React, { ComponentType } from 'react';

export interface TabsProps {
  projectId: string;
}

export interface TabsHeaderProps {
  children: React.ReactNode;
}

export interface TabItemProps {
  id: string;
  label: string;
  component: ComponentType;
  className?: string;
}

export interface TabsContentProps {
  content: TabItemProps[];
  activeContentIndex: number;
}

export interface TabsMenuState extends TabsContentProps {
  setActiveContentIndex: (index: number) => void;
}
