import React, { useMemo } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';

const ProfileName = () => {
  const { user } = useAuth();

  const initialName = useMemo(() => {
    if (!user?.name) return 'U';
    return user.name.trim()[0]?.toUpperCase() ?? 'U';
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <span className="border-2 border-border-default flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold bg-white shadow-sm">
          {initialName}
        </span>
      </div>
    </div>
  );
};

export default ProfileName;
