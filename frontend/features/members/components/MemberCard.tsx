'use client';

import { MemberCardProps } from '@/features/members/types';
import { Button } from '@/shared/ui';
import { Wrapper } from '@/shared/ui/Wrapper';

import { RoleDropdown } from './RoleDropdown';
export function MemberCard({ member, canManage, onChangeRole, onDelete }: MemberCardProps) {
  return (
    <Wrapper>
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-1 md:flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">Name:</span>
            <span className="truncate">{member.user.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">Email:</span>
            <span className="truncate">{member.user.email}</span>
          </div>
        </div>

        <div className="text-sm text-slate-500 md:w-35">
          Role: <span>{member.role}</span>
        </div>

        {canManage && (
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <RoleDropdown value={member.role} onChange={onChangeRole} />

            <Button
              type="button"
              variant="danger"
              className="px-3 py-1.5 text-xs md:w-auto"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
