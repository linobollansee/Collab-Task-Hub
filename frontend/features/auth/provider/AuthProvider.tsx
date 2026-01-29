'use client';
import React, { useEffect } from 'react';

import { useStoreAuth } from '@/features/auth/store/use-store-auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { restoreUser, isLoading } = useStoreAuth();

  useEffect(() => {
    restoreUser();
  }, [restoreUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
