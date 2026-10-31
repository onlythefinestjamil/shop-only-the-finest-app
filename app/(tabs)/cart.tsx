/**
 * Cart — shopping cart with quantity controls, subtotal, and checkout.
 * Checkout creates a Shopify checkout URL via the Base44 server function and
 * opens it in the system browser. Falls back to a cart permalink.
 */

import React, { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';
import { useCart } from '../../lib/cartContext';
import { createCheckoutUrl, formatPrice } from '../../lib/shopify';
import { GridOverlay } from '../../components/GridOverlay';
import { CornerBrackets } from '../../components/CornerBrackets';
import { GlowButton } from '../../components/GlowButton';
import { GlassCard } from '../../components/GlassCard';

export default function CartScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { lines, subtotal, count, updateQuantity, removeItem, clear } = useCart();
  const s = styles(theme);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (lines.length === 0) return;
    setCheckingOut(true);
    const lineItems = lines
      .filter((l) => l.variantId)
      .map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
    const url = await createCheckoutUrl(lineItems);
    setCheckingOut(false);
    const opened = await Linking.canOpenURL(url);
    if (opened) {
      Linking.openURL(url).catch(() => Alert.alert('Unable to open checkout', `Could not open ${url}.`));
    } else {
      Alert.alert('Checkout', `Complete your purchase at:\n${url}`, [{ text: 'Open Site', onPress: () => Linking.openURL('https://www.shoponlythefinest.com').catch(() => {}) }]);
    }
  };

  return (
    <View style={s.screen}>
      <GridOverlay opacity={0.4} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.eyebrow}>YOUR SELECTION</Text>
          <Text style={s.title}>Cart</Text>
          <Text style={s.subtitle}>{count} {count === 1 ? 'item' : 'items'} ready for checkout</Text>
        </View>

        {lines.length === 0 ? (
          <GlassCard variant="holographic" cornerBrackets glow="subtle" style={s.emptyCard} contentStyle={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="bag-outline" size={56} color={theme.textMuted} />
            <Text style={s.emptyTitle}>Your cart is empty</Text>
            <Text style={s.emptySub}>Browse the catalog to add the finest pieces.</Text>
          </GlassCard>
        ) : (
          <View style={s.list}>
            {lines.map((line) => (
              <View key={line.key} style={s.line}>
                <CornerBrackets color={theme.bracketColor} size={10} inset={4} />
                <View style={s.lineImageWrap}>
                  {line.image ? (
                    <Image source={{ uri: line.image }} style={s.lineImage} resizeMode="cover" />
                  ) : (
                    <View style={[s.lineImage, { backgroundColor: theme.surfaceMuted, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="image-outline" size={22} color={theme.textMuted} />
                    </View>
                  )}
                </View>
                <View style={s.lineInfo}>
                  <Text style={s.lineTitle} numberOfLines={2}>{line.title}</Text>
                  {line.variantTitle && line.variantTitle !== line.title && (
                    <Text style={s.lineVariant}>{line.variantTitle}</Text>
                  )}
                  <View style={s.lineOptions}>
                    {Object.entries(line.options).map(([name, value]) => (
                      <View key={name} style={s.optionPill}>
                        <Text style={s.optionPillText}>{name}: {value}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={s.linePrice}>{formatPrice(line.price * line.quantity)}</Text>
                </View>
                <View style={s.lineControls}>
                  <View style={s.qtyRow}>
                    <PressableQty label="−" onPress={() => updateQuantity(line.key, line.quantity - 1)} theme={theme} />
                    <Text style={s.qtyValue}>{line.quantity}</Text>
                    <PressableQty label="+" onPress={() => updateQuantity(line.key, line.quantity + 1)} theme={theme} />
                  </View>
                  <PressableIcon name="trash-outline" color={theme.error} onPress={() => removeItem(line.key)} />
                </View>
              </View>
            ))}
          </View>
        )}

        {lines.length > 0 && (
          <View style={s.footer}>
            <View style={s.subtotalRow}>
              <Text style={s.subtotalLabel}>Subtotal</Text>
              <Text style={s.subtotalValue}>{formatPrice(subtotal)}</Text>
            </View>
            <Text style={s.shippingNote}>FREE SHIPPING on orders $100+</Text>
            <GlowButton label="Proceed to Checkout" icon="card" variant="primary" onPress={handleCheckout} loading={checkingOut} style={{ marginTop: 12 }} />
            <GlowButton label="Clear Cart" icon="trash-outline" variant="ghost" onPress={clear} style={{ marginTop: 8 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PressableQty({ label, onPress }: { label: string; onPress: () => void; theme: ReturnType<typeof useTheme> }) {
  const theme = useTheme();
  return <PressableInner label={label} onPress={onPress} color={theme.primary} bg={theme.surfaceAccent} />;
}
function PressableIcon({ name, color, onPress }: { name: React.ComponentProps<typeof Ionicons>['name']; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ padding: 6 }}>
      <Ionicons name={name} size={20} color={color} />
    </Pressable>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.abyss },
    header: { paddingHorizontal: 20, marginBottom: 18 },
    eyebrow: { color: t.secondary, letterSpacing: 3, fontWeight: '800', fontSize: 11 },
    title: { color: t.text, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 6 },
    subtitle: { color: t.textMuted, fontSize: 14, marginTop: 4 },
    emptyCard: { marginHorizontal: 20, gap: 12 },
    emptyTitle: { color: t.text, fontSize: 18, fontWeight: '800', marginTop: 12 },
    emptySub: { color: t.textMuted, fontSize: 14, textAlign: 'center' },
    list: { paddingHorizontal: 20, gap: 12 },
    line: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.surfaceGlass, borderColor: t.borderGlow, borderWidth: 1, borderRadius: t.cardRadius,
      borderTopColor: `${t.primary}33`, borderTopWidth: 1.5,
      padding: 12, overflow: 'hidden',
    },
    lineImageWrap: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden', backgroundColor: t.surfaceMuted },
    lineImage: { width: '100%', height: '100%' },
    lineInfo: { flex: 1, gap: 4 },
    lineTitle: { color: t.text, fontSize: 14, fontWeight: '700' },
    lineVariant: { color: t.textMuted, fontSize: 12 },
    lineOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    optionPill: { backgroundColor: t.surfaceAccent, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: t.borderSubtle },
    optionPillText: { color: t.textSecondary, fontSize: 10, fontWeight: '700' },
    linePrice: { color: t.primary, fontSize: 15, fontWeight: '900', marginTop: 2 },
    lineControls: { alignItems: 'center', gap: 10 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.surfaceMuted, borderRadius: t.buttonRadius, paddingHorizontal: 4, paddingVertical: 4 },
    qtyValue: { color: t.text, fontSize: 14, fontWeight: '800', minWidth: 18, textAlign: 'center' },
    footer: { paddingHorizontal: 20, paddingTop: 24 },
    subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: t.borderSubtle, paddingTop: 14 },
    subtotalLabel: { color: t.textMuted, fontSize: 15, fontWeight: '700' },
    subtotalValue: { color: t.text, fontSize: 26, fontWeight: '900' },
    shippingNote: { color: t.success, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginTop: 6 },
  });

// small internal helper kept at the bottom so it closes over the theme param
function PressableInner({ label, onPress, color, bg }: { label: string; onPress: () => void; color: string; bg: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => ({ width: 28, height: 28, borderRadius: 8, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ color, fontSize: 18, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}
