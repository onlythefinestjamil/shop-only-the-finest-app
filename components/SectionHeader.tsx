/**
 * SectionHeader — premium section heading with a glowing accent dot.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '../lib/theme';

export interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  accent?: string;
}

export function SectionHeader({ title, eyebrow, right, style, titleStyle, accent }: SectionHeaderProps) {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const dotGlow = pulse.interpolate({ inputRange: [0.45, 1], outputRange: [3, 7] });
  const color = accent ?? theme.primary;

  return (
    <View style={[s(theme).wrap, style]}>
      <View style={s(theme).left}>
        <Animated.View
          style={[s(theme).dot, { backgroundColor: color, shadowColor: color, shadowOpacity: 0.8, shadowRadius: dotGlow, shadowOffset: { width: 0, height: 0 }, elevation: 4 }]}
        />
        <View>
          {eyebrow ? <Text style={[s(theme).eyebrow, { color: theme.textSecondary }]}>{eyebrow}</Text> : null}
          <Text style={[s(theme).title, titleStyle]}>{title}</Text>
        </View>
      </View>
      {right ? <View style={s(theme).right}>{right}</View> : null}
    </View>
  );
}

const s = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6, gap: 10 },
    left: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
    right: { flexShrink: 0 },
    dot: { width: 7, height: 7, borderRadius: 3.5 },
    eyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 2 },
    title: { color: t.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  });

export default SectionHeader;
