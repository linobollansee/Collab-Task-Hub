'use client';

import { useEffect, useState } from 'react';

import { useMembers } from '@/features/members/hooks/useMember';
import { AddMemberProps } from '@/features/members/types';
import { ProjectRole } from '@/features/project/types';
import { useUsers } from '@/features/user/hooks/useUsers';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Button } from '@/shared/ui/Button';
import { Loader } from '@/shared/ui/Loader';
import { Wrapper } from '@/shared/ui/Wrapper';

export function AddMember({ projectId, onClose, members }: AddMemberProps) {
  const { users, isLoading: usersLoading, error: usersError, getUsers } = useUsers();
  const { addMember, isLoading: memberLoading, error: memberError } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    getUsers(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const memberUserId = new Set(members.map((m) => m.userId));
  const availableUsers = users.filter((u) => !memberUserId.has(u.id));

  const handleAdd = async (userId: string) => {
    await addMember(projectId, { userId, role: ProjectRole.MEMBER });
    onClose();
  };

  return (
    <div className="w-full">
      <h3>Add new users to this project</h3>
      {usersError && <p className="mt-2 text-sm text-red-500">{usersError}</p>}

      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="mt-4 flex flex-col gap-2">
        {usersLoading ? (
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        ) : availableUsers.length === 0 ? (
          <p>All users are already members of this project.</p>
        ) : (
          availableUsers.map((u) => (
            <Wrapper key={u.id}>
              <div className="flex w-full flex-col items-start gap-2">
                <p className="flex flex-wrap gap-1 min-w-30 truncate text-sm font-medium">
                  <span>Name:</span>
                  <span>{u.name}</span>
                </p>

                <p className="flex flex-wrap gap-1 min-w-30 truncate text-sm font-medium">
                  <span>Email:</span>
                  <span>{u.email}</span>
                </p>

                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => handleAdd(u.id)}
                  disabled={memberLoading}
                >
                  Add to project
                </Button>
              </div>
            </Wrapper>
          ))
        )}
      </div>
      {memberError && <p className="mt-3 text-sm text-red-500">{memberError}</p>}
    </div>
  );
}
