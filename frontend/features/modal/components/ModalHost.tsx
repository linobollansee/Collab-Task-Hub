'use client';

import Modal from '@/features/modal/components/Modal';
import { useStoreModal } from '@/features/modal/store/use-store-modal';

export function ModalHost() {
  const isOpen = useStoreModal((s) => s.isOpen);
  const content = useStoreModal((s) => s.content);
  const close = useStoreModal((s) => s.close);

  return (
    <Modal isOpen={isOpen} onClose={close}>
      {content}
    </Modal>
  );
}
