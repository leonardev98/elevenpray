export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'platform_admin';
  avatarUrl: string | null;
}
