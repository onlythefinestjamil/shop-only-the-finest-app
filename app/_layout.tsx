/**
 * Root layout — providers + stack navigator.
 * Loads the site fonts (Cormorant Garamond + Space Grotesk), holds the
 * splash until ready.
 * ThemeProvider → AuthProvider → CartProvider → CatalogProvider → Stack
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { ThemeProvider, appFonts } from '../lib/theme';
import { AuthProvider } from '../lib/authContext';
import { CartProvider } from '../lib/cartContext';
import { CatalogProvider } from '../lib/catalogContext';

SplashScreen.preventAutoHideAsync().catch(() => { /* already hidden — fine */ });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => { /* no-op */ });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // keep native splash visible while fonts load
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <CatalogProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                presentation: 'card',
                contentStyle: { backgroundColor: '#0a0a0a' },
              }}
            />
          </CatalogProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
