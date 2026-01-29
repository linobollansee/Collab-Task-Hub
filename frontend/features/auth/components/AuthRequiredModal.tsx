'use client';

import Link from 'next/link';

import { useModal } from '@/features/modal/hooks/useModal';

export function AuthRequiredModal() {
  const { closeModal } = useModal();

  return (
    <div className="w-[340px]">
      <h3 className="text-lg font-semibold">Login required</h3>
      <p className="mt-2 text-sm text-slate-600">To open this project, you need to be logged in.</p>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" onClick={closeModal} className="text-primary hover:underline">
          Login
        </Link>
        <span className="mx-1 text-slate-500">or</span>
        <Link href="/register" onClick={closeModal} className="text-primary hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
