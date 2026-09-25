import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NivvaIcon, type NivvaIconName, useNivvaTheme } from "@/core/design-system";

const tabs: { name: "index" | "analytics" | "wallet" | "goals" | "profile"; title: string; icon: NivvaIconName }[] = [
  { name: "index", title: "Início", icon: "home" },
  { name: "analytics", title: "Análises", icon: "analytics" },
  { name: "wallet", title: "Carteira", icon: "account-balance-wallet" },
  { name: "goals", title: "Metas", icon: "flag" },
  { name: "profile", title: "Perfil", icon: "person" },
];

export default function TabsLayout() {
  const theme = useNivvaTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          height: theme.layout.bottomBarHeight + insets.bottom,
          paddingTop: theme.spacing.xs,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: theme.typography.caption,
        tabBarHideOnKeyboard: true,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ color, size }) => <NivvaIcon name={tab.icon} color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
