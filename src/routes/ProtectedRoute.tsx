// import React from 'react';
// import { RouteProps } from 'wouter';
// import { useAuth } from '../contexts/AuthContext';
// import { isRoleAllowed } from '../utils/getRedirectByRole';
// import { useLocation } from 'wouter';

// interface ProtectedRouteProps extends RouteProps {
//   allowedRoles?: Array<'user' | 'charity' | 'admin'>;
//   children: React.ReactNode;
// }

// export default function ProtectedRoute({ 
//   allowedRoles, 
//   children 
// }: ProtectedRouteProps) {
//   const { user, isLoading } = useAuth();
//   const [location, setLocation] = useLocation();

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <i className="fas fa-spinner fa-spin text-3xl text-primary" />
//       </div>
//     );
//   }

//   if (!user) {
//     // لو مش مسجل دخول، روح للصفحة الرئيسية (هيفتح مودال الـ login)
//     setLocation('/');
//     return null;
//   }

//   // لو في صلاحيات مطلوبة والـ user مش منها
//   if (allowedRoles && !isRoleAllowed(user.roleType, allowedRoles)) {
//     // وجّه للدشبود المناسب حسب دوره
//     switch (user.roleType) {
//       case 'admin':
//         setLocation('/admin');
//         break;
//       case 'charity':
//         setLocation('/dashboard');
//         break;
//       default:
//         setLocation('/user-dashboard');
//     }
//     return null;
//   }

//   return <>{children}</>;
// }
import React from 'react';
import { RouteProps } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { isRoleAllowed } from '../utils/getRedirectByRole';
import { useLocation } from 'wouter';

interface ProtectedRouteProps extends RouteProps {
  allowedRoles?: Array<'user' | 'charity' | 'admin'>;
  children: React.ReactNode;
}

export default function ProtectedRoute({ 
  allowedRoles, 
  children 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <i className="fas fa-spinner fa-spin text-3xl text-primary" />
      </div>
    );
  }

  if (!user) {
    // لو مش مسجل دخول، روح للصفحة الرئيسية (هيفتح مودال الـ login)
    setLocation('/');
    return null;
  }

  // لو في صلاحيات مطلوبة والـ user مش منها
  if (allowedRoles && !isRoleAllowed(user.roleType, allowedRoles)) {
    // وجّه للدشبود المناسب حسب دوره
    switch (user.roleType) {
      case 'admin':
        setLocation('/admin');
        break;
      case 'charity':
        setLocation('/dashboard');
        break;
      case 'user':
      case 'donor':
        setLocation('/user-dashboard');
        break;
      default:
        setLocation('/user-dashboard');
    }
    return null;
  }

  return <>{children}</>;
}