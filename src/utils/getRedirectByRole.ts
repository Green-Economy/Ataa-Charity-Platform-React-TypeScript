export function getRedirectByRole(role?: string | null): string {
  if (!role || typeof role !== 'string') return '/';
  
  const normalizedRole = role.toLowerCase().trim().replace(/\s+/g, '');
  
  switch (normalizedRole) {
    case 'admin':
    case 'مدير':
      return '/admin';
    case 'charity':
    case 'جمعية':
    case 'charityorganization':
      return '/dashboard';
    case 'user':
    case 'متبرع':
    case 'donor':
      return '/user-dashboard';
    default:
      console.warn('⚠️ Unknown role:', role);
      return '/';
  }
}

// ✅ أضف الفانكشن دي هنا
export function isRoleAllowed(role: string | undefined, allowedRoles: string[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}