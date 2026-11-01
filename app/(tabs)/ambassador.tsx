/**
 * Ambassador tab — hub for the brand's community programs.
 * Ambassador program, Inner Circle, Membership, and Affiliate dashboard —
 * each opens the matching live site section in the browser.
 */

import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';
import { useRouter } from 'expo-router';

const SECTIONS = [
  {
    icon: 'ribbon',
    title: 'Become an Ambassador',
    sub: 'Represent Only The Finest. Perks, drops first, and a commission on every sale you bring in.',
    url: 'https://www.shoponlythefinest.com/ambassador',
    featured: true,
  },
  {
    icon: 'diamond',
    title: 'Inner Circle',
    sub: 'The private community — early access, exclusives, and members-only content.',
    url: 'https://www.shoponlythefinest.com/inner-circle',
  },
  {
    icon: 'card',
    title: 'Membership',
    sub: 'The Inner Circle — five tiers from Free to the Elite Vault.',
    route: '/membership',
  },
  {
    icon: 'trending-up',
    title: 'Affiliate Dashboard',
    sub: 'Track your links, referrals, and payouts in real time.',
    url: 'https://www.shoponlythefinest.com/affiliate-dashboard',
  },
];

export default function AmbassadorScreen() {
  const theme = useTheme();
  const router = useRouter();
  const s = styles(theme);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.headerTitle}>Ambassador</Text>
        <Text style={s.headerSub}>Membership is proximity. Join the circle.</Text>

        {SECTIONS.map((section) => (
          <Pressable
            key={section.title}
            style={[s.card, section.featured && s.cardFeatured]}
            onPress={() => (section.route ? router.push(section.route as never) : Linking.openURL(section.url!))}
          >
            <View style={[s.iconWrap, section.featured && s.iconWrapFeatured]}>
              <Ionicons name={section.icon as never} size={section.featured ? 24 : 20} color={theme.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{section.title}</Text>
              <Text style={s.cardSub}>{section.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.abyss },
    scroll: { flex: 1 },
    content: { paddingVertical: 24, paddingBottom: 120 },
    headerTitle: {
      color: t.text,
      fontSize: 28,
      fontWeight: '700',
      fontFamily: t.fontBodyBold,
      marginHorizontal: 20,
      marginBottom: 4,
    },
    headerSub: { color: t.textMuted, fontSize: 13, fontFamily: t.fontBody, marginHorizontal: 20, marginBottom: 24 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: t.surface,
      borderColor: t.border,
      borderWidth: 1,
      borderRadius: t.cardRadius,
      padding: 16,
    },
    cardFeatured: { borderColor: t.secondary, borderWidth: 1.5 },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: `${t.secondary}14`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapFeatured: { width: 50, height: 50, borderRadius: 14 },
    cardTitle: { color: t.text, fontSize: 15, fontWeight: '600', fontFamily: t.fontBodySemiBold, marginBottom: 3 },
    cardSub: { color: t.textMuted, fontSize: 12.5, lineHeight: 17, fontFamily: t.fontBody },
  });
