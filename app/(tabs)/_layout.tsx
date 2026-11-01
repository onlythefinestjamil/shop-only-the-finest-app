/**
 * Tab layout — Shop / Cart / Profile with clean minimal TabBar.
 */

import { Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      tabBar={() => <TabBar />}
    >
      <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
