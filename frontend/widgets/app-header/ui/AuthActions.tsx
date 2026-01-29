import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { LINK_CLASSES } from '@/widgets/app-header/config/styles';

import { HEADER_LINKS } from '../config/navigation';

const classes = twMerge(clsx(LINK_CLASSES));

export const AuthActions = () => (
  <menu className="flex gap-3.5">
    <Link href={HEADER_LINKS.login} className={classes}>
      Login
    </Link>
    <Link href={HEADER_LINKS.register} className={classes}>
      Register
    </Link>
  </menu>
);
