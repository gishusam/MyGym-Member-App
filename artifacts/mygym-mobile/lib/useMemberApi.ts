import { useAuth } from '@clerk/expo';
import { memberRequest } from '@/lib/member-api';

export function useMemberApi() {
  const { getToken } = useAuth();
  return <T,>(path: string, init?: RequestInit) =>
    memberRequest<T>(getToken, path, init);
}
