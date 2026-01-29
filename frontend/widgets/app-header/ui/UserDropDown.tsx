'use client';

import { useState } from 'react';
import Link from 'next/link';

import { HEADER_LINKS } from '../config/navigation';

interface UserDropdownProps {
  user: { name?: string } | null;
  onLogout: () => void;
}

export const UserDropDown = ({ user, onLogout }: UserDropdownProps) => {
  const [open, setOpen] = useState(false);

  const initialName = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <span className="border border-[var(--color-border-default)] grid h-9 w-9 place-items-center rounded-full font-medium">
          {initialName}
        </span>
        <span className={`text-xs text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-44 rounded-[var(--radius-input)] border border-[var(--color-border-default)] bg-white p-1 shadow-lg z-20">
            <Link
              href={HEADER_LINKS.profile}
              className="block rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              Profile
            </Link>

            <Link
              className="block rounded-md px-3 py-2 text-sm "
              type="button"
              href={HEADER_LINKS.login}
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              Logout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
