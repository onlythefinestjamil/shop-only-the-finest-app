/**
 * Dynamic app config — swaps the app icon / bundle id by EAS build profile.
 *   production  → main storefront build (App Store / Play Store)
 *   preview     → standalone internal-testing build
 *   development → dev client build
 */
export default ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const isStandalone = profile === 'preview';
  const isProduction = profile === 'production';

  const icon = isProduction
    ? './assets/icon.png'
    : isStandalone
      ? './assets/adaptive-icon.png'
      : './assets/icon.png';

  return {
    ...config,
    icon,
    splash: { ...config.splash, image: icon },
    ios: {
      ...config.ios,
      bundleIdentifier: isStandalone
        ? 'com.onlythefinest.shop.standalone'
        : 'com.onlythefinest.shop',
    },
    android: {
      ...config.android,
      package: isStandalone
        ? 'com.onlythefinest.shop.standalone'
        : 'com.onlythefinest.shop',
    },
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        projectId: process.env.EAS_PROJECT_ID || config.extra?.eas?.projectId || '',
      },
    },
  };
};
