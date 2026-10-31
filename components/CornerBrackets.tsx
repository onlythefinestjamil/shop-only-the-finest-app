/**
 * CornerBrackets — decorative L-shaped corner brackets for HUD framing.
 * Four 1px L accents at each corner of the parent (parent must be relative).
 */

import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../lib/theme';

export interface CornerBracketsProps {
  size?: number;
  color?: string;
  opacity?: number;
  pulse?: boolean;
  pulseDuration?: number;
  thickness?: number;
  inset?: number;
}

export function CornerBrackets({
  size = 14,
  color,
  opacity = 0.4,
  pulse = false,
  pulseDuration = 3000,
  thickness = 1,
  inset = 0,
}: CornerBracketsProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.bracketColor;

  const pulseValue = useSharedValue(opacity);
  const drawIn = useSharedValue(0);

  useEffect(() => {
    if (pulse) {
      pulseValue.value = withRepeat(
        withTiming(opacity * 1.25, { duration: pulseDuration / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseValue.value = withTiming(opacity, { duration: 200 });
    }
    drawIn.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [pulse, opacity, pulseDuration]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseValue.value,
    transform: [{ scale: 0.7 + 0.3 * drawIn.value }],
  }));

  const baseStyle: ViewStyle = { position: 'absolute', width: size, height: size, borderColor: resolvedColor };
  const cornerStyles: ViewStyle[] = [
    { ...baseStyle, top: inset, left: inset, borderTopWidth: thickness, borderLeftWidth: thickness },
    { ...baseStyle, top: inset, right: inset, borderTopWidth: thickness, borderRightWidth: thickness },
    { ...baseStyle, bottom: inset, left: inset, borderBottomWidth: thickness, borderLeftWidth: thickness },
    { ...baseStyle, bottom: inset, right: inset, borderBottomWidth: thickness, borderRightWidth: thickness },
  ];

  return (
    <>
      {cornerStyles.map((style, i) => (
        <Animated.View key={i} style={[style, pulseStyle]} />
      ))}
    </>
  );
}

export default CornerBrackets;
