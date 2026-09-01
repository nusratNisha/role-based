import { LoginCredentials, RegisterData, User, DashboardStats } from '@/types';

// FastAPI
const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // MOCK: Replace with actual API call
    // return this.request('/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify(credentials),
    // });

    // Mock implementation for demo
    await new Promise(r => setTimeout(r, 800));
    
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    const mockToken = 'mock_jwt_token_' + Math.random();
    return { user: mockUser, token: mockToken };
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    await new Promise(r => setTimeout(r, 800));
    
    const mockUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'viewer',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    return { user: mockUser, token: 'mock_jwt_token_' + Math.random() };
  }

  async getCurrentUser(): Promise<User> {
    await new Promise(r => setTimeout(r, 500));
    return {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }

  // Users
  async getUsers(): Promise<User[]> {
    await new Promise(r => setTimeout(r, 600));
    return [
      { id: '1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin', isActive: true, createdAt: '2024-01-15T10:00:00Z' },
      { id: '2', email: 'manager@example.com', firstName: 'Jane', lastName: 'Manager', role: 'manager', isActive: true, createdAt: '2024-02-20T10:00:00Z' },
      { id: '3', email: 'editor@example.com', firstName: 'Bob', lastName: 'Editor', role: 'editor', isActive: true, createdAt: '2024-03-10T10:00:00Z' },
      { id: '4', email: 'viewer@example.com', firstName: 'Alice', lastName: 'Viewer', role: 'viewer', isActive: false, createdAt: '2024-04-05T10:00:00Z' },
    ];
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await new Promise(r => setTimeout(r, 600));
    return { ...user, id: Date.now().toString(), createdAt: new Date().toISOString() };
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    await new Promise(r => setTimeout(r, 600));
    return { ...user, id } as User;
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise(r => setTimeout(r, 600));
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(r => setTimeout(r, 700));
    return {
      totalUsers: 156,
      activeUsers: 134,
      newUsersThisMonth: 23,
      roleDistribution: { admin: 4, manager: 12, editor: 45, viewer: 95 },
      monthlyGrowth: [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 132 },
        { month: 'Mar', users: 128 },
        { month: 'Apr', users: 145 },
        { month: 'May', users: 156 },
        { month: 'Jun', users: 156 },
      ],
      recentActivity: [
        { id: '1', action: 'Created new user', user: 'Admin User', timestamp: '2024-06-15T10:30:00Z' },
        { id: '2', action: 'Updated role permissions', user: 'Manager Jane', timestamp: '2024-06-15T09:15:00Z' },
        { id: '3', action: 'Deleted inactive account', user: 'Admin User', timestamp: '2024-06-14T16:45:00Z' },
        { id: '4', action: 'Updated profile', user: 'Bob Editor', timestamp: '2024-06-14T14:20:00Z' },
      ],
    };
  }
}

export const api = new ApiClient();