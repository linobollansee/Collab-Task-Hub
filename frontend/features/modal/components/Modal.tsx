'use client';

import { useRef, useState } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [rendered, setRendered] = useState(false);
  const [closing, setClosing] = useState(false);

  if (isOpen && !rendered) {
    setRendered(true);
    setClosing(false);
  }

  if (!isOpen && rendered && !closing) {
    setClosing(true);
  }

  const requestClose = () => {
    onClose();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      requestClose();
    }
  };

  if (!rendered) return null;

  return (
    <div
      onPointerDown={handlePointerDown}
      className={[
        'fixed inset-0 z-50 flex items-center justify-center p-4 outline-none',
        closing ? 'animate-modal-overlay-out' : 'animate-modal-overlay-in',
      ].join(' ')}
      onAnimationEnd={() => {
        if (closing) {
          setRendered(false);
          setClosing(false);
        }
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        ref={modalRef}
        className={[
          'relative w-full max-w-md rounded-lg bg-white shadow-lg',
          closing ? 'animate-modal-panel-out' : 'animate-modal-panel-in',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={requestClose}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          ✕
        </button>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
