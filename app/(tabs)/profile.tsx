/**
 * Profile — customer accounts (sign in / register / OTP verify) and order
 * history. Auth goes through Base44. Order history is fetched from Base44
 * entities (Orders) when the user is signed in; shows an empty state otherwise.
 */

import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';
import { useAuth } from '../../lib/authContext';
import { getBase44Client } from '../../lib/base44';
import { GridOverlay } from '../../components/GridOverlay';
import { CornerBrackets } from '../../components/CornerBrackets';
import { GlassCard } from '../../components/GlassCard';
import { GlowButton } from '../../components/GlowButton';
import { SectionHeader } from '../../components/SectionHeader';
import { CATALOG_URL } from '../../lib/config';

type Mode = 'login' | 'register' | 'otp' | 'reset';

interface Order {
  id: string;
  number: string;
  total: number;
  status: string;
  date: string;
  items: number;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const s = styles(theme);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setBusy(true);
    try {
      await auth.login(email, password);
    } catch {
      /* error surfaced in auth.error */
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) return;
    setBusy(true);
    try {
      await auth.register(email, password);
      setMode('otp');
    } catch {
      /* error surfaced */
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!email || !otp || !password) return;
    setBusy(true);
    try {
      await auth.verifyOtp(email, otp, password);
    } catch {
      /* error surfaced */
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await auth.resendOtp(email);
    } catch {
      /* ignore */
    }
  };

  const handleReset = async () => {
    if (!email) return;
    setBusy(true);
    try {
      await auth.requestPasswordReset(email);
      setMode('login');
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    setOrders([]);
    setMode('login');
  };

  // Fetch order history once signed in.
  React.useEffect(() => {
    if (auth.status !== 'signed_in') {
      setOrders([]);
      return;
    }
    let active = true;
    setOrdersLoading(true);
    (async () => {
      const client = getBase44Client();
      try {
        const list = await client.entities.Orders.list('-created_date', 20);
        if (!active) return;
        const mapped = (list as Record<string, unknown>[]).map((o) => ({
          id: String(o.id ?? ''),
          number: String(o.order_number ?? o.number ?? '—'),
          total: typeof o.total_price === 'number' ? o.total_price : 0,
          status: String(o.fulfillment_status ?? o.status ?? 'Processing'),
          date: String(o.created_date ?? o.created_at ?? ''),
          items: typeof o.item_count === 'number' ? o.item_count : 0,
        }));
        setOrders(mapped);
      } catch {
        // Orders entity may not exist yet — show empty state.
        setOrders([]);
      } finally {
        if (active) setOrdersLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [auth.status]);

  // Signed-in view
  if (auth.status === 'signed_in' && auth.user) {
    const u = auth.user;
    return (
      <View style={s.screen}>
        <GridOverlay opacity={0.4} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Text style={s.eyebrow}>MEMBER</Text>
            <Text style={s.title}>Profile</Text>
          </View>

          <GlassCard variant="elevated" cornerBrackets glow="medium" style={{ marginHorizontal: 20 }} >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{(u.full_name || u.email || 'U').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{u.full_name || 'Only The Finest Member'}</Text>
                <Text style={s.userEmail} numberOfLines={1}>{u.email}</Text>
              </View>
              <View style={[s.verifiedPill, u.is_verified ? { borderColor: theme.success } : { borderColor: theme.warning }]}>
                <Ionicons name={u.is_verified ? 'checkmark-circle' : 'time'} size={12} color={u.is_verified ? theme.success : theme.warning} />
                <Text style={[s.verifiedText, { color: u.is_verified ? theme.success : theme.warning }]}>{u.is_verified ? 'Verified' : 'Pending'}</Text>
              </View>
            </View>
            <View style={s.statRow}>
              <View style={s.stat}>
                <Text style={s.statValue}>{orders.length}</Text>
                <Text style={s.statLabel}>Orders</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.stat}>
                <Text style={s.statValue}>{u.role || 'Member'}</Text>
                <Text style={s.statLabel}>Tier</Text>
              </View>
            </View>
          </GlassCard>

          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <SectionHeader title="Order History" eyebrow="YOUR PURCHASES" />
            {ordersLoading ? (
              <View style={s.ordersLoading}>
                <ActivityIndicator color={theme.primary} />
                <Text style={s.loadingText}>Loading orders…</Text>
              </View>
            ) : orders.length === 0 ? (
              <GlassCard variant="inset" style={{ marginTop: 8, alignItems: 'center', paddingVertical: 28 }}>
                <Ionicons name="cube-outline" size={40} color={theme.textMuted} />
                <Text style={s.emptyOrdersTitle}>No orders yet</Text>
                <Text style={s.emptyOrdersSub}>Your purchases will appear here.</Text>
                <Pressable style={s.shopLink} onPress={() => Linking.openURL(CATALOG_URL).catch(() => {})}>
                  <Text style={s.shopLinkText}>Shop the catalog →</Text>
                </Pressable>
              </GlassCard>
            ) : (
              <View style={{ gap: 10, marginTop: 8 }}>
                {orders.map((o) => (
                  <GlassCard key={o.id} variant="inset" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={s.orderNumber}>#{o.number}</Text>
                      <Text style={s.orderDate}>{o.date ? new Date(o.date).toLocaleDateString() : '—'}</Text>
                      <Text style={s.orderItems}>{o.items} items · {o.status}</Text>
                    </View>
                    <Text style={s.orderTotal}>${o.total.toFixed(2)}</Text>
                  </GlassCard>
                ))}
              </View>
            )}
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <GlowButton label="Sign Out" icon="log-out-outline" variant="ghost" onPress={handleLogout} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Signed-out / auth views
  return (
    <View style={s.screen}>
      <GridOverlay opacity={0.5} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 120, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={s.brandMark}>
          <View style={s.logoRing}>
            <Text style={s.logoText}>OTF</Text>
          </View>
        </View>
        <Text style={s.eyebrowCenter}>ONLY THE FINEST</Text>
        <Text style={s.authTitle}>
          {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join The Culture' : mode === 'otp' ? 'Verify Your Email' : 'Reset Password'}
        </Text>
        <Text style={s.authSub}>
          {mode === 'login'
            ? 'Sign in to your account to track orders and unlock member access.'
            : mode === 'register'
              ? 'Create an account to join the finest. Crafted for the chosen.'
              : mode === 'otp'
                ? 'Enter the code we sent to your email to complete registration.'
                : 'Enter your email and we’ll send you a reset link.'}
        </Text>

        <GlassCard variant="elevated" cornerBrackets glow="subtle" style={{ marginTop: 20 }}>
          {mode !== 'otp' && mode !== 'reset' && (
            <>
              <Text style={s.inputLabel}>EMAIL</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={theme.textMuted} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
              <Text style={s.inputLabel}>PASSWORD</Text>
              <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={theme.textMuted} secureTextEntry autoCapitalize="none" autoCorrect={false} />
            </>
          )}
          {mode === 'otp' && (
            <>
              <Text style={s.inputLabel}>EMAIL</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={theme.textMuted} autoCapitalize="none" keyboardType="email-address" />
              <Text style={s.inputLabel}>VERIFICATION CODE</Text>
              <TextInput style={s.input} value={otp} onChangeText={setOtp} placeholder="6-digit code" placeholderTextColor={theme.textMuted} keyboardType="number-pad" autoCapitalize="none" />
              <Text style={s.inputLabel}>PASSWORD</Text>
              <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor={theme.textMuted} secureTextEntry />
            </>
          )}
          {mode === 'reset' && (
            <>
              <Text style={s.inputLabel}>EMAIL</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={theme.textMuted} autoCapitalize="none" keyboardType="email-address" />
            </>
          )}

          {auth.error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={14} color={theme.error} />
              <Text style={s.errorText}>{auth.error}</Text>
            </View>
          ) : null}

          {mode === 'login' && (
            <>
              <GlowButton label="Sign In" icon="enter" onPress={handleLogin} loading={busy} style={{ marginTop: 16 }} />
              <View style={s.authSwitchRow}>
                <Pressable onPress={() => setMode('register')}><Text style={s.authSwitchText}>Create account</Text></Pressable>
                <Pressable onPress={() => setMode('reset')}><Text style={s.authSwitchText}>Forgot password?</Text></Pressable>
              </View>
            </>
          )}
          {mode === 'register' && (
            <>
              <GlowButton label="Create Account" icon="person-add" onPress={handleRegister} loading={busy} style={{ marginTop: 16 }} />
              <View style={s.authSwitchRow}>
                <Pressable onPress={() => setMode('login')}><Text style={s.authSwitchText}>← Back to sign in</Text></Pressable>
              </View>
            </>
          )}
          {mode === 'otp' && (
            <>
              <GlowButton label="Verify & Sign In" icon="shield-checkmark" onPress={handleVerify} loading={busy} style={{ marginTop: 16 }} />
              <View style={s.authSwitchRow}>
                <Pressable onPress={handleResend}><Text style={s.authSwitchText}>Resend code</Text></Pressable>
                <Pressable onPress={() => setMode('login')}><Text style={s.authSwitchText}>← Back</Text></Pressable>
              </View>
            </>
          )}
          {mode === 'reset' && (
            <>
              <GlowButton label="Send Reset Link" icon="mail" onPress={handleReset} loading={busy} style={{ marginTop: 16 }} />
              <View style={s.authSwitchRow}>
                <Pressable onPress={() => setMode('login')}><Text style={s.authSwitchText}>← Back to sign in</Text></Pressable>
              </View>
            </>
          )}
        </GlassCard>

        <Text style={s.authFooter}>By continuing you agree to the Only The Finest Terms & Privacy Policy.</Text>
      </ScrollView>
    </View>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.abyss },
    header: { paddingHorizontal: 20, marginBottom: 18 },
    eyebrow: { color: t.secondary, letterSpacing: 3, fontWeight: '800', fontSize: 11 },
    title: { color: t.text, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 6 },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center', shadowColor: t.primary, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 },
    avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
    userName: { color: t.text, fontSize: 18, fontWeight: '800' },
    userEmail: { color: t.textMuted, fontSize: 13, marginTop: 2 },
    verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    verifiedText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    statRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: t.borderSubtle },
    stat: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, height: 30, backgroundColor: t.borderSubtle },
    statValue: { color: t.text, fontSize: 20, fontWeight: '900' },
    statLabel: { color: t.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
    ordersLoading: { alignItems: 'center', gap: 10, paddingVertical: 30 },
    loadingText: { color: t.textMuted, fontSize: 13 },
    emptyOrdersTitle: { color: t.text, fontSize: 16, fontWeight: '700', marginTop: 10 },
    emptyOrdersSub: { color: t.textMuted, fontSize: 13, marginTop: 2 },
    shopLink: { marginTop: 12, padding: 8 },
    shopLinkText: { color: t.primary, fontSize: 13, fontWeight: '800' },
    orderNumber: { color: t.text, fontSize: 15, fontWeight: '800' },
    orderDate: { color: t.textMuted, fontSize: 12, marginTop: 2 },
    orderItems: { color: t.textSecondary, fontSize: 11, marginTop: 2 },
    orderTotal: { color: t.primary, fontSize: 18, fontWeight: '900' },
    brandMark: { alignItems: 'center', marginBottom: 16 },
    logoRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: t.primary, alignItems: 'center', justifyContent: 'center', shadowColor: t.primary, shadowOpacity: 0.4, shadowRadius: 18, elevation: 10 },
    logoText: { color: t.primary, fontSize: 26, fontWeight: '900', letterSpacing: 2 },
    eyebrowCenter: { color: t.secondary, letterSpacing: 4, fontWeight: '800', fontSize: 11, textAlign: 'center' },
    authTitle: { color: t.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', marginTop: 8 },
    authSub: { color: t.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, paddingHorizontal: 12 },
    inputLabel: { color: t.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginTop: 14, marginBottom: 6 },
    input: { backgroundColor: t.surfaceMuted, borderColor: t.border, borderWidth: 1, borderRadius: t.buttonRadius, paddingHorizontal: 14, paddingVertical: 13, color: t.text, fontSize: 15, fontWeight: '600' },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${t.error}18`, borderColor: `${t.error}44`, borderWidth: 1, borderRadius: t.buttonRadius, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14 },
    errorText: { color: t.error, fontSize: 12, fontWeight: '600', flex: 1 },
    authSwitchRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingHorizontal: 4 },
    authSwitchText: { color: t.secondary, fontSize: 13, fontWeight: '700' },
    authFooter: { color: t.textTertiary, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 20 },
  });
