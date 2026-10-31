/**
 * GridOverlay — subtle hairline grid background texture (JARVIS HUD).
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../lib/theme';

export function GridOverlay({ opacity = 0.5, cell = 36 }: { opacity?: number; cell?: number }) {
  const theme = useTheme();
  const vCount = Math.ceil(460 / cell);
  const hCount = Math.ceil(1400 / cell);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity, overflow: 'hidden' }]}>
      {Array.from({ length: vCount }, (_, i) => (
        <View key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: i * cell, width: 1, backgroundColor: theme.gridColor }} />
      ))}
      {Array.from({ length: hCount }, (_, i) => (
        <View key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: i * cell, height: 1, backgroundColor: theme.gridColor }} />
      ))}
    </View>
  );
}

export default GridOverlay;
