/**
 * InAppCheckout — Shopify checkout inside the app (never bounces to Safari).
 * Full-screen modal WebView over the checkout URL; closes on cancel and
 * clears the cart when Shopify lands on the thank-you page.
 */

import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme';

type Props = {
  url: string | null;
  onClose: (completed: boolean) => void;
  onComplete: () => void;
};

export default function InAppCheckout({ url, onClose, onComplete }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const completedRef = useRef(false);

  if (!url) return null;

  const handleNav = (target: { url: string }): boolean => {
    const u = target.url || '';
    // Shopify order confirmation / thank-you pages
    if (/thank_you|thank-you|orders?\/|\/complete/i.test(u)) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
        onClose(true);
      }
      return false;
    }
    return true;
  };

  return (
    <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.bar, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => onClose(false)} hitSlop={12} style={styles.closeWrap}>
          <Ionicons name="close" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Secure Checkout</Text>
        <View style={{ width: 22 }} />
      </View>
      <WebView
        source={{ uri: url }}
        onShouldStartLoadWithRequest={handleNav}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loading, { backgroundColor: theme.abyss }]}>
            <Text style={{ color: theme.textSecondary }}>Loading checkout…</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeWrap: { padding: 4 },
  title: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
