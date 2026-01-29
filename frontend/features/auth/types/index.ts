import { Project } from '@/features/project/types';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdProjects: Project[];
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: UserDto;
}

export interface AuthState {
  user: UserDto | null;
  isAuth: boolean;
  isLoading: boolean;
  authError: string | null;
  loginUser: (data: LoginDto) => Promise<void>;
  registerUser: (data: RegisterDto) => Promise<void>;
  logoutUser: () => void;
  restoreUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: { name?: string; email?: string; password?: string }) => Promise<UserDto>;
}
