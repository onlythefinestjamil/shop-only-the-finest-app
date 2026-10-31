/**
 * Product Detail — full product view with image, variant selectors (size/color),
 * price, description, add-to-cart, and buy-now (opens storefront product page).
 */

import React, { useMemo, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';
import { useCatalog } from '../../lib/catalogContext';
import { useCart } from '../../lib/cartContext';
import { formatPrice, createCheckoutUrl } from '../../lib/shopify';
import { GridOverlay } from '../../components/GridOverlay';
import { CornerBrackets } from '../../components/CornerBrackets';
import { GlassCard } from '../../components/GlassCard';
import { GlowButton } from '../../components/GlowButton';

export default function ProductDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = useCatalog();
  const { addItem } = useCart();
  const s = styles(theme);

  const product = getById(id);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  // Initialize selected options from the first variant values.
  React.useEffect(() => {
    if (product && product.options.length > 0) {
      const init: Record<string, string> = {};
      product.options.forEach((o) => {
        init[o.name] = o.values[0];
      });
      setSelectedOptions(init);
    }
  }, [product?.id]);

  // Resolve the matching variant from selected options.
  const selectedVariant = useMemo(() => {
    if (!product || product.variants.length === 0) return null;
    if (product.variants.length === 1) return product.variants[0];
    const match = product.variants.find((v) =>
      v.selectedOptions.every((o) => selectedOptions[o.name] === o.value),
    );
    return match ?? product.variants[0];
  }, [product, selectedOptions]);

  if (!product) {
    return (
      <View style={s.notFound}>
        <GridOverlay opacity={0.4} />
        <Ionicons name="alert-circle-outline" size={48} color={theme.textMuted} />
        <Text style={s.notFoundText}>Product not found</Text>
        <GlowButton label="Back to Shop" icon="arrow-back" variant="secondary" onPress={() => router.back()} style={{ marginTop: 16, width: 200 }} />
      </View>
    );
  }

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const available = selectedVariant ? selectedVariant.available : product.available;

  const handleAdd = () => {
    if (!selectedVariant) return;
    if (!available) {
      Alert.alert('Out of stock', 'This variant is currently unavailable.');
      return;
    }
    addItem(product, selectedVariant, 1);
    Alert.alert('Added to cart', `${product.title} added to your cart.`);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    setBusy(true);
    const url = await createCheckoutUrl([{ variantId: selectedVariant.id, quantity: 1 }]);
    setBusy(false);
    Linking.openURL(url).catch(() => Alert.alert('Unable to open', `Could not open ${url}.`));
  };

  const setOption = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <View style={s.screen}>
      <GridOverlay opacity={0.4} />
      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>
        <Text style={s.topBarTitle} numberOfLines={1}>{product.collection || product.vendor}</Text>
        <Pressable style={s.backBtn} onPress={() => router.push('/cart')} hitSlop={10}>
          <Ionicons name="cart-outline" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={s.heroWrap}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={s.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[theme.primary, theme.primaryMuted]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroImage} />
          )}
          <LinearGradient colors={['rgba(6,4,13,0.45)', 'transparent', 'rgba(6,4,13,0.85)']} style={s.heroScrim} />
          <View style={s.heroBadges}>
            {onSale && (
              <View style={s.salePill}>
                <Text style={s.salePillText}>SALE</Text>
              </View>
            )}
            <View style={s.brandPill}>
              <Text style={s.brandPillText}>{product.vendor}</Text>
            </View>
          </View>
          <CornerBrackets color={theme.bracketColor} size={18} inset={10} opacity={0.5} />
        </View>

        <View style={s.content}>
          {/* Title + price */}
          <Text style={s.eyebrow}>{product.productType || product.collection || 'PREMIUM'}</Text>
          <Text style={s.title}>{product.title}</Text>
          <View style={s.priceRow}>
            <Text style={s.price}>{formatPrice(selectedVariant?.price ?? product.price)}</Text>
            {onSale && <Text style={s.compareAt}>{formatPrice(product.compareAtPrice!)}</Text>}
            <View style={[s.stockPill, available ? { borderColor: theme.success } : { borderColor: theme.error }]}>
              <Text style={[s.stockPillText, { color: available ? theme.success : theme.error }]}>{available ? 'IN STOCK' : 'SOLD OUT'}</Text>
            </View>
          </View>

          {/* Variant selectors */}
          {product.options.map((option) => (
            <View key={option.name} style={s.optionGroup}>
              <Text style={s.optionLabel}>{option.name.toUpperCase()}</Text>
              <View style={s.optionValues}>
                {option.values.map((value) => {
                  const active = selectedOptions[option.name] === value;
                  // Check if any variant with this option value is available.
                  const valueAvailable = product.variants.some(
                    (v) => v.selectedOptions.some((o) => o.name === option.name && o.value === value) && v.available,
                  );
                  return (
                    <Pressable
                      key={value}
                      style={[
                        s.optionChip,
                        active && s.optionChipActive,
                        !valueAvailable && s.optionChipDisabled,
                      ]}
                      onPress={() => setOption(option.name, value)}
                    >
                      <Text style={[s.optionChipText, active && s.optionChipTextActive, !valueAvailable && { opacity: 0.4 }]}>
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Description */}
          {product.description ? (
            <View style={s.descWrap}>
              <Text style={s.descLabel}>DESCRIPTION</Text>
              <Text style={s.desc}>{product.description}</Text>
            </View>
          ) : null}

          {/* Tags */}
          {product.tags.length > 0 && (
            <View style={s.tagsRow}>
              {product.tags.slice(0, 5).map((tag) => (
                <View key={tag} style={s.tagPill}>
                  <Text style={s.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={s.actions}>
            <GlowButton
              label={available ? 'Add to Cart' : 'Sold Out'}
              icon={available ? 'cart' : 'ban-outline'}
              variant={available ? 'primary' : 'ghost'}
              onPress={handleAdd}
              disabled={!available}
              style={{ flex: 1 }}
            />
            <GlowButton
              label="Buy Now"
              icon="flash"
              variant="success"
              onPress={handleBuyNow}
              loading={busy}
              disabled={!available}
              style={{ flex: 1, marginTop: 10 }}
            />
          </View>

          <Pressable style={s.viewOnSite} onPress={() => Linking.openURL(product.url).catch(() => {})}>
            <Ionicons name="open-outline" size={14} color={theme.secondary} />
            <Text style={s.viewOnSiteText}>View on shoponlythefinest.com</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.abyss },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: t.abyss },
    notFoundText: { color: t.textMuted, fontSize: 16, fontWeight: '600' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8, zIndex: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: t.surfaceGlass, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.borderSubtle },
    topBarTitle: { color: t.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
    heroWrap: { width: '100%', height: 420, backgroundColor: t.surfaceMuted, overflow: 'hidden', position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    heroBadges: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
    salePill: { backgroundColor: t.error, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, shadowColor: t.error, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
    salePillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
    brandPill: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    brandPillText: { color: t.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    content: { padding: 20, paddingTop: 22 },
    eyebrow: { color: t.secondary, letterSpacing: 2.5, fontWeight: '800', fontSize: 11 },
    title: { color: t.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginTop: 6, textShadowColor: `${t.primary}44`, textShadowRadius: 10 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    price: { color: t.primary, fontSize: 28, fontWeight: '900' },
    compareAt: { color: t.textMuted, fontSize: 16, fontWeight: '600', textDecorationLine: 'line-through' },
    stockPill: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 4 },
    stockPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
    optionGroup: { marginTop: 22 },
    optionLabel: { color: t.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 10 },
    optionValues: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionChip: {
      backgroundColor: t.surfaceGlass, borderColor: t.border, borderWidth: 1, borderRadius: t.buttonRadius,
      paddingVertical: 11, paddingHorizontal: 18, minWidth: 54, alignItems: 'center',
    },
    optionChipActive: {
      backgroundColor: `${t.primary}22`, borderColor: t.primary, borderWidth: 1.5,
      shadowColor: t.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
    optionChipDisabled: { opacity: 0.5 },
    optionChipText: { color: t.textMuted, fontSize: 14, fontWeight: '800' },
    optionChipTextActive: { color: t.primary, fontSize: 14, fontWeight: '900' },
    descWrap: { marginTop: 22 },
    descLabel: { color: t.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 8 },
    desc: { color: t.text, fontSize: 14, lineHeight: 22, fontWeight: '500' },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 },
    tagPill: { backgroundColor: t.surfaceAccent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: t.borderSubtle },
    tagText: { color: t.textSecondary, fontSize: 10, fontWeight: '700' },
    actions: { marginTop: 24 },
    viewOnSite: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, padding: 10 },
    viewOnSiteText: { color: t.secondary, fontSize: 13, fontWeight: '700' },
  });
