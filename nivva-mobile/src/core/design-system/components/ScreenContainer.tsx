import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNivvaTheme } from "../theme/ThemeProvider";

export function ScreenContainer({ children }: { children: ReactNode }) {
  const theme = useNivvaTheme();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: theme.layout.contentMaxWidth,
          alignSelf: "center",
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
