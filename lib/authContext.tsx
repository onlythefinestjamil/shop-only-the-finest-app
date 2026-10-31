/**
 * Auth context — customer accounts for Only The Finest.
 * Wraps the Base44 auth session (login, register, OTP verify, logout).
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@base44/sdk';
import {
  authErrorMessage,
  clearSession,
  login as loginBase44,
  register as registerBase44,
  resendOtp as resendOtpBase44,
  requestPasswordReset as resetRequestBase44,
  restoreSession,
  verifyOtp as verifyOtpBase44,
  type AuthSessionState,
} from './authSession';

interface AuthContextValue extends AuthSessionState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, password: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthSessionState>({ status: 'loading', user: null, error: null });

  useEffect(() => {
    let active = true;
    restoreSession()
      .then((user) => {
        if (active) setState({ status: user ? 'signed_in' : 'signed_out', user, error: null });
      })
      .catch((error) => {
        if (active) setState({ status: 'signed_out', user: null, error: authErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login: async (email, password) => {
        try {
          const user = await loginBase44(email, password);
          setState({ status: 'signed_in', user, error: null });
        } catch (error) {
          setState((current) => ({ ...current, error: authErrorMessage(error) }));
          throw error;
        }
      },
      register: async (email, password) => {
        try {
          await registerBase44(email, password);
          setState((current) => ({ ...current, error: null }));
        } catch (error) {
          setState((current) => ({ ...current, error: authErrorMessage(error) }));
          throw error;
        }
      },
      verifyOtp: async (email, otp, password) => {
        try {
          const user = await verifyOtpBase44(email, otp, password);
          setState({ status: 'signed_in', user, error: null });
        } catch (error) {
          setState((current) => ({ ...current, error: authErrorMessage(error) }));
          throw error;
        }
      },
      resendOtp: async (email) => {
        try {
          await resendOtpBase44(email);
        } catch (error) {
          setState((current) => ({ ...current, error: authErrorMessage(error) }));
          throw error;
        }
      },
      requestPasswordReset: async (email) => {
        try {
          await resetRequestBase44(email);
        } catch (error) {
          setState((current) => ({ ...current, error: authErrorMessage(error) }));
          throw error;
        }
      },
      logout: async () => {
        await clearSession();
        setState({ status: 'signed_out', user: null, error: null });
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export type { User };
