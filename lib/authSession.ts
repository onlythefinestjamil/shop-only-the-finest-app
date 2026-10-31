/**
 * Base44 auth session management for Only The Finest customer accounts.
 *
 * Token is persisted in AsyncStorage and restored into the SDK on launch.
 * Mirrors the Athos Peaks auth-session pattern.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@base44/sdk';
import { getBase44Client, resetBase44Client } from './base44';

export const SESSION_KEY = '@otf/base44-access-token';

export type AuthSessionState = {
  status: 'loading' | 'signed_out' | 'signed_in';
  user: User | null;
  error: string | null;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Restore the token into the SDK, then validate it server-side with auth.me(). */
export async function restoreSession(): Promise<User | null> {
  const client = getBase44Client();
  const token = await AsyncStorage.getItem(SESSION_KEY).catch(() => null);
  if (!token) return null;
  try {
    client.auth.setToken(token, false);
    return await client.auth.me();
  } catch {
    await clearSession();
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  const client = getBase44Client();
  const response = await client.auth.loginViaEmailPassword(email.trim(), password);
  await AsyncStorage.setItem(SESSION_KEY, response.access_token);
  client.auth.setToken(response.access_token, false);
  return response.user;
}

export async function register(email: string, password: string): Promise<void> {
  const client = getBase44Client();
  await client.auth.register({ email: email.trim(), password });
}

export async function verifyOtp(email: string, otpCode: string, password: string): Promise<User> {
  const client = getBase44Client();
  await client.auth.verifyOtp({ email: email.trim(), otpCode: otpCode.trim() });
  return login(email, password);
}

export async function resendOtp(email: string): Promise<void> {
  const client = getBase44Client();
  await client.auth.resendOtp(email.trim());
}

export async function requestPasswordReset(email: string): Promise<void> {
  const client = getBase44Client();
  await client.auth.resetPasswordRequest(email.trim());
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  resetBase44Client();
}

export function isUnauthorizedError(error: unknown): boolean {
  const value = error as { status?: unknown; response?: { status?: unknown } } | null;
  return value?.status === 401 || value?.response?.status === 401;
}

export function authErrorMessage(error: unknown): string {
  return errorMessage(error, 'Authentication failed. Check your details and try again.');
}
