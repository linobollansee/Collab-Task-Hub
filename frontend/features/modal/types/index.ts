import { ReactNode } from 'react';

export interface ModalState {
  isOpen: boolean;
  content: ReactNode | null;
  open: (content: ReactNode) => void;
  close: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface ConfirmDeleteModalProps {
  entityName: string;
  onConfirm: () => Promise<void> | void;
}
