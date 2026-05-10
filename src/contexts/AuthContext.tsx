import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usersApi } from '../services';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken: string, userData?: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ دالة واحدة فقط لاستخراج الـ user من أي format
  const extractUser = useCallback((data: any): any => {
    return data?.user || data?.finder || data?.data || data?.result || null;
  }, []);

  // ✅ عند أول تحميل — لو في توكن محفوظ جيب بيانات المستخدم
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const d = await usersApi.getProfile();
        const userData = extractUser(d);
        
        if (userData && (userData.roleType || userData.role)) {
          const normalizedUser = {
            ...userData,
            roleType: userData.roleType || userData.role
          };
          setUser(normalizedUser);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('❌ Auth init error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [extractUser]);

  // ✅ دالة اللوجين — واحدة فقط
  const login = async (accessToken: string, refreshToken: string, userData?: any) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // لو جاي بيانات المستخدم من برا، استخدمها فورًا
    if (userData && (userData.roleType || userData.role)) {
      const normalizedUser = {
        ...userData,
        roleType: userData.roleType || userData.role
      };
      setUser(normalizedUser);
      return;
    }

    // لو مفيش بيانات، اطلب البروفايل من الـ API
    try {
      const d = await usersApi.getProfile();
      const fetchedUser = extractUser(d);
      
      if (fetchedUser && (fetchedUser.roleType || fetchedUser.role)) {
        const normalizedUser = {
          ...fetchedUser,
          roleType: fetchedUser.roleType || fetchedUser.role
        };
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error('❌ Login: Failed to fetch full profile', error);
    }
  };

  // ✅ دالة اللوجاوت
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // ✅ دالة الريفرش
  const refreshUser = async () => {
    try {
      const d = await usersApi.getProfile();
      const userData = extractUser(d);
      if (userData && (userData.roleType || userData.role)) {
        const normalizedUser = {
          ...userData,
          roleType: userData.roleType || userData.role
        };
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error('❌ refreshUser error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};