import { Redirect } from 'expo-router';

/** Root route redirects to the Shop tab. */
export default function Index() {
  return <Redirect href="/shop" />;
}
