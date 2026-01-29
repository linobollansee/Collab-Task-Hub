'use client';

import { MembersListProps } from '@/features/members/types';

import { MemberCard } from './MemberCard';

export function MembersList({
  members,
  adminRole,
  onDelete,
  onChangeRole,
  lastAdminId,
}: MembersListProps) {
  if (members.length === 0) {
    return <p>No members yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((member) => {
        const isLastAdmin = member.id === lastAdminId;
        return (
          <MemberCard
            key={member.id}
            member={member}
            canManage={adminRole}
            isLastAdmin={isLastAdmin}
            onDelete={() => onDelete(member.id, isLastAdmin)}
            onChangeRole={(role) => onChangeRole(member.id, role, isLastAdmin)}
          />
        );
      })}
    </div>
  );
}
