/**
 * GlassCard — foundational glassmorphic surface (JARVIS protocol).
 * Variants: default, elevated, holographic, inset, compact.
 * Supports blur, gradient borders, glow shadows, corner brackets, press haptics.
 */

import React, { useEffect } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme, glow as glowSpecs } from '../lib/theme';
import { CornerBrackets } from './CornerBrackets';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type GlassCardVariant = 'default' | 'elevated' | 'holographic' | 'inset' | 'compact';
export type GlowLevel = 'none' | 'subtle' | 'medium' | 'intense' | 'pulse' | 'cyan' | 'cyanIntense' | 'emerald';
export type CardGradient = 'none' | 'glass' | 'primary' | 'hero' | 'active';

export interface GlassCardProps {
  children: React.ReactNode;
  variant?: GlassCardVariant;
  cornerBrackets?: boolean;
  glow?: GlowLevel;
  gradient?: CardGradient;
  onPress?: () => void;
  hapticOnPress?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  innerGlow?: boolean;
}

const variantConfig: Record<GlassCardVariant, { blur: number; gradient: CardGradient; padding: number; bg: string; border: string; radius: number }> = {
  default: { blur: 24, gradient: 'glass', padding: 16, bg: 'rgba(17,13,32,0.72)', border: 'rgba(145,70,255,0.15)', radius: 20 },
  elevated: { blur: 32, gradient: 'glass', padding: 20, bg: 'rgba(24,18,48,0.85)', border: 'rgba(145,70,255,0.25)', radius: 20 },
  holographic: { blur: 40, gradient: 'hero', padding: 20, bg: 'rgba(17,13,32,0.60)', border: 'rgba(56,182,255,0.20)', radius: 20 },
  inset: { blur: 20, gradient: 'none', padding: 14, bg: 'rgba(17,13,32,0.72)', border: 'rgba(145,70,255,0.15)', radius: 20 },
  compact: { blur: 20, gradient: 'glass', padding: 10, bg: 'rgba(17,13,32,0.72)', border: 'rgba(145,70,255,0.15)', radius: 20 },
};

const gradientMap: Record<CardGradient, { colors: string[]; start: { x: number; y: number }; end: { x: number; y: number } }> = {
  none: { colors: ['transparent', 'transparent'], start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  glass: { colors: ['rgba(24,18,48,0.85)', 'rgba(8,6,18,0.90)'], start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  primary: { colors: ['rgba(145,70,255,0.12)', 'rgba(8,6,18,0.85)'], start: { x: 0, y: 0 }, end: { x: 0.4, y: 1 } },
  hero: { colors: ['rgba(145,70,255,0.15)', 'rgba(56,182,255,0.08)', 'rgba(8,6,18,0.9)'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  active: { colors: ['rgba(145,70,255,0.25)', 'rgba(56,182,255,0.12)'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
};

export function GlassCard({
  children,
  variant = 'default',
  cornerBrackets: showBrackets = false,
  glow = 'none',
  gradient,
  onPress,
  hapticOnPress = true,
  style,
  contentStyle,
  innerGlow = true,
}: GlassCardProps) {
  const theme = useTheme();
  const config = variantConfig[variant];
  const resolvedGradient = gradient ?? config.gradient;

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(glow === 'none' ? 0 : glowSpecs[glow]?.shadowOpacity ?? 0);
  const pressedGlow = useSharedValue(0);
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (glow === 'pulse') {
      const base = glowSpecs.pulse?.shadowOpacity ?? 0.4;
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(base * 1.4, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(base * 0.5, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      glowOpacity.value = glow === 'none' ? 0 : glowSpecs[glow]?.shadowOpacity ?? 0;
    }
    if (!onPress) {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [glow, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateY: floatY.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ shadowOpacity: glowOpacity.value + pressedGlow.value }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100, easing: Easing.out(Easing.ease) });
    pressedGlow.value = withTiming(0.15, { duration: 150 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 200, stiffness: 800 });
    pressedGlow.value = withTiming(0, { duration: 200 });
  };
  const handlePress = () => {
    if (hapticOnPress) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* no-op */
      }
    }
    onPress?.();
  };

  const glowSpec = glow !== 'none' && glowSpecs[glow] ? glowSpecs[glow] : null;
  const baseContainerStyle: ViewStyle = {
    position: 'relative',
    borderRadius: config.radius,
    overflow: 'hidden',
    ...(glowSpec ? glowSpec : {}),
    ...style,
  };

  const content = (
    <>
      {resolvedGradient !== 'none' && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: config.radius, overflow: 'hidden' }} pointerEvents="none">
          <LinearGradient colors={gradientMap[resolvedGradient].colors as [string, string, ...string[]]} start={gradientMap[resolvedGradient].start} end={gradientMap[resolvedGradient].end} style={{ flex: 1 }} />
        </View>
      )}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: config.radius, borderWidth: 1, borderColor: config.border, pointerEvents: 'none' }} />
      {innerGlow && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: config.radius, overflow: 'hidden' }} pointerEvents="none">
          <LinearGradient colors={['rgba(181,140,255,0.45)', 'rgba(181,140,255,0.12)', 'rgba(181,140,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }} />
        </View>
      )}
      {showBrackets && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
          <CornerBrackets color={config.border} opacity={0.6} />
        </View>
      )}
      <View style={[{ padding: config.padding, zIndex: 1 }, contentStyle]}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[baseContainerStyle, animatedStyle, glowStyle]}>
        <BlurView intensity={config.blur} tint="dark" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: config.radius }}>
          {content}
        </BlurView>
      </AnimatedPressable>
    );
  }
  return (
    <Animated.View style={[baseContainerStyle, animatedStyle, glowStyle]}>
      <BlurView intensity={config.blur} tint="dark" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: config.radius }}>
        {content}
      </BlurView>
    </Animated.View>
  );
}

export default GlassCard;
