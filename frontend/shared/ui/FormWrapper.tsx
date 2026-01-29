import React, { FC } from 'react';

import { FormWrapperProps } from '@/shared/types';

export const FormWrapper: FC<FormWrapperProps> = ({ children, ...rest }) => {
  return (
    <form
      {...rest}
      className={`flex flex-col gap-4 w-full bg-white p-6 rounded-[var(--radius-default)] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]`}
    >
      {children}
    </form>
  );
};
