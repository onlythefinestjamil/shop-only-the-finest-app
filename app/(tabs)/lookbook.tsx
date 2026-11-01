/**
 * Lookbook tab — visual hub for the store's lookbook and brand story.
 * Opens the live site sections (Lookbook, About) in the browser.
 */

import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';

const SECTIONS = [
  {
    icon: 'book',
    title: 'The Lookbook',
    sub: 'Seasonal editorials, campaigns, and styling from Only The Finest.',
    url: 'https://www.shoponlythefinest.com/lookbook',
    featured: true,
  },
  {
    icon: 'images',
    title: 'Design Studio',
    sub: 'Make your own designs — AI tools, custom merch, community gallery.',
    url: 'https://www.shoponlythefinest.com/design-studio',
  },
  {
    icon: 'information-circle',
    title: 'About the Brand',
    sub: 'The story behind Only The Finest. Crafted for the Chosen.',
    url: 'https://www.shoponlythefinest.com/about',
  },
  {
    icon: 'help-circle',
    title: 'FAQ',
    sub: 'Sizing, shipping, returns — everything you need to know.',
    url: 'https://www.shoponlythefinest.com/faq',
  },
];

export default function LookbookScreen() {
  const theme = useTheme();
  const s = styles(theme);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.headerTitle}>Lookbook</Text>
        <Text style={s.headerSub}>Campaigns, editorials & the world of Only The Finest.</Text>

        {SECTIONS.map((section) => (
          <Pressable
            key={section.title}
            style={[s.card, section.featured && s.cardFeatured]}
            onPress={() => Linking.openURL(section.url)}
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
