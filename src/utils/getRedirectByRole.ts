export function getRedirectByRole(role?: string | null): string {
  if (!role || typeof role !== 'string') return '/';

  const normalized = role.toLowerCase().trim().replace(/\s+/g, '');

  switch (normalized) {
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

export function isRoleAllowed(role: string | undefined, allowedRoles: string[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}
