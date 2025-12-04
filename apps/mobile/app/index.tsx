import { Redirect } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { useAppSelector } from "@/shared/hooks/state/useAppSelector"

export default function Index() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const isLoading = useAppSelector((state) => state.auth.isLoading)

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  const redirectPath = isAuthenticated ? "/(app)/(tabs)" : "/(app)/(tabs)"

  return <Redirect href={redirectPath as any} />
}
