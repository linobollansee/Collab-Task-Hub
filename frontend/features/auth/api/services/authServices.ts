import { AxiosInstance } from 'axios';

import {
  AuthResponseDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '@/features/auth/types';
import { api } from '@/shared/api/axios';

class AuthServices {
  private axios: AxiosInstance = api;

  public async registerUser(data: RegisterDto): Promise<AuthResponseDto> {
    try {
      const response = await this.axios.post<AuthResponseDto>('/auth/register', data);
      return response.data;
    } catch (e: unknown) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  public async loginUser(data: LoginDto): Promise<AuthResponseDto> {
    const response = await this.axios.post<AuthResponseDto>('/auth/login', data);
    return response.data;
  }

  public async getCurrentUser() {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No token');

    const { data } = await this.axios.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  }

  public async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const response = await this.axios.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  }

  public async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const response = await this.axios.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }
}

export const authServices = new AuthServices();
