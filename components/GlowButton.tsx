/**
 * GlowButton — premium gradient button with glow shadow and press haptics.
 */

import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

export type GlowButtonVariant = 'primary' | 'secondary' | 'success' | 'ghost' | 'danger';

export interface GlowButtonProps {
  label: string;
  onPress?: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  variant?: GlowButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function GlowButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = true,
}: GlowButtonProps) {
  const theme = useTheme();

  const gradientFor: Record<GlowButtonVariant, [string, string]> = {
    primary: ['#9146FF', '#6B3FBF'],
    secondary: ['rgba(56,182,255,0.18)', 'rgba(145,70,255,0.12)'],
    success: ['#28E5A0', '#1C7A56'],
    danger: ['#FF4D5E', '#A0232E'],
    ghost: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)'],
  };

  const textColor: Record<GlowButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: theme.text,
    success: '#04130C',
    danger: '#FFFFFF',
    ghost: theme.textMuted,
  };

  const glowColor: Record<GlowButtonVariant, string> = {
    primary: theme.primary,
    secondary: theme.secondary,
    success: theme.success,
    danger: theme.error,
    ghost: 'transparent',
  };

  const colors = gradientFor[variant];
  const [g1, g2] = colors;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        if (disabled || loading) return;
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
          /* no-op */
        }
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          borderRadius: theme.buttonRadius,
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          shadowColor: glowColor[variant],
          shadowOpacity: pressed ? 0.5 : 0.3,
          shadowRadius: pressed ? 20 : 12,
          shadowOffset: { width: 0, height: 0 },
          elevation: pressed ? 8 : 4,
          overflow: 'hidden',
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      <LinearGradient colors={[g1, g2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: theme.buttonRadius }}>
        {icon && !loading && <Ionicons name={icon} size={18} color={textColor[variant]} />}
        {loading ? (
          <Text style={{ color: textColor[variant], fontSize: 15, fontWeight: '800', letterSpacing: 0.5 }}>Loading…</Text>
        ) : (
          <Text style={{ color: textColor[variant], fontSize: 15, fontWeight: '800', letterSpacing: 0.4 }}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export default GlowButton;
