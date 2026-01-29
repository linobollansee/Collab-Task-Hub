import { useStoreModal } from '../store/use-store-modal';

export const useModal = () => {
  const open = useStoreModal((s) => s.open);
  const close = useStoreModal((s) => s.close);

  return { openModal: open, closeModal: close };
};
