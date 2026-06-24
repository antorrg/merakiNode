
export type SessionUser = {
  userId: string;
  userEmail: string;
  role: string;
  userName: string | null;
  nickname: string | null;
  enabled: boolean | number;
}