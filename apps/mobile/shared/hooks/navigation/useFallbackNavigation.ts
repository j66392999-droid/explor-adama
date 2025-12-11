import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

type Params = Record<string, any> | undefined;

export function useFallbackNavigation(navigationProp?: any) {
  // Call both hooks unconditionally so rules-of-hooks are satisfied
  const router = useRouter();
  const nav = useNavigation<any>();

  if (navigationProp) return navigationProp;

  function navigate(nameOrPath: string, params?: Params) {
    const mapping: Record<string, string> = {
      Register: '/(auth)/register',
      Login: '/(auth)/login',
      Verification: '/(auth)/verify-email',
      Home: '/(app)/(tabs)',
      Profile: '/(app)/(tabs)/profile',
      Search: '/(app)/(tabs)/',
      PlaceDetail: '/(app)/(tabs)/place',
      EventDetail: '/(app)/(tabs)/event',
      Booking: '/(app)/(tabs)/booking',
      Favorites: '/(app)/(tabs)/favorites',
      // Add more mapping entries as needed
    };

    // If caller passed a full path (starts with /), prefer router
    if (typeof nameOrPath === 'string' && nameOrPath.startsWith('/')) {
      if (router && typeof router.push === 'function') {
        if (params && Object.keys(params).length) {
          const qs = new URLSearchParams(params as any).toString();
          return router.push(`${nameOrPath}?${qs}` as any);
        }
        return router.push(nameOrPath as any);
      }

      // try nav.navigate with the raw path as fallback
      if (nav && typeof nav.navigate === 'function') return nav.navigate(nameOrPath as any, params);
      return;
    }

    const mapped = mapping[nameOrPath] || `/${nameOrPath}`;

    // Prefer react-navigation when available for named routes
    if (nav && typeof nav.navigate === 'function') return nav.navigate(nameOrPath as any, params);

    // Otherwise use expo-router
    if (router && typeof router.push === 'function') {
      if (params && Object.keys(params).length) {
        const qs = new URLSearchParams(params as any).toString();
        return router.push(`${mapped}?${qs}` as any);
      }
      return router.push(mapped as any);
    }
  }

  function goBack() {
    if (nav && typeof nav.goBack === 'function') return nav.goBack();
    if (router && typeof router.back === 'function') return router.back();
  }

  return {
    navigate,
    goBack,
    push: (path: string) => (router && router.push ? router.push(path as any) : nav?.navigate?.(path as any)),
  } as any;
}

export default useFallbackNavigation;
