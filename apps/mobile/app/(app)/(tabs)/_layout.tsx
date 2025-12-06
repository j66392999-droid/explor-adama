import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/hooks/ui/useTheme";
import responsive from "../../../shared/utils/responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import { BottomTabsProvider } from "../../../shared/hooks/ui/useBottomTabs";
import { TabBar } from "../../../components/navigation/TabBar";

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();


  const TAB_HEIGHT = responsive.scaleTabBarHeight(); 
  const ICON_SIZE = responsive.scaleIcon(24);
  const CENTER_ICON_SIZE = responsive.scaleIcon(28); 
  const LABEL_FONT = responsive.scaleFont(12);

  return (
    <BottomTabsProvider>
      <Tabs
        tabBar={(props: any) => <TabBar {...props} />}
        screenOptions={{
        headerShown: false,

        tabBarHideOnKeyboard: false,
        tabBarShowLabel: false,

        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,


        // Make the native Tabs bar not reserve space: our custom TabBar overlays absolutely.
        tabBarStyle: {
          height: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: 0,
          paddingTop: 0,
        },

        tabBarLabelStyle: {
          fontSize: LABEL_FONT,
          fontWeight: "500",
        },

        tabBarIconStyle: {
          marginTop: responsive.scale(2),
        },
      }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* Center Button (+) */}
      <Tabs.Screen
        name="blog"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: responsive.scale(-4), // lifts the button slightly
              }}
            >
              <Ionicons
                name="add"
                size={CENTER_ICON_SIZE}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="notifications"
              size={ICON_SIZE}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      </Tabs>
    </BottomTabsProvider>
  );
}
