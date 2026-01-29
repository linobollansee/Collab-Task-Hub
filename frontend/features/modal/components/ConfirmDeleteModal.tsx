'use client';

import React, { useState } from 'react';

import { useModal } from '@/features/modal/hooks/useModal';
import { ConfirmDeleteModalProps } from '@/features/modal/types';
import { Button } from '@/shared/ui';

const ConfirmDeleteModal = ({ entityName, onConfirm }: ConfirmDeleteModalProps) => {
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      closeModal();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-700">Are you sure you want to delete this {entityName}?</p>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={closeModal} disabled={isLoading}>
            Cancel
          </Button>

          <Button type="button" variant="danger" isLoading={isLoading} onClick={handleConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
