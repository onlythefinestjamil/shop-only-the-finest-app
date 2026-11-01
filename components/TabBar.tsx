/**
 * TabBar — clean minimal bottom navigation.
 * Tabs: Shop, Lookbook, Cart, Ambassador, Profile.
 */

import { useRouter, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { useCart } from '../lib/cartContext';

interface TabDef {
  href: string;
  iconFilled: string;
  iconOutline: string;
  label: string;
}

const tabs: TabDef[] = [
  { href: '/shop', iconFilled: 'grid', iconOutline: 'grid-outline', label: 'Shop' },
  { href: '/lookbook', iconFilled: 'book', iconOutline: 'book-outline', label: 'Lookbook' },
  { href: '/cart', iconFilled: 'cart', iconOutline: 'cart-outline', label: 'Cart' },
  { href: '/ambassador', iconFilled: 'ribbon', iconOutline: 'ribbon-outline', label: 'Ambassador' },
  { href: '/profile', iconFilled: 'person', iconOutline: 'person-outline', label: 'Profile' },
];

export function TabBar() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const s = styles(theme);

  return (
    <View style={s.container}>
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href === '/shop' && pathname === '/');
        const showBadge = tab.href === '/cart' && count > 0;
        return (
          <Pressable
            key={tab.href}
            style={s.tab}
            onPress={() => router.push(tab.href as never)}
          >
            <View style={s.iconWrap}>
              <Ionicons
                name={(active ? tab.iconFilled : tab.iconOutline) as never}
                size={23}
                color={active ? theme.text : theme.textMuted}
              />
              {showBadge && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{count > 99 ? '99+' : count}</Text>
                </View>
              )}
            </View>
            <Text style={[s.label, active && s.labelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {tab.label}
            </Text>
            {active && <View style={s.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: t.abyss,
      borderTopColor: t.border,
      borderTopWidth: 1,
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 20,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
    },
    iconWrap: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -12,
      backgroundColor: t.text,
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: '#000000',
      fontSize: 10,
      fontWeight: '800',
    },
    label: {
      fontSize: 10,
      fontWeight: '600',
      color: t.textMuted,
      letterSpacing: 0.3,
    },
    labelActive: {
      color: t.text,
      fontWeight: '700',
    },
    activeIndicator: {
      width: 24,
      height: 2,
      backgroundColor: t.text,
      borderRadius: 1,
      marginTop: 4,
    },
  });

export default TabBar;
