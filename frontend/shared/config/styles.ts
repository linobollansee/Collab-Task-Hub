import { ButtonVariant } from '@/shared/types';

export const BASE_STYLES =
  'cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-input)] transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:pointer-events-none font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-blue-500';

export const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-btn-primary)] hover:bg-[var(--color-btn-primary-hover)] active:bg-[var(--color-btn-primary-active)] disabled:bg-[var(--color-btn-primary-disabled)] text-white',
  secondary:
    'bg-[var(--color-btn-secondary)] hover:bg-[var(--color-btn-secondary-hover)] active:bg-[var(--color-btn-secondary-active)] disabled:bg-[var(--color-btn-secondary-disabled)] text-slate-800',
  danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
};
