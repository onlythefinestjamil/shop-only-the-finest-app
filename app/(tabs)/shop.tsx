/**
 * Shop — product catalog with hero, search, collection filters, and the
 * holographic product grid. Pulls from the Base44/Shopify catalog with seed
 * fallback.
 */

import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, gradients } from '../../lib/theme';
import { useCatalog } from '../../lib/catalogContext';
import { useCart } from '../../lib/cartContext';
import { GridOverlay } from '../../components/GridOverlay';
import { SectionHeader } from '../../components/SectionHeader';
import { ProductCard } from '../../components/ProductCard';

export default function ShopScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { products, loading, live, search } = useCatalog();
  const { addItem, count } = useCart();
  const s = styles(theme);

  const [query, setQuery] = useState('');
  const [activeCollection, setActiveCollection] = useState<string>('All');

  const collections = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.collection && set.add(p.collection));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = search(query);
    if (activeCollection !== 'All') {
      list = list.filter((p) => p.collection === activeCollection);
    }
    return list;
  }, [search, query, activeCollection]);

  return (
    <View style={s.screen}>
      <GridOverlay opacity={0.5} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Brand header */}
        <View style={s.header}>
          <Text style={s.eyebrow}>ONLY THE FINEST</Text>
          <Text style={s.brandTitle}>Wear The Culture</Text>
          <Text style={s.subtitle}>Premium streetwear for those who set the standard. Unapologetic design. Unmatched quality.</Text>
        </View>

        {/* Search bar */}
        <View style={s.searchWrap}>
          <Ionicons name="search" size={18} color={theme.textMuted} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search the finest…"
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Collection filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
          {collections.map((col) => (
            <Pressable
              key={col}
              style={[s.chip, activeCollection === col && s.chipActive]}
              onPress={() => setActiveCollection(col)}
            >
              <Text style={[s.chipText, activeCollection === col && s.chipTextActive]}>{col}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Connection telemetry */}
        <View style={s.telemetryRow}>
          <View style={[s.telemetryDot, { backgroundColor: live ? theme.success : theme.warning }]} />
          <Text style={s.telemetryText}>{live ? 'LIVE · Shopify Storefront' : 'OFFLINE · Seeded catalog'}</Text>
          <Text style={s.telemetryCount}>· {filtered.length} ITEMS</Text>
        </View>

        {/* Product grid */}
        {loading && products.length === 0 ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={s.loadingText}>Loading the finest…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <Ionicons name="search-outline" size={48} color={theme.textMuted} />
            <Text style={s.emptyText}>No products found</Text>
            <Text style={s.emptySub}>Try a different search or collection.</Text>
          </View>
        ) : (
          <View style={s.grid}>
            {filtered.map((p) => (
              <View key={p.id} style={s.gridCell}>
                <ProductCard
                  product={p}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
                  onAdd={() => {
                    const variant = p.variants[0];
                    if (variant) addItem(p, variant, 1);
                  }}
                />
              </View>
            ))}
          </View>
        )}

        <Text style={s.footer}>Only The Finest · Crafted For The Chosen</Text>
      </ScrollView>

      {/* Floating cart FAB */}
      {count > 0 && (
        <Pressable style={({ pressed }) => [s.fab, pressed && s.fabPressed]} onPress={() => router.push('/cart')}>
          <Ionicons name="bag" size={22} color="#FFFFFF" />
          <View style={s.fabBadge}>
            <Text style={s.fabBadgeText}>{count > 99 ? '99+' : count}</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.abyss },
    header: { paddingHorizontal: 20, marginBottom: 16 },
    eyebrow: { color: t.secondary, letterSpacing: 3, fontWeight: '800', fontSize: 11 },
    brandTitle: { color: t.text, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 6, textShadowColor: `${t.primary}55`, textShadowRadius: 14 },
    subtitle: { color: t.textMuted, fontSize: 14, fontWeight: '500', lineHeight: 20, marginTop: 6 },
    searchWrap: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      marginHorizontal: 20, marginBottom: 14,
      backgroundColor: t.surfaceGlass, borderColor: t.border, borderWidth: 1,
      borderRadius: t.buttonRadius, paddingHorizontal: 14, paddingVertical: 12,
    },
    searchIcon: { marginRight: 2 },
    searchInput: { flex: 1, color: t.text, fontSize: 15, fontWeight: '600', padding: 0 },
    chipRow: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
    chip: {
      backgroundColor: t.surfaceGlass, borderColor: t.border, borderWidth: 1,
      borderRadius: t.buttonRadius, paddingVertical: 8, paddingHorizontal: 16,
    },
    chipActive: {
      backgroundColor: t.primary, borderColor: t.primary,
      shadowColor: t.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
    chipText: { color: t.textMuted, fontSize: 13, fontWeight: '800' },
    chipTextActive: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
    telemetryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginBottom: 12 },
    telemetryDot: { width: 7, height: 7, borderRadius: 3.5 },
    telemetryText: { color: t.textTertiary, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
    telemetryCount: { color: t.textTertiary, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
    gridCell: { width: '47%', flexGrow: 1 },
    loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
    loadingText: { color: t.textMuted, fontSize: 13, fontWeight: '600' },
    emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
    emptyText: { color: t.text, fontSize: 16, fontWeight: '700' },
    emptySub: { color: t.textMuted, fontSize: 13 },
    footer: { color: t.textTertiary, fontSize: 11, textAlign: 'center', marginTop: 24, letterSpacing: 1 },
    fab: {
      position: 'absolute', bottom: 88, right: 20, width: 58, height: 58, borderRadius: 29,
      backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center',
      shadowColor: t.primary, shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 4 }, elevation: 10,
    },
    fabPressed: { transform: [{ scale: 0.92 }], opacity: 0.85 },
    fabBadge: {
      position: 'absolute', top: -4, right: -4, backgroundColor: t.secondary, borderRadius: 12, minWidth: 22, height: 22,
      alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: t.abyss, paddingHorizontal: 5,
    },
    fabBadgeText: { color: '#04121F', fontSize: 11, fontWeight: '900' },
  });
