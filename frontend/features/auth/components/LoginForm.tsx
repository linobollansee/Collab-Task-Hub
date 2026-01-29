import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginFormData, loginSchema } from '@/features/auth/schemas/auth.schema';
import { Button, FormWrapper, Input } from '@/shared/ui';

const LoginForm = () => {
  const router = useRouter();
  const { loginUser, authError, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser(data);
      router.push('/');
    } catch {}
  };

  return (
    <FormWrapper onSubmit={handleSubmit(onSubmit)}>
      {authError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{authError}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          placeholder="Enter your email address"
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          placeholder="Enter your password"
          {...register('password')}
        />

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <Button
          type="submit"
          isLoading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
          variant="primary"
        >
          {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
    </FormWrapper>
  );
};

export default LoginForm;
