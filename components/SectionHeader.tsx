/**
 * SectionHeader — clean section heading with eyebrow and optional right element.
 */

import React from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '../lib/theme';

export interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export function SectionHeader({ title, eyebrow, right, style, titleStyle }: SectionHeaderProps) {
  const theme = useTheme();
  const s = styles(theme);

  return (
    <View style={[s.wrap, style]}>
      <View style={s.left}>
        <View>
          {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
          <Text style={[s.title, titleStyle]}>{title}</Text>
        </View>
      </View>
      {right ? <View style={s.right}>{right}</View> : null}
    </View>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 8,
      gap: 10,
    },
    left: {
      flexShrink: 1,
    },
    right: {
      flexShrink: 0,
    },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 2,
      color: t.textMuted,
      marginBottom: 4,
      textTransform: 'uppercase',
      fontFamily: t.fontBodyBold,
    },
    title: {
      color: t.text,
      fontSize: 22,
      fontWeight: '500',
      letterSpacing: 0.3,
      fontFamily: t.fontHeadingMedium,
    },
  });

export default SectionHeader;
