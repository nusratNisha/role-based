import { UserRole, Permission } from '@/types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  manager: 3,
  editor: 2,
  viewer: 1,
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'settings:read', 'settings:update',
    'dashboard:read',
    'projects:read', 'projects:create', 'projects:update', 'projects:delete'
  ],
  manager: [
    'users:read', 'users:create', 'users:update',
    'settings:read',
    'dashboard:read',
    'projects:read', 'projects:create', 'projects:update', 'projects:delete'
  ],
  editor: [
    'users:read', 'users:update',
    'dashboard:read',
    'projects:read', 'projects:create', 'projects:update'
  ],
  viewer: [
    'users:read',
    'dashboard:read',
    'projects:read'
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};