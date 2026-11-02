/**
 * Membership — the Inner Circle tier system, in-app.
 * Tiers mirror shoponlythefinest.com/membership exactly:
 *   Inner Circle (Free) · OTF Member ($9.99) · Certified Finest ($24.99)
 *   Legacy Dropbox ($49.99) · OTF Elite Vault ($129.99)
 * Selecting a tier opens the live membership page to complete signup.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import InAppCheckout from '../components/InAppCheckout';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../lib/theme';

type Tier = {
  name: string;
  tagline: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'Inner Circle',
    tagline: 'Start your journey',
    price: 'Free',
    period: '',
    features: [
      'Early drop notifications via email',
      'Access to the full editorial lookbook',
      'OTF style guides & editorial content',
      'Community access',
    ],
  },
  {
    name: 'OTF Member',
    tagline: 'For the culturally elite',
    price: '$9.99',
    period: '/mo',
    features: [
      '48-hour early drop access',
      'Exclusive member-only colorways',
      'Member discounts on all collections',
      'First-look content before anyone else',
      'Priority customer support',
    ],
  },
  {
    name: 'Certified Finest',
    tagline: 'The verified standard',
    price: '$24.99',
    period: '/mo',
    features: [
      '24-hour exclusive pre-drop access',
      'Certified Finest badge & recognition',
      'Free shipping on every order',
      'Annual exclusive gift drop',
      'Direct line to the brand team',
      'Archive member pieces',
    ],
    recommended: true,
  },
  {
    name: 'Legacy Dropbox',
    tagline: 'Curated street culture, delivered monthly',
    price: '$49.99',
    period: '/mo',
    features: [
      'Monthly curated merch drop shipped to your door',
      'Legacy-exclusive colorways never sold publicly',
      '72-hour early access before all other tiers',
      '15% discount on additional purchases',
      'Exclusive unboxing content & drop previews',
      'Dedicated style advisor',
    ],
  },
  {
    name: 'OTF Elite Vault',
    tagline: 'The pinnacle. The unreachable standard.',
    price: '$129.99',
    period: '/mo',
    features: [
      'First access to every drop — before all tiers',
      'Vault-exclusive digital lookbooks & unreleased content',
      '20% discount on all purchases',
      'Free shipping on every order, always',
      'Direct line to OTF brand founders',
      'Elite Vault badge & permanent recognition',
      'VIP invite to brand events & virtual drop reveals',
      'Quarterly curated physical box (~$75+ value)',
      'Annual exclusive premium archive gift',
    ],
  },
];

const MEMBERSHIP_URL = 'https://www.shoponlythefinest.com/membership';

// In-app: open the membership page inside the app (no Safari).

export default function MembershipScreen() {
  const [joinOpen, setJoinOpen] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const s = styles(theme);

  return (
    <>
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerEyebrow}>Exclusive Membership</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>
          The Inner{' '}
          <Text style={s.titleAccent}>Circle</Text>
        </Text>
        <Text style={s.sub}>
          The chosen don't wait in line. You either have access or you don't. Unlock drops before the world,
          member-only colorways, and the identity that comes with being first.
        </Text>

        {TIERS.map((tier) => (
          <View key={tier.name} style={[s.tierCard, tier.recommended && s.tierRecommended]}>
            {tier.recommended && (
              <View style={s.recommendedBadge}>
                <Text style={s.recommendedText}>RECOMMENDED</Text>
              </View>
            )}
            <View style={s.tierHead}>
              <View style={{ flex: 1 }}>
                <Text style={s.tierName}>{tier.name}</Text>
                <Text style={s.tierTagline}>{tier.tagline}</Text>
              </View>
              <View style={s.priceWrap}>
                <Text style={s.tierPrice}>{tier.price}</Text>
                {tier.period ? <Text style={s.tierPeriod}>{tier.period}</Text> : null}
              </View>
            </View>

            {tier.features.map((feature) => (
              <View key={feature} style={s.featureRow}>
                <Ionicons name="checkmark" size={14} color={theme.secondary} />
                <Text style={s.featureText}>{feature}</Text>
              </View>
            ))}

            <Pressable
              style={[s.selectBtn, tier.recommended && s.selectBtnGold]}
              onPress={() => setJoinOpen(true)}
            >
              <Text style={[s.selectText, tier.recommended && s.selectTextGold]}>Select {tier.name}</Text>
            </Pressable>
          </View>
        ))}

        <Text style={s.footNote}>
          Subscriptions are processed securely on shoponlythefinest.com. Manage or cancel anytime.
        </Text>
      </ScrollView>
    </SafeAreaView>
    <InAppCheckout url={joinOpen ? MEMBERSHIP_URL : null} onClose={() => setJoinOpen(false)} onComplete={() => {}} />
    </>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.abyss },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 4,
    },
    headerEyebrow: {
      color: t.textMuted,
      fontSize: 11,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      fontFamily: t.fontBodyMedium,
    },
    scroll: { flex: 1 },
    content: { paddingVertical: 18, paddingBottom: 120 },
    title: {
      color: t.text,
      fontSize: 38,
      lineHeight: 44,
      fontFamily: t.fontHeading,
      marginHorizontal: 20,
      marginBottom: 10,
    },
    titleAccent: { color: t.secondary, fontFamily: t.fontHeadingMedium },
    sub: { color: t.textMuted, fontSize: 13, lineHeight: 19, fontFamily: t.fontBody, marginHorizontal: 20, marginBottom: 26 },
    tierCard: {
      marginHorizontal: 20,
      marginBottom: 18,
      backgroundColor: t.surface,
      borderColor: t.border,
      borderWidth: 1,
      borderRadius: t.cardRadius,
      padding: 18,
    },
    tierRecommended: { borderColor: t.secondary, borderWidth: 1.5 },
    recommendedBadge: {
      position: 'absolute',
      top: -9,
      right: 16,
      backgroundColor: t.secondary,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    recommendedText: { color: '#0a0a0a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, fontFamily: t.fontBodyBold },
    tierHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
    tierName: { color: t.text, fontSize: 22, fontFamily: t.fontHeadingMedium, marginBottom: 3 },
    tierTagline: { color: t.textMuted, fontSize: 12, fontFamily: t.fontBody },
    priceWrap: { alignItems: 'flex-end' },
    tierPrice: { color: t.secondary, fontSize: 20, fontWeight: '700', fontFamily: t.fontBodyBold },
    tierPeriod: { color: t.textMuted, fontSize: 11, fontFamily: t.fontBody },
    featureRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', marginBottom: 8 },
    featureText: { color: t.textSecondary, fontSize: 12.5, lineHeight: 17, flex: 1, fontFamily: t.fontBody },
    selectBtn: {
      marginTop: 8,
      borderRadius: t.buttonRadius,
      borderWidth: 1,
      borderColor: t.border,
      paddingVertical: 12,
      alignItems: 'center',
    },
    selectBtnGold: { backgroundColor: t.secondary, borderColor: t.secondary },
    selectText: { color: t.text, fontSize: 13, fontWeight: '700', letterSpacing: 1, fontFamily: t.fontBodySemiBold },
    selectTextGold: { color: '#0a0a0a' },
    footNote: {
      color: t.textTertiary,
      fontSize: 11,
      lineHeight: 16,
      fontFamily: t.fontBody,
      marginHorizontal: 20,
      marginTop: 4,
      textAlign: 'center',
    },
  });
