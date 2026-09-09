export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  assignedToId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  roleDistribution: Record<UserRole, number>;
  monthlyGrowth: { month: string; users: number }[];
  recentActivity: { id: string; action: string; user: string; timestamp: string }[];
}

export type Permission = 
  | 'users:read' 
  | 'users:create' 
  | 'users:update' 
  | 'users:delete'
  | 'settings:read'
  | 'settings:update'
  | 'dashboard:read'
  | 'projects:read'
  | 'projects:create'
  | 'projects:update'
  | 'projects:delete';