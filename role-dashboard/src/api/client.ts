import { LoginCredentials, RegisterData, User, DashboardStats, Project, ProjectStatus } from '@/types';

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
      credentials: 'include',
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
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    return {
      user: this.mapUser(response.user),
      token: response.token,
    };
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'viewer',
        is_active: true,
      }),
    });
    
    return {
      user: this.mapUser(response.user),
      token: response.token,
    };
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<any>('/auth/me');
    return this.mapUser(response);
  }

  // Users
  async getUsers(): Promise<User[]> {
    const users = await this.request<any[]>('/users');
    return users.map(user => this.mapUser(user));
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const response = await this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: 'ChangeMe123!',
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        is_active: user.isActive,
      }),
    });
    return this.mapUser(response);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        is_active: user.isActive,
      }),
    });
    return this.mapUser(response);
  }

  async deleteUser(id: string): Promise<void> {
    await this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const projects = await this.request<any[]>('/projects');
    return projects.map(project => this.mapProject(project));
  }

  async createProject(data: {
    name: string;
    description?: string;
    status: ProjectStatus;
    assignedToId: string;
  }): Promise<Project> {
    const response = await this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        status: data.status,
        assigned_to_id: data.assignedToId,
      }),
    });
    return this.mapProject(response);
  }

  async updateProject(id: string, data: Partial<{
    name: string;
    description: string;
    status: ProjectStatus;
    assignedToId: string;
  }>): Promise<Project> {
    const response = await this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        status: data.status,
        assigned_to_id: data.assignedToId,
      }),
    });
    return this.mapProject(response);
  }

  async deleteProject(id: string): Promise<void> {
    await this.request<void>(`/projects/${id}`, { method: 'DELETE' });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return await this.request<DashboardStats>('/dashboard/stats');
  }

  // Helper to convert snake_case to camelCase
  private mapUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      role: data.role as any,
      isActive: data.is_active !== undefined ? data.is_active : data.isActive,
      createdAt: data.created_at || data.createdAt,
      lastLogin: data.last_login || data.lastLogin,
    };
  }

  private mapProject(data: any): Project {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      assignedToId: data.assigned_to_id || data.assignedToId,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
    };
  }
}

export const api = new ApiClient();