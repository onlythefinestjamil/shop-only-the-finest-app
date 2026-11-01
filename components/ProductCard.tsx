/**
 * ProductCard — clean premium product card for the catalog grid.
 * Image, OTF brand tag, product name, price, Quick View.
 */

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../lib/theme';
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
          <LinearGradient colors={['#1a1a1a', '#0f0f0f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.image} />
        )}
        {onSale && (
          <View style={s.saleBadge}>
            <Text style={s.saleBadgeText}>SALE</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        <Text style={s.brandTag}>OTF</Text>
        <Text style={s.title} numberOfLines={1}>{product.title}</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>{formatPrice(product.price)}</Text>
          {onSale && <Text style={s.compareAt}>{formatPrice(product.compareAtPrice!)}</Text>}
        </View>
        <Pressable style={({ pressed }) => [s.quickView, pressed && s.quickViewPressed]} onPress={onAdd}>
          <Text style={s.quickViewText}>Quick View</Text>
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
      backgroundColor: t.surface,
      borderRadius: t.cardRadius,
      overflow: 'hidden',
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    imageWrap: {
      width: '100%',
      height: 200,
      backgroundColor: t.surfaceMuted,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    saleBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: t.error,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    saleBadgeText: {
      color: '#ffffff',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    body: {
      padding: 12,
      gap: 4,
    },
    brandTag: {
      color: t.secondary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    title: {
      color: t.text,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 2,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    price: {
      color: t.text,
      fontSize: 16,
      fontWeight: '700',
    },
    compareAt: {
      color: t.textMuted,
      fontSize: 12,
      fontWeight: '500',
      textDecorationLine: 'line-through',
    },
    quickView: {
      marginTop: 8,
      paddingVertical: 8,
      backgroundColor: t.surfaceAccent,
      borderRadius: 8,
      alignItems: 'center',
    },
    quickViewPressed: {
      opacity: 0.7,
    },
    quickViewText: {
      color: t.text,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });

export default ProductCard;
