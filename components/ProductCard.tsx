/**
 * ProductCard — holographic premium product card for the catalog grid.
 * Glow border, corner brackets, image with gradient fallback, price + add button.
 */

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../lib/theme';
import { CornerBrackets } from './CornerBrackets';
import { formatPrice, type ShopifyProduct } from '../lib/shopify';

export interface ProductCardProps {
  product: ShopifyProduct;
  onPress: () => void;
  onAdd: () => void;
}

export function ProductCard({ product, onPress, onAdd }: ProductCardProps) {
  const theme = useTheme();
  const s = styles(theme);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Pressable style={({ pressed }) => [s.card, pressed && s.cardPressed]} onPress={onPress}>
      <View style={s.imageWrap}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={s.image} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[theme.primary, theme.primaryMuted]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.image} />
        )}
        {/* Top gradient scrim for legibility */}
        <LinearGradient colors={['rgba(6,4,13,0.55)', 'transparent', 'transparent']} style={s.imageScrim} />
        {onSale && (
          <View style={s.saleBadge}>
            <Text style={s.saleBadgeText}>SALE</Text>
          </View>
        )}
        {product.collection ? (
          <View style={s.collectionBadge}>
            <Text style={s.collectionBadgeText}>{product.collection}</Text>
          </View>
        ) : null}
      </View>

      <View style={s.body}>
        <CornerBrackets color={theme.bracketColor} size={10} inset={5} />
        <Text style={s.title} numberOfLines={1}>{product.title}</Text>
        <Text style={s.type} numberOfLines={1}>{product.productType || product.vendor}</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>{formatPrice(product.price)}</Text>
          {onSale && <Text style={s.compareAt}>{formatPrice(product.compareAtPrice!)}</Text>}
        </View>
        <Pressable style={({ pressed }) => [s.addBtn, pressed && s.addBtnPressed]} onPress={onAdd}>
          <Ionicons name="add-circle" size={16} color={theme.primary} />
          <Text style={s.addBtnText}>Add</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: t.surfaceGlass,
      borderColor: t.borderGlow,
      borderWidth: 1,
      borderRadius: 22,
      borderTopColor: `${t.primary}40`,
      borderTopWidth: 1.5,
      overflow: 'hidden',
      shadowColor: t.primary,
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    cardPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
    imageWrap: { width: '100%', height: 180, backgroundColor: t.surfaceMuted },
    image: { width: '100%', height: '100%' },
    imageScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
    saleBadge: {
      position: 'absolute', top: 10, left: 10,
      backgroundColor: t.error, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
      shadowColor: t.error, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3,
    },
    saleBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
    collectionBadge: {
      position: 'absolute', top: 10, right: 10,
      backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    },
    collectionBadgeText: { color: t.secondary, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
    body: { padding: 12, gap: 3 },
    title: { color: t.text, fontSize: 14, fontWeight: '700' },
    type: { color: t.textMuted, fontSize: 11 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
    price: { color: t.primary, fontSize: 16, fontWeight: '900' },
    compareAt: { color: t.textMuted, fontSize: 12, fontWeight: '600', textDecorationLine: 'line-through' },
    addBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
      backgroundColor: t.surfaceAccent, borderColor: `${t.primary}55`, borderWidth: 1,
      borderRadius: t.buttonRadius, paddingVertical: 8, marginTop: 6,
    },
    addBtnPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
    addBtnText: { color: t.primary, fontSize: 11, fontWeight: '800' },
  });

export default ProductCard;
