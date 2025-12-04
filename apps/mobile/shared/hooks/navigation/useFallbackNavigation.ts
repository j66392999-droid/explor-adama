import { useRouter } from 'expo-router';

type Params = Record<string, any> | undefined;

export function useFallbackNavigation(navigationProp?: any) {
  const router = useRouter();

  if (navigationProp) return navigationProp;

  function navigate(name: string, params?: Params) {
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

    const path = mapping[name] || mapping[name as any as string] || `/${name}`;

    // If params provided, append query string
    if (params && Object.keys(params).length) {
      const qs = new URLSearchParams(params as any).toString();
      router.push(`${path}?${qs}`);
    } else {
      router.push(path);
    }
  }

  function goBack() {
    router.back();
  }

  return {
    navigate,
    goBack,
    push: (path: string) => router.push(path),
  } as any;
}

export default useFallbackNavigation;
