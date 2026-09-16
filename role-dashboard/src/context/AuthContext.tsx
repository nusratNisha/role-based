import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  AuthState,
  LoginCredentials,
  RegisterData,
} from '@/types';

import { api } from '@/api/client';

interface AuthContextType
  extends AuthState {
  login: (
    credentials: LoginCredentials,
  ) => Promise<void>;

  register: (
    data: RegisterData,
  ) => Promise<void>;

  logout: () => void;

  isLoading: boolean;
}

export const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children,
}) => {
  /*
   * ---------------------------------------------------------
   * AUTH STATE
   * ---------------------------------------------------------
   */

  const [state, setState] =
    useState<AuthState>({
      user: null,
      token: null,
      isAuthenticated: false,
    });

  const [isLoading, setIsLoading] =
    useState(true);

  /*
   * ---------------------------------------------------------
   * RESTORE LOGIN SESSION
   * ---------------------------------------------------------
   *
   * When React starts:
   *
   * 1. Check localStorage for accessToken.
   * 2. If there is no token, remain logged out.
   * 3. If there is a token, ask DGHS for the current user.
   */

  useEffect(() => {
    const initAuth =
      async () => {
        try {
          const token =
            api.getToken();

          /*
           * No access token.
           */
          if (!token) {
            setState({
              user: null,
              token: null,
              isAuthenticated: false,
            });

            return;
          }

          /*
           * Access token exists.
           *
           * Validate it with DGHS.
           */
          const user =
            await api.getCurrentUser();

          /*
           * Get the token again because
           * an interceptor may have refreshed it.
           */
          const currentToken =
            api.getToken();

          if (!currentToken) {
            throw new Error(
              'Authentication token is missing after validation.',
            );
          }

          setState({
            user,

            token:
              currentToken,

            isAuthenticated:
              true,
          });
        } catch (error) {
          console.error(
            'Failed to restore authentication:',
            error,
          );

          /*
           * Invalid/expired authentication.
           */
          api.clearToken();

          setState({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        } finally {
          setIsLoading(false);
        }
      };

    void initAuth();
  }, []);

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   *
   * AuthContext DOES NOT manually process tokens.
   *
   * api.login() handles:
   *
   * DGHS login
   *      ↓
   * access token
   *      ↓
   * refresh token
   *      ↓
   * localStorage
   *      ↓
   * mapped User
   */

  const login =
    useCallback(
      async (
        credentials: LoginCredentials,
      ) => {
        /*
         * Call DGHS login.
         */
        const user =
          await api.login(
            credentials,
          );

        /*
         * Get the access token that
         * api.login() stored.
         */
        const accessToken =
          api.getToken();

        /*
         * Make absolutely sure
         * authentication succeeded.
         */
        if (!accessToken) {
          throw new Error(
            'Login succeeded but the access token was not stored.',
          );
        }

        /*
         * Update React authentication state.
         */
        setState({
          user,

          token:
            accessToken,

          isAuthenticated:
            true,
        });
      },
      [],
    );

  /*
   * ---------------------------------------------------------
   * REGISTER
   * ---------------------------------------------------------
   *
   * The current DGHS authentication API
   * integration does not have a verified
   * registration endpoint yet.
   */

  const register =
    useCallback(
      async (
        _data: RegisterData,
      ) => {
        throw new Error(
          'Registration is not available through the DGHS authentication API.',
        );
      },
      [],
    );

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const logout =
    useCallback(
      () => {
        /*
         * Immediately update the UI.
         */
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        /*
         * Call DGHS logout.
         *
         * api.logout() also clears localStorage.
         */
        void api
          .logout()
          .catch(
            (error) => {
              console.error(
                'Logout request failed:',
                error,

              );

              /*
               * Even if DGHS logout fails,
               * remove local tokens.
               */
              api.clearToken();
            },
          );
      },
      [],
    );

  /*
   * ---------------------------------------------------------
   * PROVIDER
   * ---------------------------------------------------------
   */

  return (
    <AuthContext.Provider
      value={{
        ...state,

        login,

        register,

        logout,

        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};