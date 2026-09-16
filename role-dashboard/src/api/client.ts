import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import {
  LoginCredentials,
  User,
  UserRole,
} from '@/types';

const DGHS_API_BASE_URL = '/api/auth/api/v1';

interface DghsUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  auth_provider: string;
  is_active: boolean;
  must_change_password: boolean;
  hris_id: string | null;
  facility_id: string | null;
  lab_id: string | null;
  mobile: string | null;
  first_name: string;
  last_name: string;
  division_id: string | null;
  district_id: string | null;
  upazila_id: string | null;
  union_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DghsAuthResponse {
  user: DghsUser;
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

interface DghsTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private dghsClient: AxiosInstance;

  constructor() {
    this.dghsClient = axios.create({
      baseURL: DGHS_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.dghsClient.interceptors.request.use((config) => {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    });

    this.dghsClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest =
          error.config as RetryableRequestConfig;

        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          !originalRequest?.url?.includes('/auth/login') &&
          !originalRequest?.url?.includes('/auth/refresh')
        ) {
          originalRequest._retry = true;

          try {
            const tokenResponse =
              await this.refreshToken();

            if (tokenResponse.access_token) {
              localStorage.setItem(
                'accessToken',
                tokenResponse.access_token,
              );

              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${tokenResponse.access_token}`,
              };

              return this.dghsClient.request(
                originalRequest,
              );
            }
          } catch {
            this.clearToken();
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async dghsRequest<T>(
    config: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> =
      await this.dghsClient.request<T>(config);

    return response.data;
  }

  setToken(
    accessToken: string,
    refreshToken: string,
  ) {
    localStorage.setItem(
      'accessToken',
      accessToken,
    );

    localStorage.setItem(
      'refreshToken',
      refreshToken,
    );
  }

  clearToken() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  async login(
    credentials: LoginCredentials,
  ): Promise<User> {
    const response =
      await this.dghsRequest<DghsAuthResponse>({
        method: 'POST',
        url: '/auth/login',
        data: {
          email: credentials.email,
          password: credentials.password,
        },
      });

    console.log('DGHS LOGIN RESPONSE:', response);

    if (!response.tokens) {
      throw new Error(
        'DGHS login response does not contain tokens',
      );
    }

    if (!response.tokens.access_token) {
      throw new Error(
        'DGHS login response does not contain an access token',
      );
    }

    if (!response.tokens.refresh_token) {
      throw new Error(
        'DGHS login response does not contain a refresh token',
      );
    }

    this.setToken(
      response.tokens.access_token,
      response.tokens.refresh_token,
    );

    console.log(
      'Access token saved:',
      !!localStorage.getItem('accessToken'),
    );

    console.log(
      'Refresh token saved:',
      !!localStorage.getItem('refreshToken'),
    );

    return this.mapUser(response.user);
  }

  async getCurrentUser(): Promise<User> {
    const response =
      await this.dghsRequest<DghsUser>({
        method: 'GET',
        url: '/auth/validate',
      });

    return this.mapUser(response);
  }

  async refreshToken(): Promise<DghsTokenResponse> {
    const refreshToken =
      localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error(
        'No refresh token available',
      );
    }

    const response =
      await this.dghsRequest<DghsTokenResponse>({
        method: 'POST',
        url: '/auth/refresh',
        data: {
          refresh_token: refreshToken,
        },
      });

    if (response.access_token) {
      localStorage.setItem(
        'accessToken',
        response.access_token,
      );
    }

    if (response.refresh_token) {
      localStorage.setItem(
        'refreshToken',
        response.refresh_token,
      );
    }

    return response;
  }

  async logout(): Promise<void> {
    const refreshToken =
      localStorage.getItem('refreshToken');

    try {
      if (refreshToken) {
        await this.dghsRequest({
          method: 'POST',
          url: '/auth/logout',
          data: {
            refresh_token: refreshToken,
          },
        });
      }
    } finally {
      this.clearToken();
    }
  }

  private mapUser(
    data: DghsUser,
  ): User {
    const role =
      String(data.role).toLowerCase();

    const userRole: UserRole =
      role === 'admin'
        ? 'admin'
        : role === 'manager'
          ? 'manager'
          : role === 'editor'
            ? 'editor'
            : role === 'facility'
              ? 'facility'
              : 'viewer';

    return {
      id: String(data.id),
      email: data.email,
      firstName:
        data.first_name ||
        data.username ||
        data.email,
      lastName:
        data.last_name || '',
      role: userRole,
      isActive: data.is_active,
      createdAt: data.created_at,
      lastLogin: data.updated_at,
    };
  }
}

export const api = new ApiClient();