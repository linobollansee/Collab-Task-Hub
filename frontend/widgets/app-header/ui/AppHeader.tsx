'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthActions, UserDropDown } from '@/widgets/app-header/ui';

export const AppHeader = () => {
  const { isAuth, user, logoutUser } = useAuth();

  return (
    <header className="h-[77px] bg-white border-b border-[var(--color-border-default)] flex items-center">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={50} height={45} />
            <span className="font-medium text-2xl">CollabTask</span>
          </Link>
          <nav>
            {!isAuth ? <AuthActions /> : <UserDropDown user={user} onLogout={logoutUser} />}
          </nav>
        </div>
      </div>
    </header>
  );
};
