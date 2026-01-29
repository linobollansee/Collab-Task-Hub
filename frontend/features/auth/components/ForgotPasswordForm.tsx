import React, { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { authServices } from '@/features/auth/api/services/authServices';
import { ForgotPasswordFormData, forgotPasswordSchema } from '@/features/auth/schemas/auth.schema';
import { Button, FormWrapper, Input } from '@/shared/ui';

const ForgotPasswordForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      setSuccess(null);
      const response = await authServices.forgotPassword(data);
      setSuccess(response.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
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
      </div>

      <div className="mt-4 space-y-4">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} variant="primary">
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <div className="text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </div>
      </div>
    </FormWrapper>
  );
};

export default ForgotPasswordForm;
