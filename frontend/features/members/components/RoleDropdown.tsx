'use client';

import { useEffect, useRef, useState } from 'react';

import { ProjectRole } from '@/features/project/types';
import { Button } from '@/shared/ui/Button';

type RoleDropdownProps = {
  value: ProjectRole;
  disabled?: boolean;
  onChange: (role: ProjectRole) => void | Promise<void>;
};

export function RoleDropdown({ value, disabled, onChange }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const pick = async (role: ProjectRole) => {
    setIsOpen(false);
    if (role === value) return;
    await onChange(role);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="secondary"
        className="px-3 py-1.5 text-xs"
        onClick={() => setIsOpen((v) => !v)}
      >
        Change role
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-10 w-40 rounded-md border border-slate-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            onClick={() => pick(ProjectRole.ADMIN)}
            disabled={disabled || value === ProjectRole.ADMIN}
          >
            Admin
          </button>

          <button
            type="button"
            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            onClick={() => pick(ProjectRole.MEMBER)}
            disabled={disabled || value === ProjectRole.MEMBER}
          >
            Member
          </button>
        </div>
      ) : null}
    </div>
  );
}
