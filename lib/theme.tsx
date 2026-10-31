/**
 * Only The Finest — JARVIS-protocol theme system.
 *
 * Dark premium aesthetic matching the Athos Peaks design language, tuned for a
 * premium streetwear shopping app. Purple #9146FF, cyan #38B6FF, emerald #28E5A0.
 * Glassmorphism, glow shadows, corner brackets, gradient surfaces.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';

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
}

export const theme: ThemeTokens = {
  void: '#050308',
  abyss: '#06040D',
  surface: '#0E0A1C',
  surfaceRaised: '#181230',
  surfaceMuted: '#14102A',
  surfaceAccent: '#1A1030',
  surfaceGlass: 'rgba(14, 10, 28, 0.75)',
  surfaceHolographic: 'rgba(145, 70, 255, 0.06)',
  border: '#2A1A4A',
  borderSubtle: '#1F1535',
  borderGlow: 'rgba(145, 70, 255, 0.3)',
  text: '#FFFFFF',
  textMuted: '#A8A3BC',
  textSecondary: '#B56CFF',
  textTertiary: '#7F8FAA',
  textGlow: 'rgba(181, 140, 255, 0.9)',
  primary: '#9146FF',
  primaryMuted: '#5C2E9F',
  secondary: '#38B6FF',
  accent: '#38B6FF',
  success: '#28E5A0',
  warning: '#F2C46D',
  error: '#FF4D5E',
  cardRadius: 20,
  buttonRadius: 14,
  glowOpacity: 0.4,
  hudColor: '#38B6FF',
  gridColor: 'rgba(145, 70, 255, 0.03)',
  bracketColor: 'rgba(145, 70, 255, 0.4)',
};

// ---------------------------------------------------------------------------
// Color ramps (dim → blaze + glow) for premium gradients
// ---------------------------------------------------------------------------

export const colorRamps = {
  purple: {
    dim: '#2A1850',
    low: '#4A2D8C',
    mid: '#6B3FBF',
    base: '#9146FF',
    bright: '#B58CFF',
    blaze: '#D4B8FF',
    glow: '#9146FF',
  },
  blue: {
    dim: '#0D2540',
    low: '#1A4060',
    mid: '#2A6B9F',
    base: '#38B6FF',
    bright: '#6BD0FF',
    blaze: '#A8E2FF',
    glow: '#38B6FF',
  },
  green: {
    dim: '#0A2A1E',
    low: '#145035',
    mid: '#1C7A56',
    base: '#28E5A0',
    bright: '#5CF0BA',
    blaze: '#8FF8D4',
    glow: '#28E5A0',
  },
  amber: {
    dim: '#2A1F08',
    low: '#504010',
    mid: '#8A6B2A',
    base: '#F2C46D',
    bright: '#F8D890',
    blaze: '#FCEAB5',
    glow: '#F2C46D',
  },
  red: {
    dim: '#2A0808',
    low: '#501010',
    mid: '#8F2020',
    base: '#FF3B30',
    bright: '#FF6B60',
    blaze: '#FF9E9A',
    glow: '#FF3B30',
  },
} as const;

// ---------------------------------------------------------------------------
// Gradients
// ---------------------------------------------------------------------------

export interface GradientSpec {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const gradients: Record<string, GradientSpec> = {
  screenBg: {
    colors: ['rgba(145,70,255,0.08)', 'rgba(145,70,255,0)'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
  ambientGlow: {
    colors: ['rgba(56,182,255,0.06)', 'rgba(56,182,255,0)'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
  glass: {
    colors: ['rgba(24,18,48,0.85)', 'rgba(8,6,18,0.90)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  primary: {
    colors: ['rgba(145,70,255,0.12)', 'rgba(8,6,18,0.85)'],
    start: { x: 0, y: 0 },
    end: { x: 0.4, y: 1 },
  },
  hero: {
    colors: ['rgba(145,70,255,0.15)', 'rgba(56,182,255,0.08)', 'rgba(8,6,18,0.9)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  active: {
    colors: ['rgba(145,70,255,0.25)', 'rgba(56,182,255,0.12)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primaryButton: {
    colors: ['#9146FF', '#6B3FBF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  successButton: {
    colors: ['#28E5A0', '#1C7A56'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  heroText: {
    colors: ['#B58CFF', '#38B6FF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// ---------------------------------------------------------------------------
// Glow / shadow system
// ---------------------------------------------------------------------------

export interface GlowSpec {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation?: number;
}

export const glow: Record<string, GlowSpec> = {
  subtle: { shadowColor: '#9146FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  medium: { shadowColor: '#9146FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  intense: { shadowColor: '#9146FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.50, shadowRadius: 24, elevation: 10 },
  pulse: { shadowColor: '#9146FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.40, shadowRadius: 20, elevation: 8 },
  cyan: { shadowColor: '#38B6FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  cyanIntense: { shadowColor: '#38B6FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.50, shadowRadius: 24, elevation: 10 },
  emerald: { shadowColor: '#28E5A0', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
};

export const textGlow: TextStyle = {
  shadowColor: '#9146FF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.60,
  shadowRadius: 12,
};

export const shadows: Record<string, ViewStyle> = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  cardRaised: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  glass: { shadowColor: '#9146FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
  button: { shadowColor: '#9146FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.30, shadowRadius: 16 },
  buttonActive: { shadowColor: '#9146FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.50, shadowRadius: 24 },
  hero: { shadowColor: '#9146FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.40, shadowRadius: 32 },
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const type: Record<string, TextStyle> = {
  display: { fontSize: 56, fontWeight: '800', letterSpacing: -2, fontVariant: ['tabular-nums'] },
  displaySm: { fontSize: 42, fontWeight: '800', letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  section: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subsection: { fontSize: 17, fontWeight: '800' },
  body: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5 },
  telemetry: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, fontVariant: ['tabular-nums'] },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, display: 48, hero: 64 } as const;
export const radii = { sm: 10, md: 14, lg: 18, xl: 24 } as const;

export const hudBracket = { width: 14, height: 14, borderWidth: 1, borderColor: 'rgba(145,70,255,0.4)' } as const;

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

/** Glow textShadow helper. */
export function glowText(color: string, radius = 12): { textShadowColor: string; textShadowRadius: number } {
  return { textShadowColor: color, textShadowRadius: radius };
}

/** Converts a 0–1 progress value into a gradient pair. */
export function progressGradient(value: number): [string, string] {
  if (value >= 0.75) return [colorRamps.green.bright, colorRamps.green.base];
  if (value >= 0.5) return [colorRamps.green.base, colorRamps.blue.base];
  if (value >= 0.25) return [colorRamps.amber.base, colorRamps.amber.bright];
  return [colorRamps.red.bright, colorRamps.red.base];
}
