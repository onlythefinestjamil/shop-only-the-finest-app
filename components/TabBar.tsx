/**
 * TabBar — premium bottom navigation with JARVIS-style glowing accent line,
 * pulsing glow circles, and spring-press tab buttons.
 * Tabs: Shop, Cart, Profile.
 */

import { useRouter, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../lib/theme';
import { useCart } from '../lib/cartContext';

type TabKey = 'grid' | 'cart' | 'person';

type TabDef = {
  href: string;
  iconFilled: TabKey;
  iconOutline: string;
  label: string;
};

const tabs: TabDef[] = [
  { href: '/shop', iconFilled: 'grid', iconOutline: 'grid-outline', label: 'Shop' },
  { href: '/cart', iconFilled: 'cart', iconOutline: 'cart-outline', label: 'Cart' },
  { href: '/profile', iconFilled: 'person', iconOutline: 'person-outline', label: 'Profile' },
];

export function TabBar() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const s = createStyles(theme);

  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const lineOpacity = pulse.interpolate({ inputRange: [0.4, 1], outputRange: [0.35, 0.85] });

  return (
    <View style={s.container}>
      <Animated.View style={[s.topGlowWrap, { opacity: lineOpacity }]}>
        <LinearGradient
          colors={[`${theme.primary}00`, theme.primary, `${theme.primary}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.topGlowLine}
        />
      </Animated.View>
      <LinearGradient
        colors={[`${theme.primary}00`, `${theme.primary}22`, `${theme.primary}00`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.humGlow}
      />
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href === '/shop' && pathname === '/');
        const showBadge = tab.href === '/cart' && count > 0;
        return (
          <TabButton
            key={tab.href}
            href={tab.href}
            label={tab.label}
            iconFilled={tab.iconFilled}
            iconOutline={tab.iconOutline}
            active={active}
            badge={showBadge ? count : undefined}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {
                /* no-op */
              }
              router.push(tab.href as never);
            }}
          />
        );
      })}
    </View>
  );
}

function TabButton({
  label,
  iconFilled,
  iconOutline,
  active,
  badge,
  onPress,
}: {
  href: string;
  label: string;
  iconFilled: TabKey;
  iconOutline: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const s = createStyles(theme);
  const scale = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();

  useEffect(() => {
    if (active) {
      flashOpacity.setValue(0.8);
      Animated.timing(flashOpacity, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.3, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [active]);

  const iconColor = active ? theme.primary : theme.textMuted;

  return (
    <View style={[s.tab, active ? s.tabActive : null]}>
      {active && (
        <LinearGradient colors={[`${theme.primary}00`, `${theme.primary}33`, `${theme.primary}00`]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.tabGlowTrail} />
      )}
      {active && <Animated.View style={[s.tabGlow, { opacity: glowOpacity }]} />}
      {active && <Animated.View style={[s.tabFlash, { opacity: flashOpacity }]} />}
      <Pressable style={s.tabIconWrap} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        <Animated.View style={[{ transform: [{ scale }] }, { alignItems: 'center' }]}>
          <View>
            <Ionicons name={(active ? iconFilled : iconOutline) as never} size={22} style={active ? s.iconActive : s.icon} color={iconColor} />
            {badge ? (
              <View style={s.badge}>
                <Text style={s.badgeText}>{badge > 99 ? '99+' : badge}</Text>
              </View>
            ) : null}
          </View>
          {active && <View style={s.tabDotActive} />}
          <Text style={active ? s.labelActive : s.label}>{label}</Text>
        </Animated.View>
      </Pressable>
      {active && <View style={s.tabProgressLine} />}
    </View>
  );
}

const createStyles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: t.surfaceGlass,
      borderTopColor: t.borderGlow,
      borderTopWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 8,
      paddingBottom: 14,
    },
    humGlow: { position: 'absolute', bottom: -6, left: 0, right: 0, height: 12, opacity: 0.4 },
    topGlowWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 2 },
    topGlowLine: { flex: 1, height: 1 },
    tabGlowTrail: { position: 'absolute', top: -4, left: '50%', width: 28, height: 44, marginLeft: -14, borderRadius: 14, opacity: 0.6, zIndex: 0 },
    tabGlow: {
      position: 'absolute', top: 2, width: 34, height: 34, borderRadius: 17,
      backgroundColor: `${t.primary}22`, shadowColor: t.primary, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6,
    },
    tabFlash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 14, backgroundColor: t.primary, zIndex: 1 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4, borderRadius: 14, gap: 2, opacity: 0.4 },
    tabActive: { opacity: 1 },
    tabIconWrap: { alignItems: 'center', gap: 2 },
    tabProgressLine: {
      position: 'absolute', bottom: 0, left: '50%', width: 32, height: 2, marginLeft: -16,
      backgroundColor: t.primary, shadowColor: t.primary, shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4, borderRadius: 1,
    },
    icon: { fontSize: 22, opacity: 0.5 },
    iconActive: { fontSize: 22, opacity: 1, textShadowColor: `${t.primary}99`, textShadowRadius: 8 },
    label: { fontSize: 9, fontWeight: '700', color: t.textMuted, letterSpacing: 0.5 },
    labelActive: { fontSize: 9, fontWeight: '800', color: t.primary, letterSpacing: 0.5, textShadowColor: `${t.primary}99`, textShadowRadius: 6 },
    tabDotActive: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: t.primary, marginTop: 2, marginBottom: 2, shadowColor: t.primary, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 }, elevation: 3 },
    badge: {
      position: 'absolute', top: -6, right: -10,
      backgroundColor: t.primary, borderRadius: 11, minWidth: 20, height: 20, paddingHorizontal: 5,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: t.primary, shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4, borderWidth: 1, borderColor: `${t.primary}80`,
    },
    badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  });

export default TabBar;
