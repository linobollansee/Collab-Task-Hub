import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { authServices } from '@/features/auth/api/services/authServices';
import { ResetPasswordFormData, resetPasswordSchema } from '@/features/auth/schemas/auth.schema';
import { Button, FormWrapper, Input } from '@/shared/ui';

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError(null);
      setSuccess(null);
      const response = await authServices.resetPassword(data);
      setSuccess(response.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
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
              <h3 className="text-sm font-medium text-green-800">
                {success}. Redirecting to login...
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <input type="hidden" {...register('token')} />

        <Input
          label="New Password"
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          placeholder="Enter your new password"
          {...register('newPassword')}
        />
      </div>

      <div className="mt-4">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || !!success}
          variant="primary"
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      </div>
    </FormWrapper>
  );
};

export default ResetPasswordForm;
