/**
 * Root layout — providers + stack navigator.
 * ThemeProvider → AuthProvider → CartProvider → CatalogProvider → Stack
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../lib/theme';
import { AuthProvider } from '../lib/authContext';
import { CartProvider } from '../lib/cartContext';
import { CatalogProvider } from '../lib/catalogContext';

export default function RootLayout() {
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
                contentStyle: { backgroundColor: '#06040D' },
              }}
            />
          </CatalogProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
