export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UsersStore {
  users: User[];
  isLoading: boolean;
  error: string | null;

  getUsers: (search?: string) => Promise<void>;
}
