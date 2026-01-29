import { AxiosInstance } from 'axios';

import { UserDto } from '@/features/auth/types';
import { UpdateUserDto } from '@/features/user/types';
import { User } from '@/features/user/types';
import { api } from '@/shared/api/axios';

class UserServices {
  private axios: AxiosInstance = api;

  public async updateProfile(data: UpdateUserDto): Promise<UserDto> {
    try {
      const response = await this.axios.patch<UserDto>('/users/me', data);
      return response.data;
    } catch (e: unknown) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  async getUsers(search?: string): Promise<User[]> {
    const params = search ? { search } : {};
    const res = await this.axios.get<User[]>('/users', { params });
    return res.data;
  }
}

export const userServices = new UserServices();
