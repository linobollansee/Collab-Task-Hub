import { forwardRef } from 'react';

import { InputProps } from '@/shared/types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

        <input
          ref={ref}
          className={`
              bg-(--color-input-bg) 
              border-input-border 
              text-(--color-input-text)
              placeholder-(--color-input-placeholder)
              rounded-(--radius-input)
              border
              py-2.5
              px-4.5
              focus:placeholder-transparent outline-none transition-all duration-300
            ${error ? 'border-red-500 ' : 'border-gray-300 '}
          `}
          {...props}
        />

        {error ? (
          <span className="text-xs text-red-500 mt-1">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-gray-500 mt-1">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
