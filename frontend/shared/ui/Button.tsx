import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { ButtonProps } from '@/shared/types';

import { BASE_STYLES, VARIANT_STYLES } from '../config/styles';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, isLoading, variant = 'primary', className, disabled, ...otherProps } = props;

  const classes = twMerge(clsx(BASE_STYLES, VARIANT_STYLES[variant], className));

  return (
    <button ref={ref} disabled={isLoading || disabled} className={classes} {...otherProps}>
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
