/**
 * Only The Finest — premium streetwear theme system.
 *
 * Clean, minimal aesthetic matching shoponlythefinest.com:
 * black backgrounds, white text, subtle warm-gold accents.
 * No glassmorphism, no glow, no holographic effects.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { CormorantGaramond_300Light, CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

// ---------------------------------------------------------------------------
// Core tokens
// ---------------------------------------------------------------------------

export interface ThemeTokens {
  // surfaces
  void: string;
  abyss: string;
  surface: string;
  surfaceRaised: string;
  surfaceMuted: string;
  surfaceAccent: string;
  surfaceGlass: string;
  surfaceHolographic: string;
  // borders
  border: string;
  borderSubtle: string;
  borderGlow: string;
  // text
  text: string;
  textMuted: string;
  textSecondary: string;
  textTertiary: string;
  textGlow: string;
  // accents
  primary: string;
  primaryMuted: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  // layout
  cardRadius: number;
  buttonRadius: number;
  glowOpacity: number;
  hudColor: string;
  gridColor: string;
  bracketColor: string;
  // typography — exact site fonts
  /** Headings — Cormorant Garamond (site serif) */
  fontHeading: string;
  fontHeadingMedium: string;
  /** Body — Space Grotesk (site sans) */
  fontBody: string;
  fontBodyMedium: string;
  fontBodySemiBold: string;
  fontBodyBold: string;
}

export const theme: ThemeTokens = {
  void: '#000000',
  abyss: '#0a0a0a',
  surface: '#141414',
  surfaceRaised: '#181818',
  surfaceMuted: '#161616',
  surfaceAccent: '#1a1a1a',
  surfaceGlass: '#141414',
  surfaceHolographic: '#141414',
  border: '#222222',
  borderSubtle: '#181818',
  borderGlow: '#222222',
  text: '#f5f5f5',
  textMuted: '#888888',
  textSecondary: '#cccccc',
  textTertiary: '#555555',
  textGlow: '#f5f5f5',
  primary: '#ffffff',
  primaryMuted: '#333333',
  secondary: '#F3D068',
  accent: '#F3D068',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#ef4444',
  cardRadius: 12,
  buttonRadius: 10,
  glowOpacity: 0,
  hudColor: '#888888',
  gridColor: '#111111',
  bracketColor: '#222222',
  // typography — exact site fonts (loaded in root layout)
  fontHeading: 'CormorantGaramond_300Light',
  fontHeadingMedium: 'CormorantGaramond_500Medium',
  fontBody: 'SpaceGrotesk_400Regular',
  fontBodyMedium: 'SpaceGrotesk_500Medium',
  fontBodySemiBold: 'SpaceGrotesk_600SemiBold',
  fontBodyBold: 'SpaceGrotesk_700Bold',
};

/** Font map for useFonts() in the root layout */
export const appFonts = {
  CormorantGaramond_300Light,
  CormorantGaramond_500Medium,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const type: Record<string, object> = {
  display: { fontSize: 56, fontWeight: '800' as const, letterSpacing: -2 },
  title: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  section: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.3 },
  body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '600' as const, lineHeight: 18 },
  label: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1.6 },
  eyebrow: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 2.5 },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, display: 48, hero: 64 } as const;
export const radii = { sm: 8, md: 10, lg: 12, xl: 16 } as const;

// ---------------------------------------------------------------------------
// Context (always dark premium)
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeTokens>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => theme, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}
