/**
 * Button — clean premium button for the Only The Finest app.
 * Variants: primary (white), secondary (outline), ghost, danger.
 */

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = true,
}: ButtonProps) {
  const theme = useTheme();
  const s = styles(theme, variant);

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        if (disabled || loading) return;
        onPress?.();
      }}
      style={({ pressed }) => [
        s.base,
        fullWidth && { alignSelf: 'stretch' as const },
        pressed && s.pressed,
        disabled && s.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={s.iconColor.color} />
      ) : (
        <View style={s.inner}>
          {icon && <Ionicons name={icon} size={18} color={s.iconColor.color} />}
          <Text style={s.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default Button;

const styles = (t: ReturnType<typeof useTheme>, variant: ButtonVariant) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const bgColor = isPrimary ? '#ffffff' : isDanger ? t.error : 'transparent';
  const textColor = isPrimary ? '#000000' : isDanger ? '#ffffff' : isSecondary ? '#ffffff' : t.textMuted;
  const borderColor = isSecondary ? '#ffffff' : isGhost ? t.border : 'transparent';

  return StyleSheet.create({
    base: {
      backgroundColor: bgColor,
      borderColor,
      borderWidth: isSecondary ? 1 : 0,
      borderRadius: t.buttonRadius,
      paddingVertical: 15,
      paddingHorizontal: 20,
      opacity: 1,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      opacity: 0.4,
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    label: {
      color: textColor,
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    iconColor: {
      color: textColor,
    },
  });
};
