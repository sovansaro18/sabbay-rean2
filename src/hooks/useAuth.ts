import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '../types';

export function useAuth() {
  const queryClient = useQueryClient();

  // Query: Get current authenticated user
  const { data: currentUser, isLoading: isAuthLoading, error: authError } = useQuery<UserProfile | null, Error>({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401 || res.status === 403) {
          return null;
        }
        if (!res.ok) {
          throw new Error('មិនអាចផ្ទៀងផ្ទាត់គណនីបានទេ');
        }
        return await res.json();
      } catch (err) {
        return null; // Return null instead of breaking if unauthenticated
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 mins
  });

  // Mutation: Register
  const registerMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; password: string; avatarUrl?: string }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ចុះឈ្មោះមិនបានសម្រេចឡើយ');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth-me'], data);
      localStorage.setItem('sabbay_user', JSON.stringify(data));
    },
  });

  // Mutation: Login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ការចូលប្រើប្រាស់មិនត្រឹមត្រូវឡើយ');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth-me'], data);
      localStorage.setItem('sabbay_user', JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-sync'] });
    },
  });

  // Mutation: Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) {
        throw new Error('ការចាកចេញមានបញ្ហា');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth-me'], null);
      localStorage.removeItem('sabbay_user');
      queryClient.clear(); // Clear all cached queries upon logout
    },
  });

  // Query: Get all users (Admin only)
  const { data: users = [], isLoading: isUsersLoading } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកបញ្ជីអ្នកប្រើប្រាស់បានទេ');
      }
      return await res.json();
    },
    enabled: !!currentUser?.isAdmin,
  });

  // Mutation: Update User Role/Profile
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<UserProfile> & { id: string }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        throw new Error('ការធ្វើបច្ចុប្បន្នភាពគណនីមានបញ្ហា');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation: Delete User
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('មិនអាចលុបគណនីនេះបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    currentUser,
    isAuthLoading,
    authError,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    users,
    isUsersLoading,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
  };
}
