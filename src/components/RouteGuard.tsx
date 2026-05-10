import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { getRedirectByRole } from '../utils/getRedirectByRole';

const ROOT_ONLY_REDIRECT = ['/'];

export function RouteGuard() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const redirectedForRef = useRef<string | null>(null);
  const lastLoginTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      redirectedForRef.current = null;
      return;
    }

    const currentId = user._id || user.email;

    if (redirectedForRef.current === currentId) return;

    if (ROOT_ONLY_REDIRECT.includes(locationRef.current)) {
      redirectedForRef.current = currentId;
      lastLoginTimeRef.current = Date.now();
      setLocation(getRedirectByRole(user.roleType));
    }

  }, [isLoading, user, setLocation]);

  return null;
}
